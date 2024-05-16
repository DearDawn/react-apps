export type Comp<T = Record<string, any>> = {
  ({
    style,
  }: {
    style?: any;
    visible?: boolean;
    parent?: React.MutableRefObject<HTMLDivElement>;
  } & T): JSX.Element;
  /** 小卡时的缩放比例 */
  scale?: number;
  /** 大卡时容器是否适应高度 */
  fitHeight?: boolean;
};
