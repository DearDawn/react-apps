import { ChatContext } from '@/components/chatSDK/context';
import * as styles from './index.module.less';
import { shortenSocketId, TextT } from '@/components/chatSDK';
import { useContext } from 'react';

interface IProps {
  info: Pick<TextT, 'id' | 'date'>;
  className?: string;
}

export const ItemHeader = (props: IProps) => {
  const { info } = props;
  const { socketID } = useContext(ChatContext);

  const { id, date } = info || {};
  const showID = shortenSocketId(id);
  const isMe = id.startsWith(socketID);

  return (
    <div className={styles.itemHeader}>
      <span className={styles.uid}>{isMe ? '我' : `UID(${showID})`}</span>
      {date}
    </div>
  );
};
