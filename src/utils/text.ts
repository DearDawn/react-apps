import { getBlob } from "./image";

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

export function copyImgToClipboard(file: File, img?: HTMLImageElement) {
  return new Promise((resolve, reject) => {
    const fileUrl = URL.createObjectURL(file);

    // safari 需要通过传入 promise 实现，不可先获取结果
    const getImgBold = async (): Promise<Blob> => {
      // 非 png 图片复制需要特殊处理
      return file.type === 'image/png' ? file : await getBlob(fileUrl);
    };

    navigator.clipboard
      .write([new ClipboardItem({ 'image/png': getImgBold() })])
      .then(resolve)
      .catch(function (error) {
        if (!img) {
          reject(error);
          return;
        }

        try {
          const selection = window.getSelection();
          if (selection.rangeCount > 0) {
            selection.removeAllRanges();
          }

          const range = document.createRange();
          range.selectNode(img);
          selection.addRange(range);
          const success = document.execCommand('copy');
          selection.removeAllRanges();

          if (success) {
            resolve(true);
          } else {
            reject(error);
          }
        } catch (err) {
          reject(err);
        }
      });
  });
}
