import { ServerFileContentRes } from "./constants";

export class FileStore {
  fileStoreMap: Map<string, Blob> = new Map();
  receivedChunks = new Map<string, Buffer[]>();
  constructor () {

  }

  receive (info: ServerFileContentRes, setStore: React.Dispatch<React.SetStateAction<FileStore['fileStoreMap']>>) {
    const { fileID, chunk, totalChunks, index } = info;


    if (!this.receivedChunks.has(fileID)) {
      this.receivedChunks.set(fileID, []);
    }

    const chunks = this.receivedChunks.get(fileID);
    chunks[index] = chunk;

    if (chunks.length === totalChunks) {
      const mergedFile = new Blob(chunks.map(chunk => new Blob([chunk])));
      this.fileStoreMap.set(fileID, mergedFile);
      setStore(new Map(this.fileStoreMap));
      // 清除已接收的切片
      this.receivedChunks.delete(fileID);
    }
  }

  getFile (id: string) {
    const chunks = this.fileStoreMap.get(id);

    return chunks;
  }
}

export const fileStore = new FileStore();