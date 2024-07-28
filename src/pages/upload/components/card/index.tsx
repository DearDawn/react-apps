import * as styles from './index.module.less';
import { PieceInfo } from '../../constant';
import clsx from 'clsx';
import { CommonProps } from '@/types';
import { Tag } from 'sweet-me';

interface IProps extends CommonProps {
  info: PieceInfo;
}

export const Card = (props: IProps) => {
  const { info, className, onClick } = props;
  const { src, tag } = info || {};

  return (
    <div className={clsx(styles.card, {}, className)} onClick={onClick}>
      <img src={src} alt='' />
      <Tag className={styles.tag}>{tag}</Tag>
    </div>
  );
};
