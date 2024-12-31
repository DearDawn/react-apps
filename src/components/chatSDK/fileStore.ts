import { FILE_CHUNK_SIZE, ServerFileContentRes } from "./constants";

class FileStore {
  private static instance: FileStore;
  fileStoreMap: Map<string, Blob> = new Map();
  progressMap: Map<string, { progress: number; total: number }> = new Map();
  receivedChunks = new Map<string, Buffer[]>();
  
  private constructor () {}

  public static getInstance(): FileStore {
    if (!FileStore.instance) {
      FileStore.instance = new FileStore();
    }
    return FileStore.instance;
  }

  receive (
    info: ServerFileContentRes,
    setStore: React.Dispatch<React.SetStateAction<FileStore['fileStoreMap']>>,
    setProgress: React.Dispatch<React.SetStateAction<FileStore['progressMap']>>) {
    const { fileID, chunk, totalChunks, index } = info;

    if (!this.receivedChunks.has(fileID)) {
      this.receivedChunks.set(fileID, []);
    }

    const chunks = this.receivedChunks.get(fileID);
    chunks[index] = chunk;

    this.progressMap.set(fileID, {
      progress: Math.floor((index + 1) / totalChunks * 100),
      total: totalChunks * FILE_CHUNK_SIZE
    });

    setProgress(new Map(this.progressMap));

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

export const fileStore = FileStore.getInstance();
