import * as styles from './index.module.less';
import { ImageInfo } from '../../constant';
import clsx from 'clsx';
import { CommonProps } from '@/types';
import { Image, Tag } from 'sweet-me';

interface IProps extends CommonProps {
  info: ImageInfo;
  detailMode?: boolean;
}

export const Card = (props: IProps) => {
  const { info, className, onClick, detailMode = false } = props;
  const { http_src, tags = [], uploadTime, uploader, source } = info || {};
  const id = http_src.split('/').pop();

  return (
    <div className={clsx(styles.card, {}, className)} onClick={onClick}>
      <Image
        className={styles.cover}
        src={http_src}
        alt='图片'
        withPreview={detailMode}
      />
      <div className={styles.info}>
        <div className={styles.tagList}>
          {tags.map((it) => (
            <Tag className={styles.tag} key={it}>
              {it}
            </Tag>
          ))}
        </div>
        <div className={styles.id}>{id}</div>
        <div className={styles.title}>
          <div className={styles.uploader}>{uploader || '未知'}</div>
          <div className={styles.uploadTime}>{uploadTime}</div>
        </div>
        <div className={styles.source}>{source || '无'}</div>
      </div>
    </div>
  );
};
