/*
 * @description  Dynamically injects a reducer
 * @date  2019-06-05 18:02:43
 * @Reference: https://github.com/react-boilerplate/react-boilerplate/releases/tag/v3.7.0
 */

import React from 'react';
import hoistNonReactStatics from 'hoist-non-react-statics';
import {
  ReactReduxContext
} from 'react-redux';

import getInjectors from './reducerInjectors';

/*
 * @param {string} key A key of the reducer
 * @param {function} reducer A reducer that will be injected
 */
export default ({
  key,
  reducer
}) => WrappedComponent => {
  class ReducerInjector extends React.Component {
    static displayName = `withReducer(${WrappedComponent.displayName ||
      WrappedComponent.name ||
      'Component'})`;

    // eslint-disable-next-line react/sort-comp
    constructor(props, context) {
      super(props, context);
      const {
        store
      } = context;
      getInjectors(store).injectReducer(key, reducer(props.reduxInitState));
    }
    static contextType = ReactReduxContext;
    static WrappedComponent = WrappedComponent;

    render() {
      return <WrappedComponent {
        ...this.props
      }
      />;
    }
  }

  return hoistNonReactStatics(ReducerInjector, WrappedComponent);
};

const useInjectReducer = ({
  key,
  reducer
}) => {
  const context = React.useContext(ReactReduxContext);
  React.useEffect(() => {
    getInjectors(context.store).injectReducer(key, reducer);
  }, []);
};

export {
  useInjectReducer
};