import dayjs from 'dayjs';

// 获取当前时间
const now = dayjs();

// 获取昨天 0 点时间
const yesterday = now.subtract(1, 'day').startOf('day');

export const getDateList = (from = yesterday, to = now): string[] => {
  // 获取小时数组
  const hoursArray = [];
  let currentTime = from;

  while (currentTime.isBefore(to)) {
    const hourString = currentTime.format('MM-DD HH');
    hoursArray.push(hourString);
    currentTime = currentTime.add(1, 'hour');
  }

  return hoursArray;
};
