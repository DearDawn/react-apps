import { createContext } from 'react';
import { IFileType } from './constants';

export const ChatContext = createContext<{
  socketID: string;
  messageList: IFileType[];
  sendData: (value: { text: string; file: File }) => void;
  isMe: boolean;
  isOnline: boolean;
  needScrollToBottom: number;
  onlineCount: number;
  fileMap: Map<string, Blob>;
  progressMap: Map<
    string,
    {
      progress: number;
      total: number;
    }
  >;
  getFileInfo: (fileID: any) => void;
}>(null);
