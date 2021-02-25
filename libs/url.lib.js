const serializeQuery = function(obj) {
  if (typeof obj !== 'object') {
    return '';
  }
  const str = [];
  // ？？？'p' is defined but never used.eslint(no-unused-vars)
  // eslint-disable-next-line no-unused-vars
  for (const p in obj) {
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + '=' + encodeURIComponent(obj[p]));
    }
  }
  console.log(obj, str);
  return str.join('&');
};

const appendQuery = function(url, obj) {
  const newParams = serializeQuery(obj);
  if (url.indexOf('?') >= 0) {
    return url + '&' + newParams;
  }
  return url + '?' + newParams;
};

/**
 * url查询参数字符串转对象{@link https://stackoverflow.com/questions/8648892/convert-url-parameters-to-a-javascript-object}
 * @param {String} queryString query string
 * @return {Object} queryObject query object
 */
const parseQuery = function(queryString) {
  try {
    // eslint-disable-next-line
    return JSON.parse('{"' + queryString.replace(/&/g, '","').replace(/=/g, '":"') + '"}', function(
      key,
      value
    ) {
      return key === '' ? value : decodeURIComponent(value);
    });
  } catch (e) {
    console.warn(e);
  }
  return {};
};

exports.serializeQuery = serializeQuery;

exports.appendQuery = appendQuery;

exports.parseQuery = parseQuery;
