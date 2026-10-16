import type { BookFileStore } from "./book-file-store";

/** 儲存空間不足必須讓使用者知道，不能默默換到另一個一樣會滿的儲存區。 */
function isQuotaError(error: unknown): boolean {
  return error instanceof DOMException
    && (error.name === "QuotaExceededError" || error.name === "NotAllowedError");
}

/**
 * 優先使用 OPFS，遇到平台不支援時自動改用 IndexedDB。
 *
 * iOS 17.4 之前的 Safari 有 OPFS 目錄 API，但沒有 `createWritable()`，
 * 寫入時才會炸成 "createWritable is not a function"；因此只能在實際寫入時偵測。
 * 讀取與刪除同時涵蓋兩邊，讓不同版本匯入的書都能開啟。
 */
export class ResilientBookFileStore implements BookFileStore {
  private primaryUsable = true;

  constructor(
    private readonly primary: BookFileStore,
    private readonly fallback: BookFileStore,
    private readonly onFallback?: (error: unknown) => void,
  ) {}

  async write(bookId: string, file: Blob): Promise<void> {
    if (this.primaryUsable) {
      try {
        await this.primary.write(bookId, file);
        return;
      } catch (error) {
        if (isQuotaError(error)) throw error;
        this.primaryUsable = false;
        this.onFallback?.(error);
        // 寫入失敗前可能已建立空檔，清掉避免殘留。
        await this.primary.remove(bookId).catch(() => undefined);
      }
    }
    await this.fallback.write(bookId, file);
  }

  async read(bookId: string): Promise<Blob | undefined> {
    try {
      const found = await this.primary.read(bookId);
      if (found) return found;
    } catch {
      // 主要儲存區不可用時仍要能讀到後備儲存區的書。
    }
    return this.fallback.read(bookId);
  }

  async remove(bookId: string): Promise<void> {
    await this.primary.remove(bookId).catch(() => undefined);
    await this.fallback.remove(bookId).catch(() => undefined);
  }
}
