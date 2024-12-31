import React from 'react';
import * as styles from './index.module.less';
import { IFileType } from '../../../../../../components/chatSDK/constants';
import { FileItem } from './fileItem';
import { TextItem } from './textItem';

interface IProps {
  message: IFileType;
  enableCopy?: boolean;
  enableDownload?: boolean;
}

export const MessageItem = (props: IProps) => {
  const { message, enableCopy, enableDownload } = props;

  if (message.type === 'text') {
    return (
      <div className={styles.messageItem} draggable={false}>
        <TextItem info={message} enableCopy={enableCopy} />
      </div>
    );
  }

  if (message.type === 'img') {
    return (
      <div className={styles.messageItem} draggable={false}>
        <FileItem
          info={message}
          enableCopy={enableCopy}
          enableDownload={enableDownload}
        />
      </div>
    );
  }

  return (
    <div className={styles.messageItem} draggable={false}>
      暂不支持的消息类型: {message.mimeType}
    </div>
  );
};
