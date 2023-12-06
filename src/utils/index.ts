export const isDev = () => {
  console.log('[dodo] ', 'process.env.NODE_ENV', process.env.NODE_ENV);
  return process.env.NODE_ENV === 'development';
};
