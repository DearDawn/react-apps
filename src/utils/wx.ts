import wx from 'weixin-js-sdk-ts';
import { myPost } from './fetch';
import { isDev } from './dev';

export const initWxSDK = () => {
  myPost(
    '/wechat/get_signature',
    {},
    { url: location.href.replace(/#.*$/, '') }
  )
    .then((res: any) => {
      const { app_id, timestamp, noncestr, signature } = res || {};
      wx.config({
        debug: isDev, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
        appId: app_id, // 必填，公众号的唯一标识
        timestamp, // 必填，生成签名的时间戳
        nonceStr: noncestr, // 必填，生成签名的随机串
        signature, // 必填，签名
        jsApiList: ['updateAppMessageShareData'], // 必填，需要使用的JS接口列表
        openTagList: [],
      });

      wx.ready(function () {
        console.log('[dodo] ', 'wx ready');
      });

      wx.error(function (res) {
        console.log('[dodo] ', 'wx error', res);
      });
    })
    .catch(console.error);
};

export const isWX = () => {
  const ua = navigator.userAgent.toLowerCase();
  const isWx = new RegExp(/MicroMessenger/i).test(ua);

  return isWx;
};
