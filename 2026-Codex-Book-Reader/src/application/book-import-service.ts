import { createBookRecord, type BookFormat, type BookRecord } from "../domain/library";
import type { BookFileStore } from "../storage/book-file-store";
import { LibraryRepository } from "../storage/library-repository";

function detectFormat(file: File): BookFormat | undefined {
  const extension = file.name.toLocaleLowerCase().split(".").pop();
  if (extension === "epub") return "epub";
  if (extension === "txt") return "txt";
  if (extension === "pdf") return "pdf";

  if (file.type === "application/epub+zip") return "epub";
  if (file.type === "text/plain") return "txt";
  if (file.type === "application/pdf") return "pdf";
  return undefined;
}

async function readBytes(blob: Blob): Promise<ArrayBuffer> {
  if (typeof blob.arrayBuffer === "function") {
    return blob.arrayBuffer();
  }

  return new Promise<ArrayBuffer>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error ?? new Error("無法讀取檔案。"));
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.readAsArrayBuffer(blob);
  });
}

async function sha256(blob: Blob): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", await readBytes(blob));
  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function titleFromFileName(fileName: string): string {
  return fileName.replace(/\.(?:epub|txt|pdf)$/i, "") || "未命名書籍";
}

export class BookImportService {
  constructor(
    private readonly repository: LibraryRepository,
    private readonly fileStore: BookFileStore,
  ) {}

  async importBook(file: File, importedAt = new Date().toISOString()): Promise<BookRecord> {
    const format = detectFormat(file);
    if (!format) {
      throw new Error("只支援 EPUB、TXT、PDF。");
    }

    const id = crypto.randomUUID();
    const book = createBookRecord({
      id,
      checksum: await sha256(file),
      fileName: file.name,
      title: titleFromFileName(file.name),
      authors: [],
      format,
      byteSize: file.size,
      importedAt,
    });

    await this.fileStore.write(id, file);
    try {
      await this.repository.addBook(book);
    } catch (error) {
      await this.fileStore.remove(id);
      throw error;
    }

    return book;
  }
}
