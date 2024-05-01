import { ChartOptions } from 'chart.js';
import { _DeepPartialObject } from 'chart.js/dist/types/utils';

export const options: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    colors: {
      forceOverride: true,
    },
    legend: {
      position: 'top' as const,
      labels: {
        boxWidth: 12,
        borderRadius: 6,
        boxPadding: 1,
        useBorderRadius: true,
        filter: (item) => !!item.text,
      },
      onClick: function (_, legendItem) {
        const index = legendItem.datasetIndex; // 获取被点击的图例项的数据集索引
        const pvMeta = this.chart.getDatasetMeta(index); // 获取数据集的元数据
        const uvMeta = this.chart.getDatasetMeta(index + 1); // 获取数据集的元数据

        pvMeta.hidden =
          pvMeta.hidden === null
            ? !this.chart.data.datasets[index].hidden
            : null; // 切换数据集的隐藏状态
        uvMeta.hidden =
          uvMeta.hidden === null
            ? !this.chart.data.datasets[index].hidden
            : null; // 切换数据集的隐藏状态
        this.chart.update(); // 更新图表
      },
    },
    title: {
      display: true,
      text: '小破站访问量',
    },
    tooltip: {
      callbacks: {
        title(tooltipItem) {
          tooltipItem.forEach((it) => {
            it.label += `时`;
          });
        },
        label(tooltipItem) {
          console.log('[dodo] ', 'tooltipItem', tooltipItem);
        },
        beforeBody(tooltipItems) {
          tooltipItems.forEach((it) => {
            const label = it.dataset.label;
            const isUV = it.dataset.yAxisID === 'y';

            if (label.endsWith('UV') || label.endsWith('PV')) {
              return;
            }

            it.dataset.label = label + (isUV ? ' PV' : ' UV');
          });
        },
      },
    },
  },
  scales: {
    x: {
      title: {
        display: true,
        text: '小时',
        align: 'center',
      },
      ticks: {
        maxTicksLimit: 12, // 设置刻度的最大数量
      },
    },
    y: {
      title: {
        display: true,
        text: 'PV',
        align: 'center',
      },
      position: 'left',
    },
    y1: {
      title: {
        display: true,
        align: 'center',
        text: 'UV',
      },
      position: 'right',
      // grid line settings
      grid: {
        drawOnChartArea: false, // only want the grid lines for one axis to show up
      },
    },
  },
  // 鼠标样式回调函数
  onHover: function (event, elements) {
    // @ts-ignore
    event.native.target.style.cursor = elements.length ? 'pointer' : 'default';
  },
};
