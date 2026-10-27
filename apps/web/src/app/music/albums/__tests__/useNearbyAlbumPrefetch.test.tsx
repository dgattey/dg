import { act, renderHook } from '@testing-library/react';
import { albumDetailFor, hasAlbumDetail } from '../albumDetailCache';
import {
  NEARBY_PREFETCH_BUDGET,
  NEARBY_PREFETCH_SETTLE_MS,
  useNearbyAlbumPrefetch,
} from '../useNearbyAlbumPrefetch';

jest.mock('../albumDetailCache', () => ({
  albumDetailFor: jest.fn(),
  hasAlbumDetail: jest.fn(),
}));

type Observed = { callback: IntersectionObserverCallback; disconnect: jest.Mock };

let observer: Observed | undefined;
let pending: Array<() => void> = [];
const started = new Set<string>();

class FakeIntersectionObserver {
  readonly disconnect = jest.fn();
  constructor(callback: IntersectionObserverCallback) {
    observer = { callback, disconnect: this.disconnect };
  }
  observe() {}
}

const cells = (count: number) =>
  new Map(
    Array.from({ length: count }, (_, i) => [`album-${i}`, document.createElement('div')] as const),
  );

const renderPrefetch = (items: Map<string, HTMLElement>) =>
  renderHook(() => useNearbyAlbumPrefetch({ current: items }));

const scrollNear = (items: Map<string, HTMLElement>, ids: Array<string>, near = true) => {
  act(() => {
    observer?.callback(
      ids.map(
        (id) =>
          ({ isIntersecting: near, target: items.get(id) as Element }) as IntersectionObserverEntry,
      ),
      {} as IntersectionObserver,
    );
  });
};

const settle = () =>
  act(async () => {
    await jest.advanceTimersByTimeAsync(NEARBY_PREFETCH_SETTLE_MS);
  });

const finishNextRequest = () =>
  act(async () => {
    pending.shift()?.();
    await Promise.resolve();
  });

beforeEach(() => {
  jest.useFakeTimers();
  observer = undefined;
  pending = [];
  started.clear();
  Object.defineProperty(window, 'IntersectionObserver', {
    configurable: true,
    value: FakeIntersectionObserver,
  });
  jest.mocked(hasAlbumDetail).mockImplementation((id) => started.has(id));
  jest.mocked(albumDetailFor).mockImplementation((id) => {
    started.add(id);
    return new Promise((resolve) => {
      pending.push(() => resolve(null));
    });
  });
});

afterEach(() => {
  jest.useRealTimers();
  jest.mocked(albumDetailFor).mockReset();
  Reflect.deleteProperty(window, 'IntersectionObserver');
});

describe('useNearbyAlbumPrefetch', () => {
  it('waits for scrolling to settle, then loads nearby albums one at a time', async () => {
    const items = cells(3);
    renderPrefetch(items);

    scrollNear(items, ['album-0', 'album-1']);
    expect(albumDetailFor).not.toHaveBeenCalled();

    await settle();
    expect(jest.mocked(albumDetailFor).mock.calls).toEqual([['album-0']]);

    await finishNextRequest();
    expect(jest.mocked(albumDetailFor).mock.calls).toEqual([['album-0'], ['album-1']]);

    await finishNextRequest();
    expect(albumDetailFor).toHaveBeenCalledTimes(2);
  });

  it('loads nothing for albums scrolled past before settling', async () => {
    const items = cells(2);
    renderPrefetch(items);

    scrollNear(items, ['album-0', 'album-1']);
    scrollNear(items, ['album-0', 'album-1'], false);
    await settle();

    expect(albumDetailFor).not.toHaveBeenCalled();
  });

  it('stops after its budget and never counts albums that already loaded', async () => {
    const items = cells(NEARBY_PREFETCH_BUDGET + 3);
    started.add('album-0');
    renderPrefetch(items);

    scrollNear(items, [...items.keys()]);
    await settle();
    for (let i = 0; i < NEARBY_PREFETCH_BUDGET + 2; i += 1) {
      await finishNextRequest();
    }

    expect(albumDetailFor).toHaveBeenCalledTimes(NEARBY_PREFETCH_BUDGET);
    expect(albumDetailFor).not.toHaveBeenCalledWith('album-0');
    expect(albumDetailFor).toHaveBeenLastCalledWith(`album-${NEARBY_PREFETCH_BUDGET}`);
  });

  it('stops watching when the grid unmounts', async () => {
    const items = cells(1);
    const { unmount } = renderPrefetch(items);

    scrollNear(items, ['album-0']);
    unmount();
    await settle();

    expect(observer?.disconnect).toHaveBeenCalled();
    expect(albumDetailFor).not.toHaveBeenCalled();
  });
});
