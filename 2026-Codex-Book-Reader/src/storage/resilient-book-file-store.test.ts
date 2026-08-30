import { describe, expect, it, vi } from "vitest";

import type { BookFileStore } from "./book-file-store";
import { IndexedDbBookFileStore } from "./indexeddb-book-file-store";
import { ResilientBookFileStore } from "./resilient-book-file-store";

class MemoryStore implements BookFileStore {
  readonly files = new Map<string, Blob>();

  async write(bookId: string, file: Blob): Promise<void> {
    this.files.set(bookId, file);
  }

  async read(bookId: string): Promise<Blob | undefined> {
    return this.files.get(bookId);
  }

  async remove(bookId: string): Promise<void> {
    this.files.delete(bookId);
  }
}

class UnsupportedOpfsStore implements BookFileStore {
  writes = 0;

  async write(): Promise<void> {
    this.writes += 1;
    // iOS 17.4 之前的 Safari 實際丟出的錯誤形狀。
    throw new TypeError("(await n.getFileHandle(e,{create:!0})).createWritable is not a function");
  }

  async read(): Promise<Blob | undefined> {
    return undefined;
  }

  async remove(): Promise<void> {}
}

describe("ResilientBookFileStore", () => {
  it("OPFS 缺少 createWritable 時改用後備儲存並仍可讀回書檔", async () => {
    const primary = new UnsupportedOpfsStore();
    const fallback = new MemoryStore();
    const onFallback = vi.fn();
    const store = new ResilientBookFileStore(primary, fallback, onFallback);

    await store.write("book-1", new Blob(["內容"]));
    expect(await (await store.read("book-1"))?.text()).toBe("內容");
    expect(onFallback).toHaveBeenCalledTimes(1);

    // 已知主要儲存區不可用後不再重試，避免每本書都失敗一次。
    await store.write("book-2", new Blob(["第二本"]));
    expect(primary.writes).toBe(1);
    expect(await (await store.read("book-2"))?.text()).toBe("第二本");
  });

  it("儲存空間不足必須回報，不得默默改用後備儲存", async () => {
    const primary: BookFileStore = {
      write: async () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
      read: async () => undefined,
      remove: async () => {},
    };
    const fallback = new MemoryStore();
    const store = new ResilientBookFileStore(primary, fallback);

    await expect(store.write("book-1", new Blob(["內容"]))).rejects.toThrow();
    expect(fallback.files.size).toBe(0);
  });

  it("優先讀取主要儲存區，找不到才讀後備", async () => {
    const primary = new MemoryStore();
    const fallback = new MemoryStore();
    const store = new ResilientBookFileStore(primary, fallback);

    await primary.write("book-1", new Blob(["OPFS"]));
    await fallback.write("book-2", new Blob(["IndexedDB"]));

    expect(await (await store.read("book-1"))?.text()).toBe("OPFS");
    expect(await (await store.read("book-2"))?.text()).toBe("IndexedDB");

    await store.remove("book-1");
    expect(await store.read("book-1")).toBeUndefined();
  });
});

describe("IndexedDbBookFileStore", () => {
  it("可寫入、讀回與刪除書檔", async () => {
    const store = new IndexedDbBookFileStore(`book-files-test-${crypto.randomUUID()}`);
    await store.write("book-1", new Blob(["PDF bytes"], { type: "application/pdf" }));

    const found = await store.read("book-1");
    expect(await found?.text()).toBe("PDF bytes");

    await store.remove("book-1");
    expect(await store.read("book-1")).toBeUndefined();
    await store.destroy();
  });
});
