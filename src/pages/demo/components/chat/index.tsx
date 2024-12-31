import { Button, Modal, Title, useBoolean, useFormState } from 'sweet-me';
import * as styles from './index.module.less';
import { Comp } from '../type';
import { useSocket } from '@/components/chatSDK/hooks';
import { socket } from './socket';
import { ROOM_ID } from './constant';
import { SendBox } from './components/sendBox';
import { ChatContext } from '@/components/chatSDK/context';
import { MessageList } from './components/messageList';

export const Chat: Comp = ({ style }) => {
  const { form } = useFormState();
  const [visible, showModal, closeModal] = useBoolean(false);
  const {
    socketID,
    messageList,
    sendData,
    isMe,
    isOnline,
    onlineCount,
    getFileInfo,
    needScrollToBottom,
    fileMap,
    progressMap,
  } = useSocket({
    socket,
    roomID: ROOM_ID,
    onSendEnd: () => {
      form.resetField();
    },
  });

  return (
    <ChatContext.Provider
      value={{
        socketID,
        messageList,
        sendData,
        isMe,
        isOnline,
        onlineCount,
        getFileInfo,
        needScrollToBottom,
        fileMap,
        progressMap,
      }}
    >
      <div className={styles.card} style={style}>
        <Button onClick={showModal}>开始聊天</Button>
        <Modal
          direction='right'
          visible={visible}
          maskClosable
          onClose={closeModal}
        >
          <div className={styles.content}>
            <Title align='center'>Live ({onlineCount}人在线)</Title>
            <MessageList enableCopy={false} enableDownload={false} />
            <SendBox onSend={sendData} form={form} />
          </div>
        </Modal>
      </div>
    </ChatContext.Provider>
  );
};

Chat.scale = 0.8;
