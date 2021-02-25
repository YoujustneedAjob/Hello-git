// import 'babel-polyfill';
/* eslint no-extend-native: 0 */
// core-js comes with Next.js. So, you can import it like below
import includes from 'core-js/library/fn/string/virtual/includes';
import repeat from 'core-js/library/fn/string/virtual/repeat';
import assign from 'core-js/library/fn/object/assign';
import Map from 'core-js/library/fn/map';
import Set from 'core-js/library/fn/set';

//import WeakMap from 'core-js/library/fn/weak-map'
//import WeakSet from 'core-js/library/fn/weak-set'

// Add your polyfills
// This files runs at the very beginning (even before React and Next.js core)
// console.log('Load your polyfills');

String.prototype.includes = includes;
String.prototype.repeat = repeat;
Object.assign = assign;
try {
  window.Map = Map;
  window.Set = Set;
  // window.WeakSet =WeakSet;
  // window.WeakMap =WeakMap;
} catch (error) {
  console.log(error);
}
