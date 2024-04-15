export const ROOM_ID = 'dodo';

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
export type ServerHistory = Array<ServerTextRes | ServerFileRes>