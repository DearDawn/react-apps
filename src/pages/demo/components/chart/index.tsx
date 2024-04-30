import { useFetch } from '@/utils/fetch';
import { Comp } from '../type';
import * as styles from './index.module.less';
import { loading } from 'sweet-me';
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
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { options } from './config';
import { getDateList } from './utils';

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

export const Chart: Comp = ({ style }) => {
  const { data: listData = {}, runApi } = useFetch<
    Record<string, { day: string; hour: number; pv: number }[]>
  >({
    url: '/action/list/visit',
    autoRun: true,
    loadingFn: () => loading('列表加载中...', undefined, false),
  });

  const dateList = getDateList();
  const labels = dateList.map((it) => it.split(' ')[1]);

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
        data: dateList.map((label) => {
          const item = val.find((record) => {
            const str = `${record.day} ${String(record.hour).padStart(2, '0')}`;
            return str === label;
          });

          return item?.pv || 0;
        }),
        yAxisID: 'y1',
      },
    ];
  });

  const data: ChartData<'line', number[], string> = { labels, datasets };

  return (
    <div className={styles.card} style={style}>
      <Line className={styles.chart} options={options} data={data} />
    </div>
  );
};

Chart.scale = 0.4;
