import { IFileType, ServerFileRes, ServerTextRes } from "./constants";


export const formatText = (textData: ServerTextRes): IFileType => {
  const { data, id } = textData || {};
  const { content = '' } = data || {};

  return { type: 'text', content, id };
};

export const formatFile = (fileData: ServerFileRes): IFileType => {
  const { data, id } = fileData || {};
  const { fileID, name, mimeType } = data || {};

  if (mimeType.startsWith('image/')) {
    return {
      id,
      type: 'img',
      fileName: name,
      fileID
    };
  }

  return {
    id,
    type: 'file',
    fileName: name,
    mimeType,
    fileID
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
};

export const splitFiles = ({ file, chunkSize = 800 * 1024 }: {
  file: File,
  /** 每个切片的大小, 默认 1MB */
  chunkSize?: number
}) => {
  const chunks = [];

  if (!file) return [];

  const totalChunks = Math.ceil(file.size / chunkSize);

  for (let i = 0; i < totalChunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, file.size);
    const chunk = file.slice(start, end);
    chunks.push(chunk);
  }

  return chunks;
};

export const downloadFile = (url: string, fileName: string) => () => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
};
