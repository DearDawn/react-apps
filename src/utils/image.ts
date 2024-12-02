import { HOST } from './fetch';

export function changeExtToPNG(imageUrl = '') {
  // 使用正则表达式替换文件名后缀
  const newUrl = imageUrl.replace(/(\.[^./]+$)/, '.png');

  return newUrl;
}

export const compressImage = ({
  file,
  outputFileName,
  quality,
  scaleSize = 100,
  callback,
}) => {
  console.log('[dodo] ', 'file', file);
  const fileURL = URL.createObjectURL(file);

  // 创建一个图片元素
  const img = new Image();

  // 当图片加载完成时
  img.onload = function () {
    // 创建一个canvas元素
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    // 计算缩放后的宽高

    let scaledWidth = Math.min(scaleSize, img.width);
    let scaledHeight = Math.min(
      (scaleSize / img.width) * img.height,
      img.height
    );

    if (img.width < img.height) {
      scaledHeight = Math.min(scaleSize, img.height);
      scaledWidth = Math.min((scaleSize / img.height) * img.width, img.width);
    }

    // 设置canvas的宽高与图片一致
    canvas.width = scaledWidth;
    canvas.height = scaledHeight;

    // 在canvas上绘制原始图片
    ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);

    // 使用canvas的toDataURL方法来压缩图像
    // 第二个参数为压缩质量，范围为0到1之间
    const compressedDataUrl = canvas.toDataURL('image/png', quality);

    // 将Data URL转换为Blob对象
    const byteString = atob(compressedDataUrl.split(',')[1]);
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([ab], { type: 'image/png' });

    // 构造一个新的File对象
    const compressedFile = new File([blob], changeExtToPNG(outputFileName), {
      type: 'image/png',
    });

    // 调用回调函数，传递压缩后的文件对象
    callback(compressedFile);
  };

  // 将文件数据赋值给图片元素的src属性
  img.src = fileURL;
};

export const getBlob = (imgPath: string): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    const c = document.createElement('canvas');
    const ctx = c.getContext('2d');

    image.onload = function () {
      c.width = image.naturalWidth;
      c.height = image.naturalHeight;
      ctx.drawImage(image, 0, 0);
      c.toBlob(resolve, 'image/png');
    };

    image.onerror = reject;
    image.src = imgPath;
  });
};

export const imageUploader = async (file: File) => {
  const formData = new FormData();

  formData.append('file', file);
  formData.append('upload_key', 'dododawn');
  formData.append('file_name', file.name);

  return new Promise<string>((resolve, reject) => {
    fetch(`${HOST}/upload/cdn?dodokey=123`, {
      method: 'POST',
      body: formData,
    })
      .then((res) => res.json())
      .then((res) => {
        resolve(res.imageUrl || '');
      })
      .catch((err) => {
        reject(err);
      });
  });
};
