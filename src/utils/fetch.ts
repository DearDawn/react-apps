import { isDev } from ".";

export const HOST = isDev
  ? 'http://localhost:7020'
  : 'https://www.dododawn.com:7020';

export const apiGet = <T> (input: `/${string}`, params: Record<string, any> = {}, init?: RequestInit) => {
  const url = new URL(`${HOST}${input}`)
  url.search = new URLSearchParams({ ...params, dodokey: "123" }).toString();
  return fetch(url, init).then(res => res.json()) as Promise<T>;
}