/**
 * @jest-environment node
 */
import { Box, GlobalStyles } from '@mui/material';
import { ServerInsertedHTMLContext } from 'next/navigation';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import { EmotionStyleRegistry } from '../EmotionStyleRegistry';

/** One request's inserted-HTML channel, shared by every render that uses it. */
function createChannel() {
  const callbacks: Array<() => ReactNode> = [];
  const addInsertedHtml = (callback: () => ReactNode) => {
    callbacks.push(callback);
  };
  return {
    flushToHead: () => renderToString(callbacks.map((callback) => callback())),
    render: (children: ReactNode) =>
      renderToString(
        <ServerInsertedHTMLContext.Provider value={addInsertedHtml}>
          <EmotionStyleRegistry>{children}</EmotionStyleRegistry>
        </ServerInsertedHTMLContext.Provider>,
      ),
  };
}

const page = (
  <>
    <GlobalStyles styles={{ body: { margin: 0 } }} />
    <Box sx={{ color: 'red' }}>Hi</Box>
  </>
);

function count(html: string, search: string) {
  return html.split(search).length - 1;
}

describe('EmotionStyleRegistry', () => {
  it('streams global and component styles in mui style tags', () => {
    const channel = createChannel();
    channel.render(page);
    const head = channel.flushToHead();
    expect(count(head, 'data-emotion="mui-global ')).toBe(1);
    expect(count(head, 'data-emotion="mui ')).toBe(1);
    expect(count(head, 'color:red')).toBe(1);
  });

  it('streams each style once when two renders share a request', () => {
    const channel = createChannel();
    channel.render(page);
    channel.render(page);
    const head = channel.flushToHead();
    expect(count(head, 'margin:0')).toBe(1);
    expect(count(head, 'color:red')).toBe(1);
  });

  it('streams styles for every request', () => {
    const first = createChannel();
    const second = createChannel();
    first.render(page);
    second.render(page);
    expect(count(first.flushToHead(), 'color:red')).toBe(1);
    expect(count(second.flushToHead(), 'color:red')).toBe(1);
  });
});
