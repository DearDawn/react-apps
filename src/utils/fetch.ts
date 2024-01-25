import { RequestUrl, apiGet, useRequest } from "sweet-me";
import { isDev } from ".";

export const HOST = isDev
  ? '/api'
  : 'https://www.dododawn.com:7020';

export const myFetch = <T> (input: `/${string}`, params: Record<string, any> = {}, init?: RequestInit) => {
  const _url: RequestUrl = `${HOST}${input}`

  return apiGet<T>(_url, { ...params, dodokey: "123" }, init);
}

export const useFetch: typeof useRequest = (props) => {
  const { url: _url, params, ...rest } = props;
  const url: RequestUrl = `${HOST}${_url}`

  const res = useRequest({
    url,
    params: { dodokey: 123, ...params },
    ...rest
  });

  return res;
}