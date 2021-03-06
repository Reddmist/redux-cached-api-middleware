import { validateCacheModule } from '../__tests__/utils';
import * as ttl from './ttl';

const { buildStrategy, type, shouldFetch } = ttl;

describe('buildStrategy', () => {
  it('should build a valid strategy', () => {
    expect(buildStrategy({ ttl: 15 })).toEqual({ ttl: 15, type });
  });
});

describe('shouldFetch', () => {
  const now = Date.now();
  jest.spyOn(Date, 'now').mockImplementation(() => now);

  it('should be a valid module', () => {
    validateCacheModule(ttl);
  });

  it('should fetch if no state or strategy', () => {
    expect(shouldFetch({})).toBe(true);
    expect(shouldFetch({ state: { fetching: true } })).toBe(true);
    expect(shouldFetch({ strategy: buildStrategy({ ttl: 100 }) })).toBe(true);
  });

  it('should not fetch if it is fetching', () => {
    expect(
      shouldFetch({
        state: { fetching: true },
        strategy: buildStrategy({ ttl: 100 }),
      })
    ).toBe(false);
  });

  it('should not fetch if it has already fetched and TTL not reached', () => {
    expect(
      shouldFetch({
        state: { fetched: true, timestamp: now - 99 },
        strategy: buildStrategy({ ttl: 100 }),
      })
    ).toBe(false);
  });

  it('should fetch if it has already fetched and TTL is reached', () => {
    expect(
      shouldFetch({
        state: { fetched: true, timestamp: now - 100 },
        strategy: buildStrategy({ ttl: 100 }),
      })
    ).toBe(true);
  });

  it('should fetch if it has already fetched and TTL is exceeded', () => {
    expect(
      shouldFetch({
        state: { fetched: true, timestamp: now - 101 },
        strategy: buildStrategy({ ttl: 100 }),
      })
    ).toBe(true);
  });
});
