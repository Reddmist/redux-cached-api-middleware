import { RSAA } from 'redux-api-middleware';

import cacheStrategies from './cache';
import config from './config';
import * as types from './actionTypes';
import * as selectors from './selectors';

export const invalidateCache = () => ({ type: types.INVALIDATE_CACHE });

export const callAPI = ({ cache, ...restOptions }) => async (
  dispatch,
  getState
) => {
  const action = Object.assign(
    { types: [] },
    config.DEFAULT_EVENT,
    restOptions
  );

  if (cache && cache.key) {
    const cacheStrategy = cache.strategy || config.DEFAULT_CACHE_STRATEGY;
    const keyState = selectors.getKeyState(getState(), cache.key);
    action.types = [
      { type: types.FETCH_START, meta: { cache } },
      { type: types.FETCH_SUCCESS, meta: { cache } },
      { type: types.FETCH_ERROR, meta: { cache } },
    ];

    if (cache.shouldFetch) {
      if (!cache.shouldFetch({ state: keyState, strategy: cacheStrategy })) {
        return undefined;
      }
    } else if (
      cacheStrategy &&
      !cacheStrategies
        .get(cacheStrategy.type)
        .shouldFetch({ state: keyState, strategy: cacheStrategy })
    ) {
      return undefined;
    }
  }

  return dispatch({ [RSAA]: action });
};