import { useFetch } from '@/utils/fetch';
import { Comp } from '../type';
import * as styles from './index.module.less';
import { Radio, loading } from 'sweet-me';
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  ChartData,
  Colors,
  Color,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { options } from './config';
import { getDateList } from './utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { IRadioOption } from 'sweet-me/dist/common/radio';
import dayjs from 'dayjs';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Colors
);

const radioOptions: IRadioOption[] = [
  {
    label: '半天',
    value: '0.5day',
  },
  {
    label: '一天',
    value: '1day',
  },
  {
    label: '三天',
    value: '3day',
  },
];

const getTimeMap = (value: (typeof radioOptions)[number]['value']) => {
  if (value === '0.5day') {
    return [dayjs().subtract(6, 'hour').unix(), dayjs().unix()];
  }

  if (value === '1day') {
    return [dayjs().subtract(1, 'day').unix(), dayjs().unix()];
  }

  if (value === '3day') {
    return [dayjs().subtract(3, 'day').unix(), dayjs().unix()];
  }
};

export const Chart: Comp = ({ style }) => {
  const [tabKey, setTabKey] = useState(radioOptions[1].value);
  const [timeSpan, setTimeSpan] = useState(getTimeMap(tabKey));
  const [start, end] = timeSpan || [];
  const rootRef = useRef(null);
  const { data: listData = {}, runApi } = useFetch<
    Record<string, { day: string; hour: number; pv: number; uv: number }[]>
  >({
    url: '/action/list/visit',
    params: { start, end },
    autoRun: false,
    loadingFn: () =>
      loading('数据加载中...', undefined, false, 300, rootRef.current),
  });

  const dateList = getDateList(dayjs.unix(start), dayjs.unix(end));
  const labels = dateList.map((it) => it.split(' ')[1]);

  const handleTabChange = useCallback((it: IRadioOption) => {
    setTabKey(it.value);
    setTimeSpan(getTimeMap(it.value));
  }, []);

  useEffect(() => {
    runApi();
  }, [start, end]);

  const datasets = Object.entries(listData).flatMap(([key, val]) => {
    return [
      {
        label: key,
        data: dateList.map((label) => {
          const item = val.find((record) => {
            const str = `${record.day} ${String(record.hour).padStart(2, '0')}`;
            return str === label;
          });

          return item?.pv || 0;
        }),
        yAxisID: 'y',
      },
      {
        label: key,
        data: dateList.map((label) => {
          const item = val.find((record) => {
            const str = `${record.day} ${String(record.hour).padStart(2, '0')}`;
            return str === label;
          });

          return item?.uv || 0;
        }),
        yAxisID: 'y1',
      },
    ];
  });

  const data: ChartData<'line', number[], string> = { labels, datasets };

  return (
    <div className={styles.card} style={style} ref={rootRef}>
      <Radio
        options={radioOptions}
        value={tabKey}
        onValueChange={handleTabChange}
      />
      <Line className={styles.chart} options={options} data={data} />
    </div>
  );
};

Chart.scale = 0.5;
