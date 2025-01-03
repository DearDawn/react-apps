import * as styles from './App.module.less';
import { Page, Header, useFormState } from 'sweet-me';
import { socket } from './socket';
import clsx from 'clsx';
import { ROOM_ID, PageContext } from './constants';
import { useSocket } from '@/components/chatSDK';
import { SendBox } from '../../components/chatSDK/components/sendBox';
import { ChatContext } from '@/components/chatSDK/context';
import { MessageList } from '../../components/chatSDK/components/messageList';

export const App = () => {
  const { form } = useFormState();
  const {
    socketID,
    messageList,
    sendData,
    onlineCount,
    isMe,
    isOnline,
    fileMap,
    progressMap,
    needScrollToBottom,
    getFileInfo,
  } = useSocket({
    socket,
    roomID: ROOM_ID,
    onSendEnd: () => {
      form.resetField();
    },
  });

  return (
    <PageContext.Provider value={{ fileMap, progressMap, socketID }}>
      <ChatContext.Provider
        value={{
          messageList,
          sendData,
          onlineCount,
          socketID,
          isMe,
          isOnline,
          fileMap,
          needScrollToBottom,
          progressMap,
          getFileInfo,
        }}
      >
        <Page
          minWidth='300px'
          className={clsx(styles.app, {
            [styles.isOffline]: !isOnline,
          })}
        >
          <Header
            title={`Live (${isOnline ? `${onlineCount}人在线` : '离线中'})`}
            isSticky
            leftPart={null}
            rightPart={null}
          />
          <MessageList enableDownload={false} enableCopy={false} />
          <SendBox onSend={sendData} form={form} fileAccept='image/*' />
        </Page>
      </ChatContext.Provider>
    </PageContext.Provider>
  );
};
