/*
 * @description  检查是否符合redux store结构
 * @Reference: https://github.com/react-boilerplate/react-boilerplate/releases/tag/v3.7.0
 */

import {
  conformsTo,
  isFunction,
  isObject
} from 'lodash';
import invariant from 'invariant';

/**
 * Validate the shape of redux store
 * @param {object} store, redux store
 * @return {bool} is valid object
 */
export default function checkStore(store) {
  // console.log('--------------', store);
  const shape = {
    dispatch: isFunction,
    subscribe: isFunction,
    getState: isFunction,
    replaceReducer: isFunction,
    // runSaga: isFunction,
    injectedReducers: isObject,
    // injectedSagas: isObject,
  };
  invariant(conformsTo(store, shape), '(app/utils...) injectors: Expected a valid redux store');
}