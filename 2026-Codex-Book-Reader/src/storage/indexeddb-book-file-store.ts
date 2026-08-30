import Dexie, { type EntityTable } from "dexie";

import type { BookFileStore } from "./book-file-store";

interface BookFileRecord {
  id: string;
  /** 以 ArrayBuffer 保存；部分 Safari 版本對 IndexedDB 中的 Blob 支援不穩定。 */
  bytes: ArrayBuffer;
  type: string;
  byteSize: number;
  storedAt: string;
}

class BookFileDatabase extends Dexie {
  files!: EntityTable<BookFileRecord, "id">;

  constructor(name: string) {
    super(name);
    this.version(1).stores({ files: "id, storedAt" });
  }
}

async function toArrayBuffer(file: Blob): Promise<ArrayBuffer> {
  if (typeof file.arrayBuffer === "function") return file.arrayBuffer();
  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("無法讀取檔案。"));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(file);
  });
}

/**
 * IndexedDB 書檔儲存。
 *
 * OPFS 在 iOS 17.4 之前沒有 `FileSystemFileHandle.createWritable()`，
 * 匯入會直接失敗；此 store 作為同樣持久化、且所有目標 Safari 都支援的後備。
 */
export class IndexedDbBookFileStore implements BookFileStore {
  private readonly database: BookFileDatabase;

  constructor(databaseName = "codex-book-files") {
    this.database = new BookFileDatabase(databaseName);
  }

  async write(bookId: string, file: Blob): Promise<void> {
    const bytes = await toArrayBuffer(file);
    await this.database.files.put({
      id: bookId,
      bytes,
      type: file.type,
      byteSize: bytes.byteLength,
      storedAt: new Date().toISOString(),
    });
  }

  async read(bookId: string): Promise<Blob | undefined> {
    const record = await this.database.files.get(bookId);
    if (!record) return undefined;
    return new Blob([record.bytes], record.type ? { type: record.type } : undefined);
  }

  async remove(bookId: string): Promise<void> {
    await this.database.files.delete(bookId);
  }

  async destroy(): Promise<void> {
    await this.database.delete();
  }
}
