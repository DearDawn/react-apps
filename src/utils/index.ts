export const isDev = process.env.NODE_ENV === 'development';

export const query = new URL(window.location.href).searchParams;

export const isTest = query.get('test') === '1';

export const waitTime = (timeout = 1000) =>
  new Promise((resolve) => setTimeout(() => resolve(true), timeout));

export const getRandom = (from = 0, to) => {
  return Math.random() * (to - from) + from;
};
