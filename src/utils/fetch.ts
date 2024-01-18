import { isDev } from ".";

export const HOST = isDev
  ? '/api'
  : 'https://www.dododawn.com:7020';

export const apiGet = <T> (input: `/${string}`, params: Record<string, any> = {}, init?: RequestInit) => {
  const _url = `${HOST}${input}`
  const searchStr = new URLSearchParams({ ...params, dodokey: "123" }).toString();
  const url = searchStr ? `${_url}?${searchStr}` : _url;

  return fetch(url, init).then(res => res.json()) as Promise<T>;
}