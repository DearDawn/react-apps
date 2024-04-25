export function copyTextToClipboard(text) {
  return new Promise((resolve, reject) => {
    navigator.clipboard
      .writeText(text)
      .then(resolve)
      .catch(function (err) {
        try {
          const textarea = document.createElement('textarea');
          textarea.value = text;

          // 将 textarea 隐藏在页面中
          textarea.style.position = 'fixed';
          textarea.style.left = '-9999px';
          textarea.style.top = '-9999px';
          document.body.appendChild(textarea);

          // 选中并复制文本
          textarea.select();
          const success = document.execCommand('copy');

          // 删除 textarea 元素
          document.body.removeChild(textarea);

          if (success) {
            resolve(true);
          } else {
            reject(err);
          }
        } catch (error) {
          reject(error);
        }
      });
  });
}
