import * as styles from './index.module.less';
import { PieceInfo } from '../../constants';
import clsx from 'clsx';
import { CommonProps } from '@/types';
import { Tag } from 'sweet-me';
import { LevelMap, PriorityMap } from '../../constant';

interface IProps extends CommonProps {
  info: PieceInfo;
}

export const Card = (props: IProps) => {
  const { info, className, onClick } = props;
  const { title, content, priority = 0, level = 0 } = info || {};
  const priorityInfo = PriorityMap[priority];
  const levelInfo = LevelMap[level];

  return (
    <div className={clsx(styles.card, className)} onClick={onClick}>
      <div className={styles.title}>
        <Tag className={styles.tag} color={priorityInfo.color}>
          {priorityInfo.text}
        </Tag>
        <Tag className={styles.tag} color={levelInfo.color}>
          {levelInfo.text}
        </Tag>
        {title}
      </div>
      <div className={styles.content}>{content}</div>
    </div>
  );
};
