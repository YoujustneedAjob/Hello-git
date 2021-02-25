/**
 * @description  express框架工具类
 * @module lib/express
 */

const config = require('config');

/**
 * 根据req.params忽略路由{@link https://stackoverflow.com/questions/27117337/exclude-route-from-express-middleware}
 * @param {Function} middleware - Express middleware function
 * @param {String[]} paths - 要忽略的路由
 * @return {Fcuntion} Express middleware function
 * @example server.use('/:domain([0-9a-zA-Z-]+)/', unlessDomain(customMiddleware, 'static', '_next'));
 */
exports.unlessDomain = function (middleware, ...paths) {
  return function (req, res, next) {
    const pathCheck = paths.some(path => path === req.params.domain);
    if (pathCheck) {
      next();
    } else {
      middleware(req, res, next);
    }
  };
};

/**
 * 在加载中间件的时候，排除相关的路径
 * {@link https://stackoverflow.com/questions/27117337/exclude-route-from-express-middleware}
 * @param {*} middleware - Express middleware function
 * @param  {Array<String|Regex>} paths - 要忽略的路径，支持字符串和正则表达式
 * @return {Fcuntion} Express middleware function
 * @example
 * // 部分页面不需要强制登录，或者登录逻辑放到子路由去处理
 * router.use(unlessPath(loginMiddleware, '/intro', '/login', /^\/order\/*\/i));
 */
exports.unlessPath = function (middleware, ...paths) {
  return function (req, res, next) {
    const pathCheck = paths.some(path => {
      if (!path) {
        return true;
      }
      if (path instanceof RegExp) {
        return path.test(req.path);
      }
      return path === req.path;
    });
    if (pathCheck) {
      next();
    } else {
      middleware(req, res, next);
    }
  };
};

/**
 * 删除originalUrl指定的query参数
 * @param {Object} req express request
 * @param {Array} removeParams 要删除的query key 数组
 * @return {String} 新的originalUrl
 * @example
 * // 登录成功，去除微信授权用的code和state参数
 * const newUrl = config.siteUrl + removeUrlQueryParams(req, ['code', 'state']);
 */
exports.removeUrlQueryParams = function (req, removeParams) {
  if (typeof req.query !== 'object' || Array.isArray(removeParams) === false) {
    return req.originalUrl;
  }
  const newQueryList = [];
  Object.keys(req.query).map(queryItem => {
    if (removeParams.includes(queryItem) === false) {
      newQueryList.push(`${queryItem}=${req.query[queryItem]}`);
    }
  });
  const urlWithoutQuery = req.originalUrl.split('?').shift();
  return urlWithoutQuery + newQueryList.join('&');
};

/**
 * 判断是否是微信环境
 * @param {Object} req - express req
 * @return {Boolean} 是否是微信环境
 */
exports.isWeixin = function (req) {
  let ua = req.headers['user-agent'];
  return /(micromessenger)\/([\d.]*)/i.test(ua);
};

/**
 * 获取完整的url路径
 * @param {Object} req - express req
 * @return {String} 完整的URL路径
 */
exports.getFullURLPath = function (req) {
  return config.siteUrl + req.originalUrl;
};