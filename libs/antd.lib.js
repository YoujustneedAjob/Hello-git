import {
  Toast
} from 'antd-mobile';
import Router from 'next/router';
import {
  sleep
} from '@/libs/time.lib';

export const ToastAndRdirect = (tip, redirectUrl, time = 2) =>
  new Promise((resovle, reject) => {
    if (typeof tip !== 'string' || typeof redirectUrl !== 'string' || typeof time !== 'number') {
      reject(new Error('参数错误'));
    }
    Toast.info(tip, time, async () => {
      Router.push(redirectUrl);
      await sleep(1000 * time);
      resovle();
    });
  });