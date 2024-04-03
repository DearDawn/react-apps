import * as styles from './index.module.less';
import { PieceInfo } from '../../constants';
import clsx from 'clsx';
import { CommonProps } from '@/types';

interface IProps extends CommonProps {
  info: PieceInfo
}

export const Card = (props: IProps) => {
  const { info, className, onClick } = props;
  const { title, content } = info || {};

  return (
    <div className={clsx(styles.card, className)} onClick={onClick}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{content}</div>
    </div>
  );
};