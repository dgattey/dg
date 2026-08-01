import { NextRequest } from 'next/server';
import { isNextFlightRequest } from '../isNextFlightRequest';

const createRequest = (headers: Record<string, string> = {}) =>
  new NextRequest('https://example.com/', { headers });

describe('isNextFlightRequest', () => {
  it('detects Accept: text/x-component without Flight headers', () => {
    expect(isNextFlightRequest(createRequest({ accept: 'text/x-component' }))).toBe(true);
  });

  it('detects rsc / prefetch headers when present', () => {
    expect(isNextFlightRequest(createRequest({ rsc: '1' }))).toBe(true);
    expect(isNextFlightRequest(createRequest({ 'next-router-prefetch': '1' }))).toBe(true);
    expect(isNextFlightRequest(createRequest({ purpose: 'prefetch' }))).toBe(true);
  });

  it('returns false for normal document Accept', () => {
    expect(isNextFlightRequest(createRequest({ accept: 'text/html' }))).toBe(false);
    expect(isNextFlightRequest(createRequest({ accept: 'application/pdf' }))).toBe(false);
  });
});
