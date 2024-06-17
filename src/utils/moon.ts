// 基本时间单位 (天)
export const LUNAR_CYCLE_DAYS = 29.53058867;

/** 计算月相，返回月龄 0-29.53058867 */
export const getLunarAge = (date: Date = new Date()) => {
  // 计算1970年1月1日到当前日期的天数
  const msPerDay = 24 * 60 * 60 * 1000;

  // 参考新月时间：2000年1月6日18:14:00 UTC
  const referenceNewMoon = new Date(Date.UTC(2000, 0, 6, 18, 14, 0));
  const daysSinceReferenceNewMoon =
    (date.getTime() - referenceNewMoon.getTime()) / msPerDay;

  // 计算月相天数
  const lunarAge = daysSinceReferenceNewMoon % LUNAR_CYCLE_DAYS;
  const moonPhase = lunarAge < 0 ? lunarAge + LUNAR_CYCLE_DAYS : lunarAge;

  console.log('[dodo] ', 'moonPhase', moonPhase);
  return moonPhase;
};
