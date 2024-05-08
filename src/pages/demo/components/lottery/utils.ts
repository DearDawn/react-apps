const getLevel = (id = '') => {
  if (id === '5-2') return 1;
  if (id === '5-1') return 2;
  if (id === '5-0') return 3;
  if (id === '4-2') return 4;
  if (id === '4-1') return 5;
  if (id === '3-2') return 6;
  if (id === '4-0') return 7;
  if (['3-1', '2-2'].includes(id)) return 8;
  if (['3-0', '1-2', '2-1', '0-2'].includes(id)) return 9;

  return 0;
};

export const getWinRules = (beforeCount = 0, endCount = 0) => {
  const rewards = [0, 1000_0000, 500_0000, 10000, 3000, 300, 200, 100, 15, 5];
  const levelText = '零一二三四五六七八九';
  const id = `${beforeCount}-${endCount}`;

  const level = getLevel(id);
  const reward = rewards[level];

  return { level, reward: '￥' + reward, levelText: levelText[level] + '等奖' };
};
