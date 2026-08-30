import { describe, expect, it } from "vitest";

import {
  createBookRecord,
  markBookOpened,
  setBeloved,
  setFinished,
  setMustRead,
} from "./library";

describe("Device Library 的分類與 Reading State", () => {
  it("Must-read 與 Beloved 可重疊且不改變 Reading State", () => {
    const imported = createBookRecord({
      id: "book-1",
      checksum: "sha256-a",
      fileName: "腎臟生理.txt",
      title: "腎臟生理",
      authors: ["示例作者"],
      format: "txt",
      byteSize: 1024,
      importedAt: "2026-08-29T00:00:00.000Z",
    });

    const classified = setBeloved(setMustRead(imported, true), true);

    expect(classified.readingState).toBe("unread");
    expect(classified.mustRead).toBe(true);
    expect(classified.beloved).toBe(true);
  });

  it("開啟未讀 Book 後成為 Reading，抵達結尾後成為 Finished", () => {
    const imported = createBookRecord({
      id: "book-2",
      checksum: "sha256-b",
      fileName: "認知神經科學.epub",
      title: "認知神經科學",
      authors: [],
      format: "epub",
      byteSize: 2048,
      importedAt: "2026-08-29T00:00:00.000Z",
    });

    const reading = markBookOpened(imported);
    const finished = setFinished(reading, true);
    const reopened = markBookOpened(finished);

    expect(reading.readingState).toBe("reading");
    expect(finished.readingState).toBe("finished");
    expect(reopened.readingState).toBe("finished");
  });

  it("取消 Finished 時，有進度回到 Reading，沒有進度回到 Unread", () => {
    const imported = createBookRecord({
      id: "book-3",
      checksum: "sha256-c",
      fileName: "急症處置.pdf",
      title: "急症處置",
      authors: [],
      format: "pdf",
      byteSize: 4096,
      importedAt: "2026-08-29T00:00:00.000Z",
    });

    expect(setFinished({ ...imported, readingState: "finished" }, false).readingState).toBe("unread");
    expect(
      setFinished(
        { ...imported, readingState: "finished", progress: 0.42 },
        false,
      ).readingState,
    ).toBe("reading");
  });
});
