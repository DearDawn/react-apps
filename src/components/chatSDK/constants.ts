import React from 'react';
import { fileStore } from './fileStore';
import { query } from '@/utils';

export const ROOM_ID = query.get('room')?.slice(0, 10) || 'dodo';
export const FILE_CHUNK_SIZE = 50 * 1024;
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export const PageContext = React.createContext<{
  fileMap: (typeof fileStore)['fileStoreMap'];
  progressMap: (typeof fileStore)['progressMap'];
  socketID: string;
}>(null);

export type TextT = {
  id: string;
  type: 'text';
  content: string;
  date: string;
};
export type ImgT = {
  id: string;
  type: 'img';
  fileID: string;
  fileName: string;
  url?: string;
  date: string;
};

export type FileT = {
  id: string;
  type: 'file';
  fileID: string;
  fileName: string;
  mimeType: string;
  url?: string;
  date: string;
};

export type IFileType = TextT | ImgT | FileT;

export type ServerText = { content: string };
export type ServerFile = {
  fileID: string;
  name: string;
  mimeType: string;
  url?: string;
};
export type ServerTextRes = {
  type: 'text';
  data: ServerText;
  id: string;
  date: number;
};
export type ServerFileRes = {
  type: 'file';
  data: ServerFile;
  id: string;
  date: number;
};
export type ServerFileContentRes = {
  fileID: string;
  chunk: Buffer;
  index: number;
  totalChunks: number;
};
export type ServerHistory = Array<ServerTextRes | ServerFileRes>;
