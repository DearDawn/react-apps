export const isDev = process.env.NODE_ENV === 'development';

export const query = new URL(window.location.href).searchParams;

export const waitTime = (timeout = 1000) =>
  new Promise((resolve) => setTimeout(() => resolve(true), timeout));
