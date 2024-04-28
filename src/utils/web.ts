import wx from 'weixin-js-sdk-ts';

export function changeMetaTag(name, content, key = 'property') {
  let metaTag = document.querySelector(`meta[${key}="${name}"]`);

  if (metaTag) {
    metaTag.setAttribute('content', content);
  } else {
    metaTag = document.createElement('meta');
    metaTag.setAttribute(key, name);
    metaTag.setAttribute('content', content);
    document.head.appendChild(metaTag);
  }
}

export function getFaviconUrl() {
  const faviconElement =
    document.querySelector('link[rel="shortcut icon"]') ||
    document.querySelector('link[rel="icon shortcut"]') ||
    document.querySelector('link[rel="icon"]') ||
    document.querySelector('link[href*="favicon.ico"]');

  if (faviconElement) {
    const faviconHref = faviconElement.getAttribute('href');
    if (faviconHref) {
      const faviconUrl = new URL(faviconHref, document.location.href);
      return faviconUrl.href;
    }
  }

  return 'https://www.dododawn.com/siteinfo/favicon.ico';
}

export function replaceFaviconUrl(newFaviconUrl) {
  const faviconElement =
    document.querySelector('link[rel="shortcut icon"]') ||
    document.querySelector('link[rel="icon shortcut"]') ||
    document.querySelector('link[rel="icon"]') ||
    document.querySelector('link[href*="favicon.ico"]');

  if (faviconElement) {
    const faviconHref = faviconElement.getAttribute('href');
    if (faviconHref) {
      faviconElement.setAttribute('href', newFaviconUrl);
    }
  } else {
    const newFaviconElement = document.createElement('link');
    newFaviconElement.setAttribute('rel', 'shortcut icon');
    newFaviconElement.setAttribute('href', newFaviconUrl);
    document.head.appendChild(newFaviconElement);
  }
}

export const changeShareInfo = ({
  title = document.title,
  description = document.title,
  url = location.href,
  image = getFaviconUrl(),
}) => {
  document.title = title;
  changeMetaTag('og:title', title);
  changeMetaTag('og:description', description);
  changeMetaTag('og:image', image);
  changeMetaTag('og:url', url);
  changeMetaTag('description', description, 'name');
  replaceFaviconUrl(image);

  wx.checkJsApi({
    jsApiList: ['updateAppMessageShareData'], // 需要检测的JS接口列表，所有JS接口列表见附录2,
    success: function (res) {
      // 以键值对的形式返回，可用的api值true，不可用为false
      // 如：{"checkResult":{"chooseImage":true},"errMsg":"checkJsApi:ok"}
      console.log(
        '[dodo] ',
        'wx.checkJsApi',
        res,
        res?.checkResult?.updateAppMessageShareData
      );
      if (res?.checkResult?.updateAppMessageShareData) {
        wx.updateAppMessageShareData({
          title, // 分享标题
          desc: description, // 分享描述
          link: url, // 分享链接，该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
          imgUrl: image, // 分享图标
          fail: function (err) {
            console.log('[dodo] ', '分享设置失败111', err);
          },
          success: function () {
            console.log('[dodo] ', '分享设置成功');
            // 设置成功
          },
          cancel: function () {
            console.log('[dodo] ', '分享设置失败');
          },
        });
      }
    },
    cancel(err) {
      console.log('[dodo] ', 'checkJSAPI 失败', err);
    },
  });
};
