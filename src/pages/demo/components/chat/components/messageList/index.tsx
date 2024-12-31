import React, { useContext } from 'react';
import styles from './index.module.less';
import { ChatContext } from '@/components/chatSDK/context';
import { MessageItem } from '../messageItem';
import clsx from 'clsx';
import { Button, Icon, ICON } from 'sweet-me';
import { useAutoScrollToBottom, useShowBackToBottom } from '../../hooks';

interface IProps {
  enableCopy?: boolean;
  enableDownload?: boolean;
}

export const MessageList = (props: IProps) => {
  const { enableDownload = true, enableCopy = true } = props || {};
  const { messageList, isMe, needScrollToBottom } = useContext(ChatContext);
  const listRef = React.useRef<HTMLDivElement>(null);
  const bottomHolderRef = React.useRef<HTMLDivElement>(null);

  const { scrollToBottom } = useAutoScrollToBottom({ listRef, force: isMe }, [
    messageList,
  ]);

  const { showBack } = useShowBackToBottom({ listRef, bottomHolderRef });

  React.useEffect(() => {
    if (needScrollToBottom) {
      scrollToBottom();
    }
  }, [needScrollToBottom, scrollToBottom]);

  return (
    <div className={styles.contentWrap} ref={listRef}>
      {messageList.map((message, idx) => (
        <MessageItem
          message={message}
          key={idx}
          enableCopy={enableCopy}
          enableDownload={enableDownload}
        />
      ))}
      <div className={styles.holder} ref={bottomHolderRef} />
      <Button
        className={clsx(styles.rocketBottom, showBack && styles.visible)}
        onClick={scrollToBottom}
      >
        <Icon type={ICON.rocket} />
      </Button>
    </div>
  );
};
