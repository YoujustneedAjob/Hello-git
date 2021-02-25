import { Toast } from 'antd-mobile';
import loggerCreator from '@hz/logger';
import Beidou from '@hz/beidou-js-sdk';
const WHITE_LIST = [
  '/plan/content/front',
  '/plan/content/detail',
  '/plan/annuity/front',
  '/plan/annuity/detail',
  '/plan/education/front',
  '/plan/education/detail',
];
/**
 * @param {object.string} pageName 页面名称
 * @param {object.string} eventName 事件名称
 * @param {object.string} customTrack 埋点track
 * @returns {never} no return;
 */
const sendGA = ({ pageName, eventName, customTrack }) => {
  const hzApp = window.hzApp || {};
  const clientName = hzApp.isApp ? 'app' : 'h5';
  window.ga && window.ga('send', 'event', clientName, pageName, eventName, 1);
  window.customTrack && window.customTrack(customTrack);
};

/**
 * 获取Url所有参数，作为对象返回
 * @param {object.string} search location.search
 * @example
 * getQueryObj()				// collect all parameter-value pairs of current page URL
 * getQueryObj('=a')			// {'': 'a'}
 * getQueryObj("?p1=A&p2=B")	// {p1: "A", p2: "B"}
 * getQueryObj('http://domain.com/?p1=a=b&b&&=b&&p2=c%26#d=e&f=g')
 * @returns {object} query对象;
 */
const getQueryObj = search => {
  var result;
  var queryObj = {};
  var reg = /&([^=&]*)=?([^&]*)/g;
  var str = search ? String(search) : location.search;

  if (str.indexOf('?') === -1) {
    return queryObj;
  }

  str = '&' + str.substr(str.indexOf('?') + 1).split('#')[0];

  while ((result = reg.exec(str)) !== null) {
    if (result[0] !== '&') {
      queryObj[result[1]] = decodeURIComponent(result[2]);
    }
  }
  return queryObj;
};

// 后台返回的金额都是以分为单位，需要转换为元来进行展示
const transFormPrice = price => {
  let result = '';
  if (Number(price) !== 0) {
    let integer = Math.floor(Number(price) / 100);
    let decimals = price % 100;
    result = integer + '.' + (decimals < 10 ? '0' + decimals : decimals);
  }
  return result;
};
const noop = () => {};
const handlerReponse = (resp = {}, options = {}) => {
  if (resp.success) {
    if (options.showTips === false) {
      options.success(resp.data);
    } else {
      Toast.success(options.successText || '操作成功', 3, options.succes || noop);
    }
  } else {
    Toast.fail(options.failText || '操作失败', 3, options.fail || noop);
  }
};
//获取页面滚动条滚动的距离
const getPageScroll = () => {
  let xScroll, yScroll;
  // console.log('self.pageXOffset:', window.pageYOffset);
  // console.log('self.scrollTop:', document.documentElement.scrollTop);
  if (window.pageYOffset) {
    yScroll = self.pageYOffset;
    xScroll = self.pageXOffset;
  } else if (document.documentElement && document.documentElement.scrollTop) {
    // Explorer 6 Strict
    yScroll = document.documentElement.scrollTop;
    xScroll = document.documentElement.scrollLeft;
  } else if (document.body) {
    // all other Explorers
    yScroll = document.body.scrollTop;
    xScroll = document.body.scrollLeft;
  }
  return {
    x: xScroll,
    y: yScroll,
  };
};

// ios企业微信环境
const isIosWxWork = () => {
  const ua = window.navigator.userAgent;
  return /wxwork/gi.test(ua) && /micromessenger/gi.test(ua);
};

// ios企业微信环境
const isWxWork = () => {
  const ua = window.navigator.userAgent;
  return /micromessenger/gi.test(ua);
};

//格式化数据
const formatDisplayData = data => {
  if (typeof data === 'number') {
    return data;
  }
  return data || '--';
};

// 是否为iphoneX系列设备
const isIphoneX = () => {
  const resolution = (screen.height / screen.width).toFixed(2);
  return resolution === '2.16' || resolution === '2.17';
};

const documentTouchMove = e => {
  if (/537\.36/.test(navigator.userAgent)) {
    return;
  }
  e.preventDefault();
};

// 设置页面不滚动
const setBodyNoScroll = () => {
  try {
    document.addEventListener('touchmove', documentTouchMove, { passive: false });
  } catch (e) {
    console.error(e);
  }
};
// 恢复滚动
const setBodyScroll = () => {
  try {
    document.removeEventListener('touchmove', documentTouchMove, false);
  } catch (e) {
    console.error(e);
  }
};

const modalHelper = (bodyCls => {
  let scrollTop;
  return {
    afterOpen() {
      scrollTop = document.scrollingElement.scrollTop;
      document.body.classList.add(bodyCls);
      document.body.style.top = -scrollTop + 'px';
    },
    beforeClose() {
      document.body.classList.remove(bodyCls);
      // scrollTop lost after set position:fixed, restore it back.
      document.scrollingElement.scrollTop = scrollTop;
    },
  };
})('modal-open');
const makeFullUrl = url => {
  //注意，目前P版和外网链接不一样，P版不需要iadviser，后期发布调整一致
  return `//m.huize.com/iadviser${url}`;
};
const replaceStartOrEndWhiteSpace = str => {
  if (str) {
    return str.replace(/(^\s*)|(\s*$)/g, '');
  }
  return '';
};

const replaceAllWhiteSpace = str => {
  if (str) {
    return str.replace(/\s+/g, '');
  }
  return '';
};

const trySomeThings = (someThings, doCatch = () => {}) => {
  try {
    someThings();
  } catch (e) {
    doCatch(e);
  }
};
// 根据年龄倒推出生日期，日期取计算之后的年份时间，再往前推35天，比如年龄为30，当前时间为2019/8/30，则取1989/7/25
const getBirthdayByAge = age => {
  let birthday = '';
  age = Number(age);
  if (typeof age === 'number') {
    // 将出生日期往前推35天
    let time = Date.now() - 1000 * 60 * 60 * 24 * 35;
    let date = new Date(time);
    let year = date.getFullYear() - age;
    let primaryMonth = date.getMonth() + 1;
    let month = primaryMonth < 10 ? '0' + primaryMonth : primaryMonth;
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    birthday = `${year}-${month}-${day}`;
  }
  return birthday;
};

//根据不同的请求类型 给出不同提示
const toastInfo = (url = '') => {
  let info = '加载中...';
  if (url.includes('/tenant/proposal/saveAnnuityProposal')) {
    info = '生成中...';
  }
  // 保存成功，生成
  return info;
};

// 格式化出生日期
const getFormatBirthday = birthday => {
  let result = '';
  if (typeof birthday === 'number') {
    // 将出生日期往前推35天
    let date = new Date(birthday);
    let year = date.getFullYear();
    let primaryMonth = date.getMonth() + 1;
    let month = primaryMonth < 10 ? '0' + primaryMonth : primaryMonth;
    let day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
    result = `${year}-${month}-${day}`;
  }
  return result;
};

const getShareUrl = url => {
  let { href, origin, host } = window.location;
  if (url) {
    href = url;
  }
  if (host === 'm.huize.com') {
    return href.replace(/&code.*&state=iadviser/gi, '');
  }
  return href.replace(origin, '//m.huize.com/iadviser');
};
const getApiOrigin = () => {
  try {
    let { origin } = window.location;
    return origin + '/api';
  } catch (e) {
    return 'https://proposalh5.hzins.com/api';
  }
};
const getQiXinApiOrigin = () => {
  try {
    let { origin } = window.location;
    return origin + '/api';
  } catch (e) {
    return 'https://jhs.qixin18.com/api';
  }
};

const getBaoXinApiOrigin = () => {
  try {
    let { origin } = window.location;
    return origin + '/api';
  } catch (e) {
    return 'https://jhs.baoxin18.com/api';
  }
};
const getAge = momentDate => {
  const text = momentDate.fromNow();
  let age = parseInt(text, 10);
  if (isNaN(age)) {
    age = '';
  }
  return age;
};
const docQuery = selector => {
  return document.querySelector(selector);
};
const setElementStyles = (selector, styles) => {
  trySomeThings(() => {
    const targetTypeOf = typeof selector;
    if (targetTypeOf === 'string') {
      selector = docQuery(selector);
    }
    let cssValue = '';
    for (let [key, value] of Object.entries(styles)) {
      cssValue += `${key}:${value};`;
    }
    selector.setAttribute('style', cssValue);
  });
};
const isPhone = () => {
  const ua = window.navigator.userAgent;
  return /mobile|android|iphone/gi.test(ua) && !/win/i.test(navigator.platform);
};

// 将秒时长转换成时分秒
const getDuration = (seconds = 0) => {
  const hour = Math.floor(seconds / (60 * 60));
  const minute = Math.floor(seconds / 60) - hour * 60;
  const second = Math.floor(seconds - hour * 60 * 60 - minute * 60);
  return [
    {
      key: '时',
      value: hour,
    },
    {
      key: '分',
      value: minute,
    },
    {
      key: '秒',
      value: second,
    },
  ].filter((item, index) => index === 2 || item.value);
};

// Duration 转化成 时分秒字符串
const getDurationStr = timeArray => {
  let str = '';
  timeArray.forEach(item => {
    str += ' ' + item.value + ' ' + item.key;
  });
  return str;
};

// Duration 转化成 00:00:00字符串
const getFormatTimeStr = (seconds = 0) => {
  const hour = Math.floor(seconds / (60 * 60));
  const minute = Math.floor(seconds / 60) - hour * 60;
  const second = Math.floor(seconds - hour * 60 * 60 - minute * 60);
  let str = '';
  str += `${hour > 9 ? hour : '0' + hour}:`;
  str += `${minute > 9 ? minute : '0' + minute}:`;
  str += `${second > 9 ? second : '0' + second}`;
  return str ? str : '00:00:00';
};

//customerTrack
const track = data => {
  if (typeof window === 'undefined') {
    return;
  }
  const { customTrack } = window || {};
  typeof customTrack === 'function' &&
    customTrack('hz_proposalh5_search_api', JSON.stringify(data));
};

const getPremiumDisplayText = origin => {
  let premium = 0;
  //如果是数字 改成 number ， 如果是number
  if (typeof origin === 'string') {
    premium = Number(origin);
  } else {
    premium = origin || 0;
  }
  return premium / 100;
};

const toThousands = data => {
  let num = (data || 0).toString(),
    result = '';
  while (num.length > 3) {
    result = ',' + num.slice(-3) + result;
    num = num.slice(0, num.length - 3);
  }
  if (num) {
    result = num + result;
  }
  return result;
};

// 计算保额
const getProtectAmount = ({ productInfo, genes, trial }) => {
  let amount = '';
  // 优先取试算因子中的保额，试算因子中保额的特点是：key=undefined, protectItemId存在
  let relativeCoverage = genes.filter(item => item.protectItemId > 0 && !item.key) || [];
  let mainProtectItem =
    (trial.protectList || []).find(
      item => Number(item.protectItemId) === Number(productInfo.mainBaseProtectItemId)
    ) || {};
  //如果有多个费率表，要取保障项里面找到关联保障项的对应的试算因子，去里面的value
  if (relativeCoverage.length > 1) {
    relativeCoverage.forEach(item => {
      if (Number(item.protectItemId) === Number(mainProtectItem.relateCoverageId)) {
        amount = item.value;
      }
      if (!amount && trial.additInfo.basicCoverageId === Number(item.protectItemId)) {
        amount = item.value;
      }
    });
    // 保障项目保额通过计算公式来计算的时候直接去保障项目上的保额
    if (!amount && mainProtectItem.fullPremium) {
      amount = mainProtectItem.fullPremium;
    }
  } else if (relativeCoverage && relativeCoverage.length === 1) {
    //TODO优先获取主要保障责任中设置的基本保额
    amount = mainProtectItem.fullPremium || relativeCoverage[0].value;
  } else if (mainProtectItem.fullPremium) {
    amount = mainProtectItem.fullPremium;
  }
  return amount;
};

//北斗手动业务上报
const BeidouTrack = (event, param, cb) => {
  if (typeof window === 'undefined') {
    return;
  }
  //TODO 过滤null 和undefined
  Beidou.track(event || 'customerTrack', param, cb);
};

// 日志对象
const hzLogger = (msg, type) => {
  //浏览器环境
  let logType = type ? type : 'info';
  if (typeof window !== 'undefined') {
    if (!window.hzLogger) {
      const requestLogger = loggerCreator.createLogger('request');
      window.hzLogger = requestLogger;
    }
    window.hzLogger[logType] && window.hzLogger[logType](`${logType} : ${msg}`);
  } else {
    //node端
    const requestLogger = loggerCreator.createLogger('request');
    requestLogger[logType](`${logType} : ${msg}`);
  }
};

const isPlanDetailPage = url => {
  return WHITE_LIST.some(item => url.includes(item) && !url.includes('preview=true'));
};

/* 立即投保业务按钮 逻辑控制方法
  如果当前环境是 小程序的webview里面，需要进行 微信小程序的 postmessage通讯
  否则，进行普通跳转
*/
let transferInsuranceButtonUrl = (url, callBackF) => {
  let agent = navigator.userAgent.toLowerCase();
  if (agent.indexOf('miniprogram') !== -1) {
    let timeStamp = new Date().valueOf();
    // eslint-disable-next-line no-undef
    wx.miniProgram.navigateTo({
      url: '/pages/jumpPage/index?url=' + encodeURIComponent(url) + '&timeStamp=' + timeStamp,
      success: function() {},
    });
  } else {
    // eslint-disable-next-line no-lonely-if
    if (callBackF) {
      callBackF();
    } else {
      location.href = url;
    }
  }
};

//检测当前页面是否在小程序环境
let isMiniProgramEnvironment = agent => {
  if (!agent) {
    agent = navigator.userAgent.toLowerCase();
  }
  return agent.toLowerCase().includes('miniprogram');
};

//检测当前页面运行的 环境
let checkH5Environment = () => {
  let agent = navigator.userAgent.toLowerCase();
  if (agent.toLowerCase().indexOf('miniprogram') !== -1) {
    return 'weChat';
  }
  return 'mobileBrowser';
};

//微信情况下退出webview页面
const quitWXWebView = () => {
  // eslint-disable-next-line no-undef
  wx.miniProgram.navigateBack();
};

const shareModelToast = () => {
  Toast.info('同屏演示中, 请结束后再试~');
};

// 随机字符串
export const randomString = len => {
  len = len || 32;
  let chars =
    'ABCDEFGHJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; /****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
  let maxPos = chars.length;
  let pwd = '';
  for (let i = 0; i < len; i++) {
    pwd += chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return pwd;
};

export default {
  randomString,
  getPremiumDisplayText,
  sendGA,
  shareModelToast,
  getQueryObj,
  transFormPrice,
  noop,
  handlerReponse,
  getPageScroll,
  isIosWxWork,
  isIphoneX,
  setBodyNoScroll,
  setBodyScroll,
  modalHelper,
  makeFullUrl,
  replaceStartOrEndWhiteSpace,
  isWxWork,
  trySomeThings,
  getShareUrl,
  getQiXinApiOrigin,
  getApiOrigin,
  getAge,
  docQuery,
  setElementStyles,
  isPhone,
  replaceAllWhiteSpace,
  getDuration,
  track,
  getDurationStr,
  formatDisplayData,
  getBirthdayByAge,
  getFormatBirthday,
  toastInfo,
  getProtectAmount,
  toThousands,
  getBaoXinApiOrigin,
  BeidouTrack,
  hzLogger,
  transferInsuranceButtonUrl,
  checkH5Environment,
  isMiniProgramEnvironment,
  quitWXWebView,
  getFormatTimeStr,
  isPlanDetailPage,
};
