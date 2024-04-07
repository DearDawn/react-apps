export type Comp = {
  ({ style }: {
    style?: any;
    visible?: boolean;
  }): JSX.Element;
  /** 小卡时的缩放比例 */
  scale?: number;
  /** 大卡时容器是否适应高度 */
  fitHeight?: boolean;
};