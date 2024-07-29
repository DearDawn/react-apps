import { RequestUrl, apiGet, apiPost, toast, useRequest } from 'sweet-me';
import { isDev } from '.';
import { useEffect } from 'react';
import { showLoginBox } from './login';

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
      { credentials: 'include', ...init }
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
      credentials: 'include',
      ...init,
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

export const myPostForm = async <T>(
  input: `/${string}`,
  params: Record<string, any> = {},
  formData: FormData,
  init?: RequestInit
) => {
  const _url: RequestUrl = `${HOST}${input}`;
  const searchStr = new URLSearchParams({
    ...params,
    dodokey: '123',
  }).toString();
  const url = searchStr ? `${_url}?${searchStr}` : _url;

  try {
    const res = (await fetch(url, {
      credentials: 'include',
      method: 'POST',
      body: formData,
    }).then((res) => res.json())) as Promise<T>;

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
    init: {
      credentials: 'include',
    },
    params: { dodokey: 123, ...params },
    ...rest,
  });
  const error = res.data?.message;
  const { runApi } = res;

  useEffect(() => {
    if (error === 'No Login') {
      toast('请先登录');
      showLoginBox().then(() => {
        runApi();
      });
    }
  }, [error, runApi]);

  return res;
};
