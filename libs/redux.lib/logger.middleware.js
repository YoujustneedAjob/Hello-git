export default function logger({ getState }) {
  return next => action => {
    console.log('dispatching', action);
    let val = next(action);
    console.log('state', getState());
    return val;
  };
}
