import { log } from '@dg/shared-core/logging/log';
import * as v from 'valibot';
import { getStatus } from '../authenticatedRestClient';
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

describe('getStatus', () => {
  beforeEach(() => {
    jest.spyOn(log, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('extracts numeric and string HTTP statuses from responses and nested error objects', () => {
    expect(getStatus(200)).toBe(200);
    expect(getStatus('429')).toBe(429);
    expect(getStatus({ status: 404 })).toBe(404);
    expect(getStatus({ status: { status: '503' } })).toBe(503);
  });

  it('returns 500 and logs an error when a network or timeout error has no status', () => {
    const timeoutError = new Error('The operation was aborted due to timeout');
    expect(getStatus(timeoutError)).toBe(500);
    expect(log.error).toHaveBeenCalledWith('Could not parse status', { resp: timeoutError });
    expect(getStatus(null)).toBe(500);
  });
});
