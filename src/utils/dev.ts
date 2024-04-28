export const query = new URL(window.location.href).searchParams;

export const isDev = process.env.NODE_ENV === 'development';

export const isTest = query.get('test') === '1';
