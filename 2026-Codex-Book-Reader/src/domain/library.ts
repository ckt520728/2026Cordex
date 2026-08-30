export type BookFormat = "epub" | "txt" | "pdf";
export type ReadingState = "unread" | "reading" | "finished";

export interface BookRecord {
  id: string;
  checksum: string;
  fileName: string;
  title: string;
  authors: string[];
  format: BookFormat;
  byteSize: number;
  importedAt: string;
  readingState: ReadingState;
  progress: number;
  lastLocation?: LogicalLocation;
  mustRead: boolean;
  beloved: boolean;
}

export type NewBookRecord = Omit<
  BookRecord,
  "readingState" | "progress" | "mustRead" | "beloved"
>;

export function createBookRecord(input: NewBookRecord): BookRecord {
  return {
    ...input,
    readingState: "unread",
    progress: 0,
    mustRead: false,
    beloved: false,
  };
}

export function markBookOpened(book: BookRecord): BookRecord {
  if (book.readingState !== "unread") {
    return book;
  }

  return { ...book, readingState: "reading" };
}

export function setFinished(book: BookRecord, finished: boolean): BookRecord {
  if (finished) {
    return { ...book, readingState: "finished", progress: 1 };
  }

  return {
    ...book,
    readingState: book.progress > 0 ? "reading" : "unread",
  };
}

export function setMustRead(book: BookRecord, mustRead: boolean): BookRecord {
  return { ...book, mustRead };
}

export function setBeloved(book: BookRecord, beloved: boolean): BookRecord {
  return { ...book, beloved };
}
import type { LogicalLocation } from "../formats/types";
