import { useEffect, useState } from 'react';
import { waitTime } from '@/utils';
import { RequestUrl, useBoolean } from 'sweet-me';
import { PAGE_LIMIT } from './constant';
import { useFetch } from '@/utils/fetch';

export type RequestProps = {
  url: RequestUrl;
  params?: Record<string, any>;
  init?: RequestInit;
  autoRun?: boolean;
  loadingFn?: () => VoidFunction;
  cache?: boolean;
};

type ListRequest<T> = {
  list: T[];
  has_more: boolean;
};

/** 请求 */
export const useListRequest = <T = any>(props: RequestProps) => {
  const { url = '/', params = {}, init = {}, loadingFn } = props || {};
  const [data, setData] = useState<ListRequest<T>>();
  const [page, setPage] = useState(0);
  const [refreshing, startRefreshing, endRefreshing] = useBoolean(false);
  const isFirstRequest = !data?.list?.length;
  const { runApi, loading, error } = useFetch({
    url,
    params: { page, limit: PAGE_LIMIT, ...params },
    init,
    loadingFn: isFirstRequest ? loadingFn : undefined,
  });

  const onRefresh = async (manual = false) => {
    setPage(0);
    await waitTime(0);
    try {
      !manual && startRefreshing();
    await waitTime(300);
    const res = await runApi();
      const { list, has_more } = res;
      setData({ list, has_more });
      setPage((p) => p + 1);
    } catch (error) {
      return false;
    } finally {
      !manual && endRefreshing();
    }
  };

  const onLoadMore = async () => {
    try {
      const res = await runApi();

      setData((_data) => ({
        list: [...(_data?.list || []), ...res.list],
        has_more: res.has_more,
      }));
      setPage((p) => p + 1);
      return { hasMore: res.has_more };
    } catch (error) {
      return { hasMore: true, error };
    }
  };

  useEffect(() => {
    if (!loading || !loadingFn) return;

    if (isFirstRequest) {
      const fn = loadingFn();
      return fn;
    } else {
      return () => {};
    }
  }, [isFirstRequest, loading, loadingFn]);

  return {
    refreshing,
    page,
    data,
    error,
    loading,
    runApi,
    onRefresh,
    onLoadMore,
  };
};
