import { describe, expect, it } from "vitest";

import { createBookRecord } from "../domain/library";
import type { BookFileStore } from "../storage/book-file-store";
import { LibraryRepository } from "../storage/library-repository";
import { BackupService } from "./backup-service";

class MemoryFileStore implements BookFileStore {
  files = new Map<string, Blob>();
  async write(id: string, file: Blob) { this.files.set(id, file); }
  async read(id: string) { return this.files.get(id); }
  async remove(id: string) { this.files.delete(id); }
}

function book(id: string, checksum = `sha-${id}`) {
  return createBookRecord({ id, checksum, fileName: `${id}.txt`, title: id, authors: [], format: "txt", byteSize: 4, importedAt: "2026-08-29T00:00:00.000Z" });
}

describe("BackupService", () => {
  it("Full Library Backup 可預覽並 round trip 原始書檔", async () => {
    const sourceRepo = new LibraryRepository(`backup-source-${crypto.randomUUID()}`);
    const sourceFiles = new MemoryFileStore();
    const targetRepo = new LibraryRepository(`backup-target-${crypto.randomUUID()}`);
    const targetFiles = new MemoryFileStore();
    try {
      await sourceRepo.addBook(book("renal"));
      await sourceFiles.write("renal", new Blob(["腎臟"]));
      const backup = await new BackupService(sourceRepo, sourceFiles).exportFullLibrary();
      const target = new BackupService(targetRepo, targetFiles);
      expect(await target.preview(backup)).toMatchObject({ kind: "full-library", newBooks: 1, duplicates: 0, conflicts: 0 });
      expect(await target.restore(backup, { idConflict: "skip" })).toEqual({ imported: 1, updated: 0, skipped: 0 });
      expect(await (await targetFiles.read("renal"))?.text()).toBe("腎臟");
    } finally {
      await Promise.all([sourceRepo.destroy(), targetRepo.destroy()]);
    }
  });

  it("以 SHA-256 checksum 預覽 duplicate 並明示跳過", async () => {
    const sourceRepo = new LibraryRepository(`backup-source-${crypto.randomUUID()}`);
    const sourceFiles = new MemoryFileStore();
    const targetRepo = new LibraryRepository(`backup-target-${crypto.randomUUID()}`);
    const targetFiles = new MemoryFileStore();
    try {
      await sourceRepo.addBook(book("source", "same-sha"));
      await sourceFiles.write("source", new Blob(["same"]));
      await targetRepo.addBook(book("existing", "same-sha"));
      const backup = await new BackupService(sourceRepo, sourceFiles).exportFullLibrary();
      const target = new BackupService(targetRepo, targetFiles);
      expect(await target.preview(backup)).toMatchObject({ duplicates: 1, newBooks: 0 });
      expect(await target.restore(backup, { idConflict: "skip" })).toEqual({ imported: 0, updated: 0, skipped: 1 });
    } finally {
      await Promise.all([sourceRepo.destroy(), targetRepo.destroy()]);
    }
  });
});
