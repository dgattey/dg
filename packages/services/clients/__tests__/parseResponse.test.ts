import { log } from '@dg/shared-core/helpers/log';
import * as v from 'valibot';
import { parseResponse } from '../parseResponse';

describe('parseResponse', () => {
  beforeEach(() => {
    jest.spyOn(log, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns parsed output for valid payloads', () => {
    const schema = v.object({ ok: v.boolean() });
    const output = parseResponse(schema, { ok: true }, { kind: 'rest', source: 'test' });
    expect(output).toEqual({ ok: true });
  });

  it('throws for invalid payloads', () => {
    const schema = v.object({ ok: v.boolean() });
    expect(() =>
      parseResponse(schema, { ok: 'nope' }, { kind: 'graphql', source: 'test' }),
    ).toThrow(/Invalid graphql response/);
  });
});
