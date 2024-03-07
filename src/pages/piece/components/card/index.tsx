import React from 'react';
import styles from './index.module.less';
import { PieceInfo } from '../../constants';

interface IProps {
  info: PieceInfo
}

export const Card = (props: IProps) => {
  const { info } = props;
  const { title, content } = info || {};

  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{content}</div>
  </div>
  );
};