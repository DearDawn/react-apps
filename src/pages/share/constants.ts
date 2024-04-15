import React from "react";
import { FileStore } from "./fileStore";

export const ROOM_ID = 'dodo';
export const FILE_CHUNK_SIZE = 50 * 1024;

export const PageContext = React.createContext<{
  fileMap: FileStore['fileStoreMap'];
  progressMap: FileStore['progressMap'];
  socketID: string
}>(null);

export type TextT = {
  id: string;
  type: 'text';
  content: string
};
export type ImgT = {
  id: string;
  type: 'img';
  fileID: string;
  fileName: string
};

export type FileT = {
  id: string;
  type: 'file';
  fileID: string;
  fileName: string;
  mimeType: string;
};

export type IFileType = TextT | ImgT | FileT;

export type ServerText = { content: string }
export type ServerFile = { fileID: string; name: string; mimeType: string }
export type ServerTextRes = { type: 'text', data: ServerText, id: string }
export type ServerFileRes = { type: 'file', data: ServerFile, id: string }
export type ServerFileContentRes = { fileID: string, chunk: Buffer, index: number, totalChunks: number }
export type ServerHistory = Array<ServerTextRes | ServerFileRes>