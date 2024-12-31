import { FILE_CHUNK_SIZE, IFileType, ServerFileRes, ServerTextRes } from "./constants";


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

export const splitFiles = ({ file, chunkSize = FILE_CHUNK_SIZE }: {
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

export const downloadFile = (url: string, fileName: string) => {
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  link.click();
};

export const convertFileSize = (bytes: number) => {
  const kilobyte = 1024;
  const megabyte = kilobyte * 1024;

  if (bytes >= megabyte) {
    return (bytes / megabyte).toFixed(2) + ' MB';
  } else if (bytes >= kilobyte) {
    return (bytes / kilobyte) + ' KB';
  } else if (bytes > 0) {
    return bytes + ' bytes';
  } else {
    return '--';
  }
};
