import { describe, expect, it } from "vitest";

import { installPromiseWithResolvers } from "./promise-with-resolvers";
import { installReadableStreamAsyncIterator } from "./readable-stream-async-iterator";

/** 模擬 Safari：有 ReadableStream，但沒有 Symbol.asyncIterator。 */
class SafariLikeStream {
  private index = 0;
  cancelled = false;
  released = false;

  constructor(private readonly chunks: readonly string[]) {}

  getReader() {
    return {
      read: async () => {
        if (this.index >= this.chunks.length) return { done: true, value: undefined };
        const value = this.chunks[this.index];
        this.index += 1;
        return { done: false, value };
      },
      cancel: async () => {
        this.cancelled = true;
      },
      releaseLock: () => {
        this.released = true;
      },
    };
  }
}

describe("installPromiseWithResolvers", () => {
  it("在缺少原生實作時補上，可 resolve 與 reject", async () => {
    class LegacyPromise<T> extends Promise<T> {}
    const scope = { Promise: LegacyPromise as unknown as PromiseConstructor };
    delete (scope.Promise as unknown as Record<string, unknown>).withResolvers;

    installPromiseWithResolvers(scope);

    const withResolvers = (scope.Promise as unknown as {
      withResolvers<T>(): { promise: Promise<T>; resolve: (value: T) => void; reject: (reason: unknown) => void };
    }).withResolvers<string>();
    withResolvers.resolve("完成");
    await expect(withResolvers.promise).resolves.toBe("完成");

    const failing = (scope.Promise as unknown as {
      withResolvers<T>(): { promise: Promise<T>; resolve: (value: T) => void; reject: (reason: unknown) => void };
    }).withResolvers<string>();
    failing.reject(new Error("失敗"));
    await expect(failing.promise).rejects.toThrow("失敗");
  });
});

describe("installReadableStreamAsyncIterator", () => {
  it("讓沒有 asyncIterator 的 stream 可以用 for await 讀完", async () => {
    installReadableStreamAsyncIterator(SafariLikeStream as unknown as { prototype: Record<string | symbol, unknown> });

    const stream = new SafariLikeStream(["第一段", "第二段"]);
    const received: string[] = [];
    for await (const chunk of stream as unknown as AsyncIterable<string>) {
      received.push(chunk);
    }

    expect(received).toEqual(["第一段", "第二段"]);
    expect(stream.released).toBe(true);
  });

  it("提早離開迴圈會取消 stream 並釋放 reader", async () => {
    installReadableStreamAsyncIterator(SafariLikeStream as unknown as { prototype: Record<string | symbol, unknown> });

    const stream = new SafariLikeStream(["第一段", "第二段", "第三段"]);
    for await (const chunk of stream as unknown as AsyncIterable<string>) {
      expect(chunk).toBe("第一段");
      break;
    }

    expect(stream.cancelled).toBe(true);
    expect(stream.released).toBe(true);
  });

  it("已有原生實作時不覆寫", () => {
    const native = () => ({}) as AsyncIterableIterator<unknown>;
    const constructor = { prototype: { [Symbol.asyncIterator]: native } as Record<string | symbol, unknown> };

    installReadableStreamAsyncIterator(constructor);

    expect(constructor.prototype[Symbol.asyncIterator]).toBe(native);
  });
});
