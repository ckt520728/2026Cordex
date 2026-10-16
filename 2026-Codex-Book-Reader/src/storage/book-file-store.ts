export interface BookFileStore {
  write(bookId: string, file: Blob): Promise<void>;
  read(bookId: string): Promise<Blob | undefined>;
  remove(bookId: string): Promise<void>;
}
