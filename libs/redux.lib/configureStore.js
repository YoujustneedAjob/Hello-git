import { createStore, applyMiddleware } from 'redux';
import { fromJS } from 'immutable';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunkMiddleware from 'redux-thunk';
// import createSagaMiddleware from 'redux-saga';
import createReducer from 'reducers';
import loggerMiddleware from './logger.middleware';
// const defaultState = fromJS({});

// const sagaMiddleware = createSagaMiddleware();

export default function configureStore(initialState = {}) {
  // Create the store with two middlewares
  // 1. sagaMiddleware: Makes redux-sagas work
  // 2. routerMiddleware: Syncs the location/URL path to the state
  const middlewares = [
    loggerMiddleware,
    // sagaMiddleware,
    thunkMiddleware,
  ];
  const enhancers = [applyMiddleware(...middlewares)];

  // If Redux DevTools Extension is installed use it, otherwise use Redux compose
  // const composeEnhancers =
  //   process.env.NODE_ENV !== 'production' &&
  //   typeof window === 'object' &&
  //   window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
  //     ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
  //     : compose;
  const composeEnhancers = composeWithDevTools({
    // Specify name here, actionsBlacklist, actionsCreators and other options if needed
  });
  const store = createStore(createReducer(), fromJS(initialState), composeEnhancers(...enhancers));

  // Extensions
  // store.runSaga = sagaMiddleware.run;
  store.injectedReducers = {}; // Reducer registry
  store.injectedSagas = {}; // Saga registry

  // Make reducers hot reloadable, see http://mxs.is/googmo
  /* istanbul ignore next */
  if (module.hot) {
    module.hot.accept('reducers', () => {
      store.replaceReducer(createReducer(store.injectedReducers));
    });
  }

  return store;
}

// export function initializeStore(initialState = defaultState) {
//   const store = createStore(
//     reducers,
//     initialState,
//     composeWithDevTools(applyMiddleware(thunkMiddleware)) //logger
//   );
//   store.asyncReducers = {
//     ...reducers,
//   };
//   return store;
// }
