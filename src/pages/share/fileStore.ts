import { ServerFileContentRes } from "./constants";

export class FileStore {
  fileStoreMap: Map<string, Buffer[]> = new Map();
  constructor() {

  }

  receive(info: ServerFileContentRes) {
    const { fileID, chunk, totalChunks, index } = info;

    this.fileStoreMap.set(id, chunks);
  }

  getFile(id: string) {
    const chunks = this.fileStoreMap.get(id);

    return chunks;
  }
}

export const fileStore = new FileStore();