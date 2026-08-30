import type { BookFileStore } from "./book-file-store";

const BOOKS_DIRECTORY = "books";

async function booksDirectory(): Promise<FileSystemDirectoryHandle> {
  if (!navigator.storage?.getDirectory) {
    throw new Error("此瀏覽器不支援可靠的離線書籍儲存，請使用最新版 Safari 並離開 Private Browsing。");
  }
  const root = await navigator.storage.getDirectory();
  return root.getDirectoryHandle(BOOKS_DIRECTORY, { create: true });
}

export class OpfsBookFileStore implements BookFileStore {
  async write(bookId: string, file: Blob): Promise<void> {
    const directory = await booksDirectory();
    const handle = await directory.getFileHandle(bookId, { create: true });
    const writable = await handle.createWritable();
    try {
      await writable.write(file);
      await writable.close();
    } catch (error) {
      await writable.abort();
      await directory.removeEntry(bookId).catch(() => undefined);
      throw error;
    }
  }

  async read(bookId: string): Promise<Blob | undefined> {
    try {
      const directory = await booksDirectory();
      const handle = await directory.getFileHandle(bookId);
      return handle.getFile();
    } catch (error) {
      if (error instanceof DOMException && error.name === "NotFoundError") {
        return undefined;
      }
      throw error;
    }
  }

  async remove(bookId: string): Promise<void> {
    const directory = await booksDirectory();
    await directory.removeEntry(bookId).catch((error: unknown) => {
      if (!(error instanceof DOMException && error.name === "NotFoundError")) {
        throw error;
      }
    });
  }
}
