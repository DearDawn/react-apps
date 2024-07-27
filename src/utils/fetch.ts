import { RequestUrl, apiGet, apiPost, toast, useRequest } from 'sweet-me';
import { isDev } from '.';

export const HOST = isDev ? '/api' : 'https://www.dododawn.com:7020/api';

export const myFetch = async <T>(
  input: `/${string}`,
  params: Record<string, any> = {},
  init?: RequestInit
) => {
  const _url: RequestUrl = `${HOST}${input}`;

  try {
    const res = await apiGet<T>(
      _url,
      { ...params, dodokey: '123' },
      { ...init, credentials: 'same-origin' }
    );

    if ((res as any)?.message) {
      return Promise.reject((res as any).message);
    }

    return Promise.resolve(res);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

export const myPost = async <T>(
  input: `/${string}`,
  params: Record<string, any> = {},
  body: Record<string, any> = {},
  init?: RequestInit
) => {
  const _url: RequestUrl = `${HOST}${input}`;

  try {
    const res = await apiPost<T>(_url, { ...params, dodokey: '123' }, body, {
      ...init,
      credentials: 'same-origin',
    });

    if ((res as any)?.message) {
      toast((res as any).message);
      return Promise.reject((res as any).message);
    }

    return Promise.resolve(res);
  } catch (error) {
    console.error(error);
    return Promise.reject(error);
  }
};

export const useFetch: typeof useRequest = (props) => {
  const { url: _url, params, ...rest } = props;
  const url: RequestUrl = `${HOST}${_url}`;

  const res = useRequest({
    url,
    params: { dodokey: 123, ...params },
    ...rest,
  });

  return res;
};
