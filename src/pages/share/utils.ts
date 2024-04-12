import { IFileType, ServerFile, ServerFileRes, ServerText, ServerTextRes } from "./constants";


export const formatText = (textData: ServerTextRes): IFileType => {
  const { data, id } = textData || {};
  const { content = '' } = data || {};

  return { type: 'text', content, id };
};

export const formatFile = (fileData: ServerFileRes): IFileType => {
  const { data, id } = fileData || {};
  const { buffer, name, mimeType } = data || {};
  const file = new File([buffer], name, { type: mimeType });
  const fileUrl = URL.createObjectURL(file);

  if (mimeType.startsWith('image/')) {
    return {
      id,
      file,
      type: 'img',
      fileName: name,
      url: fileUrl,
    };
  }

  return {
    id,
    file,
    type: 'file',
    content: new TextDecoder().decode(buffer),
    fileName: name,
    mimeType,
    url: fileUrl,
  };
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

/** 检查是否是可输入的 DOM 元素 */
export const isInputDom = (target: EventTarget | null) => {
  if (target instanceof HTMLElement) {
    return target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;
  }

  return false;
};

// 合并两个数组的函数
export const mergeArrays = (arr1: IFileType[], arr2: IFileType[]): IFileType[] => {
  const merged = [...arr1];

  arr2.forEach((obj2) => {
    const found = merged.some((obj1) => obj1.id === obj2.id);
    if (!found) {
      merged.push(obj2);
    }
  });

  return merged;
}