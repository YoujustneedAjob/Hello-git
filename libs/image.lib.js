/**
 * @description  图片工具类
 * @module lib/image
 */

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = document.createElement('img');
    img.onload = function () {
      resolve(img);
    };
    img.onerror = function () {
      reject(new Error('Image not found: ' + src));
    };
    img.src = src;
  });
}

/**
 * 浏览器异步加载图片
 * {@link https://stackoverflow.com/questions/11071314/javascript-execute-after-all-images-have-loaded}
 * @param {string} srcs 图片的链接
 * @param {bool} strict 是否是严格模式，如果是严格模式，必须每个图片都加载成功，否则抛异常
 * @async
 * @return {undefined}
 */
export async function loadImages(srcs, strict) {
  for (let i = 0, len = srcs.length; i < len; i++) {
    try {
      await loadImage(srcs[i]);
    } catch (e) {
      if (strict) {
        throw e;
      }
    }
  }
}