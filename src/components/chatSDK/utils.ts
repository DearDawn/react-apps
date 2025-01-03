import {
  FILE_CHUNK_SIZE,
  IFileType,
  ServerFileRes,
  ServerTextRes,
} from './constants';
import dayjs from 'dayjs';

export const formatTime = (_inputTime: number) => {
  const inputTime = _inputTime * 1000;
  const now = dayjs(); // 当前时间
  const targetTime = dayjs(inputTime); // 目标时间

  // 判断是否是同一年
  const isSameYear = now.year() === targetTime.year();

  // 判断是否是昨天
  const isToday = now.isSame(targetTime, 'day');

  if (isToday) {
    return targetTime.format('HH:mm:ss');
  } else if (isSameYear) {
    // 如果是更早的日期但在同一年，显示 MM-DD HH:mm
    return targetTime.format('MM-DD HH:mm');
  } else {
    // 如果不是同一年，显示 YYYY-MM-DD HH:mm
    return targetTime.format('YYYY-MM-DD HH:mm');
  }
};

export const formatText = (textData: ServerTextRes): IFileType => {
  const { data, id, date } = textData || {};
  const { content = '' } = data || {};
  const formatDate = formatTime(date);

  return { type: 'text', content, id, date: formatDate };
};

export const formatFile = (fileData: ServerFileRes): IFileType => {
  const { data, id, date } = fileData || {};
  const { fileID, name, mimeType, url } = data || {};
  const formatDate = formatTime(date);

  if (mimeType.startsWith('image/')) {
    return {
      id,
      type: 'img',
      fileName: name,
      url,
      fileID,
      date: formatDate,
    };
  }

  return {
    id,
    type: 'file',
    fileName: name,
    mimeType,
    fileID,
    date: formatDate,
  };
};

/** 检查是否是可输入的 DOM 元素 */
export const isInputDom = (target: EventTarget | null) => {
  if (target instanceof HTMLElement) {
    return (
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement
    );
  }

  return false;
};

// 合并两个数组的函数
export const mergeArrays = (
  arr1: IFileType[],
  arr2: IFileType[]
): IFileType[] => {
  const merged = [...arr1];

  arr2.forEach((obj2) => {
    const found = merged.some((obj1) => obj1.id === obj2.id);
    if (!found) {
      merged.push(obj2);
    }
  });

  return merged;
};

export const splitFiles = ({
  file,
  chunkSize = FILE_CHUNK_SIZE,
}: {
  file: File;
  /** 每个切片的大小, 默认 1MB */
  chunkSize?: number;
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
    return bytes / kilobyte + ' KB';
  } else if (bytes > 0) {
    return bytes + ' bytes';
  } else {
    return '--';
  }
};

export const getFileFromUrl = async (url, fileName) => {
  // 使用 fetch 获取图像数据
  const blobRes = await fetch(url, { credentials: 'omit' })
    .then((res) => res.blob())
    .catch(console.error);

  if (!blobRes) {
    return null;
  }

  // 创建 File 对象
  const file = new File([blobRes], fileName, { type: blobRes.type });

  return file;
};

export function shortenSocketId(socketId) {
  // 将字符转换为 ASCII 码并拼接成数字
  let numericId = '';
  let sum = 0;

  for (let i = 0; i < socketId.length; i++) {
    const num = socketId.charCodeAt(i);
    numericId += num.toString();
    sum += num;
  }

  // 截取前 6 位
  return `${sum.toString().substring(0, 3).padStart(3, '0')}${numericId.substring(0, 2)}`;
}
