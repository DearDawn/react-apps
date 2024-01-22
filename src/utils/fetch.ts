import { RequestUrl, apiGet } from "sweet-me";
import { isDev } from ".";

export const HOST = isDev
  ? '/api'
  : 'https://www.dododawn.com:7020';

export const myFetch = <T> (input: `/${string}`, params: Record<string, any> = {}, init?: RequestInit) => {
  const _url: RequestUrl = `${HOST}${input}`

  return apiGet<T>(_url, { ...params, dodokey: "123" }, init);
}