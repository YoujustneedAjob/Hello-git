import React from 'react';
import configureStore from './configureStore';
import logger from '@/libs/logger.lib';
const log = logger('with-redux-store.libs');
// const log = require('@/libs/logger.lib')('libs.with-redux-store');

const isServer = typeof window === 'undefined';
const __NEXT_REDUX_STORE__ = '__NEXT_REDUX_STORE__';

function getOrCreateStore(initialState) {
  // Always make a new store if server, otherwise state is shared between requests
  if (isServer) {
    return configureStore(initialState);
  }

  // Create store if unavailable on the client and set it on the window object
  if (!window[__NEXT_REDUX_STORE__]) {
    window[__NEXT_REDUX_STORE__] = configureStore(initialState);
  }
  return window[__NEXT_REDUX_STORE__];
}

export default App => {
  return class AppWithRedux extends React.Component {
    static async getInitialProps(appContext) {
      let reduxStore = null;
      // Create redux store with history
      let initialState = {};
      if (appContext && appContext.ctx) {
        if (appContext.ctx.req && appContext.ctx.req.appState) {
          log.debug(appContext.ctx.req.appState);
          initialState = {
            App: appContext.ctx.req.appState,
          };
        }
        reduxStore = getOrCreateStore(initialState);

        // Provide the store to getInitialProps of pages
        appContext.ctx.reduxStore = reduxStore;
      }

      let appProps = {};
      if (typeof App.getInitialProps === 'function') {
        appProps = await App.getInitialProps(appContext);
      }

      // 如果appProps中有initialReduxState说明需要注入全局的store
      // if (typeof appProps.initialReduxState === 'object') {
      //   initialState = appProps.initialReduxState;
      // }
      // reduxStore = getOrCreateStore(initialState);

      return {
        ...appProps,
        initialReduxState: reduxStore.getState(),
      };
    }

    constructor(props) {
      super(props);
      this.reduxStore = getOrCreateStore(props.initialReduxState);
    }

    render() {
      return <App {...this.props} reduxStore={this.reduxStore} />;
    }
  };
};
