import * as styles from './index.module.less';
import { PieceInfo, LevelMap, PriorityMap } from '../../constant';
import clsx from 'clsx';
import { CommonProps } from '@/types';
import { Tag } from 'sweet-me';

interface IProps extends CommonProps {
  info: PieceInfo;
}

export const Card = (props: IProps) => {
  const { info, className, onClick } = props;
  const { title, content, priority = 0, level = 0, status = 0 } = info || {};
  const priorityInfo = PriorityMap[priority];
  const levelInfo = LevelMap[level];
  const stampInfo = { 1: '已完成', 2: '废弃' }[status];

  return (
    <div
      className={clsx(
        styles.card,
        {
          [styles.done]: status === 1,
          [styles.cancel]: status === 2,
        },
        className
      )}
      onClick={onClick}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{content}</div>
      <div className={styles.stamp}>{stampInfo}</div>
      <div className={styles.info}>
        <Tag className={styles.tag} color={priorityInfo.color}>
          {priorityInfo.text}
        </Tag>
        <Tag className={styles.tag} color={levelInfo.color}>
          {levelInfo.text}
        </Tag>
      </div>
    </div>
  );
};
