/* eslint-disable camelcase */
// /* eslint-disable babel/camelcase */
/**
 * 微信工具类，通过全局变量**window.__WECHAT_JSSDK_LOAD_STATUS**来共享加载状态
 * @module lib/wechat
 */

import {
  loadScript
} from './browser.lib';

/**
 * jssdk加载状态
 * @enum
 * @readonly
 */
const JsSdkStatus = {
  INIT: 0,
  LOADING: 1,
  SUCCESS: 2,
  FAILD: 3,
};

/** 微信jssdk是否在加载中 */
// window.WECHAT_JSSDK_LOADING = false;
// /** 是否已经尝试加载过微信jssdk */
// window.WECHAT_JSSDK_LOADED = false;
// /** 微信jssdk是否已经加载成功 */
// window.WECHAT_JSSDK_LOAD_SUCCESS = false;

/** 微信jssdk路径 */
const WECHAT_JSSDK_PATH = '//res.wx.qq.com/open/js/jweixin-1.4.0.js';

const DEFAULT_JSSDK_API = [
  'checkJsApi',
  'onMenuShareTimeline',
  'onMenuShareAppMessage',
  'onMenuShareQQ',
  'onMenuShareWeibo',
  'hideMenuItems',
  'showMenuItems',
  'hideAllNonBaseMenuItem',
  'showAllNonBaseMenuItem',
  'translateVoice',
  'startRecord',
  'stopRecord',
  'onRecordEnd',
  'playVoice',
  'pauseVoice',
  'stopVoice',
  'uploadVoice',
  'downloadVoice',
  'chooseImage',
  'previewImage',
  'uploadImage',
  'downloadImage',
  'getNetworkType',
  'openLocation',
  'getLocation',
  'hideOptionMenu',
  'showOptionMenu',
  'closeWindow',
  'scanQRCode',
  'chooseWXPay',
  'openProductSpecificView',
  'addCard',
  'chooseCard',
  'openCard',
  'updateAppMessageShareData',
  'updateTimelineShareData',
];

/**
 * 异步加载jssdk
 * @async
 * @param {Boolean} debug 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
 * @param {String} appId 必填，公众号的唯一标识
 * @param {String} timestamp 必填，生成签名的时间戳
 * @param {String} nonceStr 必填，生成签名的随机串
 * @param {String} signature 必填，签名
 * @param {String} jsApiList 必填，需要使用的JS接口列表
 * @return {Undefined} Undefined
 * @throws {Error} Promise
 */
export function loadJsSdk({
  debug = false,
  appId,
  timestamp,
  nonceStr,
  signature,
  jsApiList = DEFAULT_JSSDK_API,
}) {
  window.__WECHAT_JSSDK_LOAD_STATUS = JsSdkStatus.INIT;
  return new Promise(async (resolve, reject) => {
    window.__WECHAT_JSSDK_LOAD_STATUS = JsSdkStatus.LOADING;
    // 异步加载jssdk脚本
    try {
      await loadScript(WECHAT_JSSDK_PATH);
    } catch (e) {
      return reject(e);
    }
    window.wx.config({
      debug,
      appId,
      timestamp,
      nonceStr,
      signature,
      jsApiList,
    });
    window.wx.ready(function () {
      window.__WECHAT_JSSDK_LOAD_STATUS = JsSdkStatus.SUCCESS;
      // config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，则可以直接调用，不需要放在ready函数中。
      resolve();
    });
    window.wx.error(function (res) {
      window.__WECHAT_JSSDK_LOAD_STATUS = JsSdkStatus.FAILD;
      // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
      reject(res);
    });
  });
}

/**
 * 确保jssdk已经加载，通过不断检查相关变量的方式实现，200ms一次，超过20次报超时。
 * @async
 * @return {Boolean} 是否检测成功
 */
export function ensureJssdk() {
  let intervalId = null;
  let countDown = 20;
  return new Promise((resolve, reject) => {
    function checkJssdk() {
      // 加载中
      if (window.__WECHAT_JSSDK_LOAD_STATUS === JsSdkStatus.SUCCESS) {
        if (intervalId) {
          clearInterval(intervalId);
        }
        resolve();
        return false;
      } else if (window.__WECHAT_JSSDK_LOAD_STATUS === JsSdkStatus.FAILD) {
        if (intervalId) {
          clearInterval(intervalId);
        }
        reject(new Error('加载jssdk失败'));
        return false;
      }
      countDown = countDown - 1;
      if (countDown < 0) {
        clearInterval(intervalId);
        reject(new Error('等待jssdk超时'));
        return false;
      }
      return true;
    }
    // 第一次执行返回true才设置定时器
    if (checkJssdk()) {
      setInterval(checkJssdk, 200);
    }
  });
}

/**
 * 判断当前环境是否在微信小程序中
 * @async
 * @param {String} jsApiList 必填，需要使用的JS接口列表
 * @return {Boolean} 是否是小程序
 * @throws {Error} Error
 */
export function isWechatMiniProgram() {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureJssdk();
    } catch (e) {
      reject(e);
    }
    window.wx.miniProgram.getEnv(function (res) {
      resolve(res.miniprogram);
    });
  });
}

/**
 * 自定义“分享给朋友”及“分享到QQ”按钮的分享内容
 * @async
 * @param {String} title 分享标题
 * @param {String} desc 分享描述
 * @param {String} link 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
 * @param {String} imgUrl 分享图标
 * @return {Boolean} 分享成功
 * @throws {Error} Error
 */
export function updateAppMessageShareData({
  title,
  desc,
  link,
  imgUrl
}) {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureJssdk();
    } catch (e) {
      reject(e);
    }
    window.wx.updateAppMessageShareData({
      title,
      desc,
      link,
      imgUrl,
      success: function () {
        resolve();
      },
    });
  });
}

/**
 * 自定义“分享到朋友圈”及“分享到QQ空间”按钮的分享内容
 * @async
 * @param {String} title 分享标题
 * @param {String} link 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
 * @param {String} imgUrl 分享图标
 * @return {Boolean} 分享成功
 * @throws {Error} Error
 */
export function updateTimelineShareData({
  title,
  link,
  imgUrl
}) {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureJssdk();
    } catch (e) {
      reject(e);
    }
    window.wx.updateTimelineShareData({
      title,
      link,
      imgUrl,
      success: function () {
        resolve(true);
      },
    });
  });
}

/**
 * updateAppMessageShareData和updateTimelineShareData的分享
 * @async
 * @param {String} title 分享标题
 * @param {String} desc 分享描述
 * @param {String} link 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
 * @param {String} imgUrl 分享图标
 * @return {Boolean} 是否是小程序
 * @throws {Error} Error
 */
export function updateShareData({
  title,
  desc,
  link,
  imgUrl
}) {
  return new Promise(async (resolve, reject) => {
    try {
      await ensureJssdk();
      await updateAppMessageShareData({
        title,
        desc,
        link,
        imgUrl
      });
      await updateTimelineShareData({
        title,
        link,
        imgUrl
      });
      resolve(true);
    } catch (e) {
      reject(e);
    }
  });
}