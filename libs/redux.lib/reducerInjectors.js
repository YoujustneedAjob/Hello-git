/*
 * @description  reducerInjectors
 * @date  2019-06-05 18:02:43
 * @Reference: https://github.com/react-boilerplate/react-boilerplate/releases/tag/v3.7.0
 */

import invariant from 'invariant';
import {
  isEmpty,
  isFunction,
  isString
} from 'lodash';

import checkStore from './checkStore';
import createReducer from 'reducers';

export function injectReducerFactory(store, isValid) {
  return function injectReducer(key, reducer) {
    if (!isValid) {
      checkStore(store);
    }

    invariant(
      isString(key) && !isEmpty(key) && isFunction(reducer),
      '(app/utils...) injectReducer: Expected `reducer` to be a reducer function'
    );

    // Check `store.injectedReducers[key] === reducer` for hot reloading when a key is the same but a reducer is different
    if (Reflect.has(store.injectedReducers, key) && store.injectedReducers[key] === reducer) {
      return;
    }

    store.injectedReducers[key] = reducer; // eslint-disable-line no-param-reassign
    store.replaceReducer(createReducer(store.injectedReducers));
  };
}

export default function getInjectors(store) {
  checkStore(store);

  return {
    injectReducer: injectReducerFactory(store, true),
  };
}