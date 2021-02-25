/**
 * 浏览器环境相关的工具包
 * @module @/libs/browser
 */

/**
 * 判断是否是微信环境
 * @function
 * @return {Boolean} 是否是微信环境
 */
export const isWechat = () => {
  const ua = navigator.userAgent;
  return /(micromessenger)\/([\d.]+)/i.test(ua);
};

/**
 * 判断是否是微信小程序
 * @function
 * @return {Boolean} 是否是微信小程序
 */
export const isWechatMiniProgram = () => {
  const ua = navigator.userAgent;
  return /(micromessenger)\/([\d.]+)/i.test(ua);
};

/**
 * 异步加载脚本
 * @async
 * @param {String} src 脚本链接
 * @return {String} src 脚本链接
 * @throws {Error} Promise
 */
export function loadScript(src) {
  return new Promise((resolve, reject) => {
    const node = document.querySelectorAll('script[src*="' + src + '"]');
    // 超过5秒钟就报错
    const timeout = setTimeout(() => {
      reject(new Error('loadScript faild:' + src));
    }, 5000);
    if (node.length === 0) {
      const aScript = document.createElement('script');
      aScript.type = 'text/javascript';
      aScript.charset = 'utf-8';
      aScript.src = src;

      document.head.appendChild(aScript);
      aScript.onload = () => {
        clearTimeout(timeout);
        resolve(src);
      };
    } else {
      resolve(src);
    }
  });
}
