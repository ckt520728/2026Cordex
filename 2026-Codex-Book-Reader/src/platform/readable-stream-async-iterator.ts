/**
 * `ReadableStream` 的 async iteration polyfill。
 *
 * PDF.js 以 `for await (const value of readableStream)` 讀取文字內容，
 * 但 Safari 並未實作 `ReadableStream.prototype[Symbol.asyncIterator]`，
 * 會直接丟出 "undefined is not a function"，PDF 完全打不開。
 * 主執行緒與 PDF worker 都必須各自安裝一次。
 */
interface StreamReader<T> {
  read(): Promise<{ done: boolean; value?: T }>;
  cancel(reason?: unknown): Promise<void>;
  releaseLock(): void;
}

interface StreamLike<T> {
  getReader(): StreamReader<T>;
}

type StreamConstructor = {
  prototype: Record<string | symbol, unknown>;
};

export function installReadableStreamAsyncIterator(
  constructor: StreamConstructor | undefined = typeof ReadableStream === "undefined"
    ? undefined
    : (ReadableStream as unknown as StreamConstructor),
): void {
  if (!constructor?.prototype) return;
  if (typeof constructor.prototype[Symbol.asyncIterator] === "function") return;

  function values<T>(
    this: StreamLike<T>,
    options: { preventCancel?: boolean } = {},
  ): AsyncIterableIterator<T> {
    const reader = this.getReader();
    const iterator: AsyncIterableIterator<T> = {
      async next(): Promise<IteratorResult<T>> {
        try {
          const result = await reader.read();
          if (result.done) {
            reader.releaseLock();
            return { done: true, value: undefined as never };
          }
          return { done: false, value: result.value as T };
        } catch (error) {
          reader.releaseLock();
          throw error;
        }
      },
      async return(value?: unknown): Promise<IteratorResult<T>> {
        if (!options.preventCancel) await reader.cancel(value).catch(() => undefined);
        reader.releaseLock();
        return { done: true, value: value as never };
      },
      [Symbol.asyncIterator]() {
        return iterator;
      },
    };
    return iterator;
  }

  constructor.prototype.values = values;
  constructor.prototype[Symbol.asyncIterator] = values;
}
