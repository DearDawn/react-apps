import * as styles from './index.module.less';
import { PieceInfo } from '../../constants';
import clsx from 'clsx';
import { CommonProps } from '@/types';
import { Image, Space, Tag } from 'sweet-me';

interface IProps extends CommonProps {
  info: PieceInfo;
  modalMode?: boolean;
}

export const Card = (props: IProps) => {
  const { info, className, modalMode, onClick } = props;
  const { title, content, link, image, tag } = info || {};
  const linkList = link?.split('\n').filter((it) => it) || [];
  const tagList = tag?.split(/,|，/).filter((it) => it) || [];

  return (
    <div
      className={clsx(
        styles.card,
        { [styles.listMode]: !modalMode },
        className
      )}
      onClick={onClick}
    >
      <div className={styles.title}>{title}</div>
      <div className={styles.content}>{content}</div>
      {image && <Image src={image} className={styles.image} />}
      {!!linkList.length && (
        <div className={styles.linkWrap}>
          相关链接
          {linkList.map((link) => (
            <a key={link} className={styles.link} href={link} target='_blank'>
              {link}
            </a>
          ))}
        </div>
      )}
      {!!tagList.length && (
        <Space gap='10px' padding='0' className={styles.linkWrap}>
          {tagList.map((tag) => (
            <Tag key={tag} color='green'>
              {tag}
            </Tag>
          ))}
        </Space>
      )}
    </div>
  );
};
