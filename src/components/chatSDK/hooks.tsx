import React, { useCallback, useRef, useState } from 'react';
import { Socket } from 'socket.io-client';
import { loading, showImageCompressModal, toast } from 'sweet-me';
import {
  convertFileSize,
  formatFile,
  formatText,
  mergeArrays,
  splitFiles,
} from './utils';
import {
  ServerTextRes,
  ServerHistory,
  IFileType,
  ServerFileRes,
  ServerFileContentRes,
  MAX_FILE_SIZE,
} from './constants';
import { fileStore } from './fileStore';

export const useSocket = ({
  socket,
  roomID,
  fileMaxSize = MAX_FILE_SIZE,
  onSendEnd,
  imageUploader,
}: {
  socket: Socket;
  roomID: string;
  fileMaxSize?: number;
  onSendEnd?: () => void;
  imageUploader?: (file: File) => Promise<string>;
}) => {
  const [isOnline, setIsOnline] = React.useState(false);
  const [onlineCount, setOnlineCount] = useState(0);
  const [scrollCounter, setScrollCounter] = useState(0);
  const [socketID, setSocketID] = React.useState('');
  const [messageList, setMessageList] = React.useState<IFileType[]>([]);
  /** 最新发的消息是否本人 */
  const [isMe, setIsMe] = React.useState(false);
  const loadingRef = React.useRef(() => {});
  const [fileMap, setFileMap] = React.useState<
    (typeof fileStore)['fileStoreMap']
  >(new Map());
  const [progressMap, setProgressMap] = React.useState<
    (typeof fileStore)['progressMap']
  >(new Map());
  const onScrollToBottomRef = useRef(() => {
    setScrollCounter((scrollCounter) => scrollCounter + 1);
  });

  const sendData = async (values: { text: string; file: File }) => {
    const { text = '', file: _file } = values || {};
    let file = _file;
    let url = '';

    if (text.trim()) {
      socket.emit('text', text);
      loadingRef.current = loading('发送中...', undefined, false);
    }

    if (file) {
      if (file.type.startsWith('image/')) {
        await showImageCompressModal({
          imgFile: _file,
          maxSize: fileMaxSize,
          uploader: imageUploader,
          onClose: (res) => {
            if (res) {
              const { file: tempFile, url: cdnUrl } = res || {};
              file = tempFile;
              url = cdnUrl;
            } else {
              file = null;
            }
          },
        });
      }

      if (!file && !url) {
        toast('发送取消');
        onSendEnd?.();
        return;
      }

      if (file.size >= fileMaxSize) {
        toast(`文件过大，最大 ${convertFileSize(fileMaxSize)}`);
        onSendEnd?.();
        return;
      }

      const chunks = splitFiles({ file });
      chunks.forEach((chunk, index) => {
        socket.emit('file', {
          file: chunk,
          url,
          name: file.name,
          mimeType: file.type,
          index,
          totalChunks: chunks.length,
        });
      });
      loadingRef.current = loading('发送中...');
    }

    onSendEnd?.();
  };

  const getFileInfo = useCallback(
    (fileID) => {
      socket.emit('fileContent', fileID, 0);
    },
    [socket]
  );

  React.useEffect(() => {
    // 连接到服务器
    socket.on('connect', () => {
      socket.emit('join', roomID);
      setIsOnline(true);
      setSocketID(socket.id);
    });

    socket.on('disconnect', () => {
      setIsOnline(false);
    });

    socket.on('rooms', (rooms) => {
      toast(JSON.stringify(rooms, undefined, 2));
    });

    socket.on('online', (membersCount) => {
      setOnlineCount(membersCount);
    });

    socket.on('text', (val: ServerTextRes, clientId) => {
      setMessageList((list) => list.concat(formatText(val)));
      setIsMe(socket.id === clientId);
    });

    socket.on('history', (historyList: ServerHistory = []) => {
      const newList = historyList.map((it) => {
        if (it.type === 'text') {
          return formatText(it);
        }
        return formatFile(it);
      });

      setMessageList((list) => mergeArrays(list, newList));
      setTimeout(() => onScrollToBottomRef.current?.(), 500);
    });

    socket.on('file', (fileInfo: ServerFileRes, clientId) => {
      setMessageList((list) => list.concat(formatFile(fileInfo)));
      setIsMe(socket.id === clientId);
    });

    socket.on('fileContent', (fileInfo: ServerFileContentRes) => {
      const { index, fileID, totalChunks } = fileInfo;

      if (index < totalChunks - 1) {
        socket.emit('fileContent', fileID, index + 1);
      }

      fileStore.receive(fileInfo, setFileMap, setProgressMap);
    });

    socket.on('text_done', (fileID: string, clientId) => {
      loadingRef.current();
    });

    socket.on('file_done', (fileID: string, clientId) => {
      loadingRef.current();
    });

    socket.on('error', (message: string) => {
      toast(message);
    });

    return () => {
      socket.removeAllListeners();
    };
  }, [roomID, socket]);

  return {
    isOnline,
    onlineCount,
    socketID,
    messageList,
    isMe,
    loadingRef,
    sendData,
    getFileInfo,
    fileMap,
    progressMap,
    needScrollToBottom: scrollCounter,
  };
};
