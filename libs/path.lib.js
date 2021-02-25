/**
 * @description  路径工具类
 * @module lib/path
 */

const path = require('path');
const fs = require('fs');

/**
 * 获取文件夹所有文件
 * @param {String} str 要查找的路径
 * @param {Object} options 查找的选项
 * @return {String[]} 文件路径列表
 */
exports.getdirSync = function (str, options) {
  let ops = Object.assign({
      filter: function () {},
    },
    options
  );
  let result = [];

  const _getPath = function (defaultVal) {
    let p1 = path.join(defaultVal);
    let exists = fs.existsSync(p1);
    let list = exists ? fs.readdirSync(p1) : [];
    list.forEach(function (item) {
      let p2 = path.join(p1, item);
      let stat = fs.statSync(p2);
      if (stat.isDirectory()) {
        result.concat(_getPath(p2));
      } else if (stat.isFile()) {
        if (ops.filter(p2) === false) {
          return;
        }
        result.push(p2);
      }
    });
    return result;
  };
  _getPath(str);
  return result;
};