/**
 * `Promise.withResolvers` polyfill。
 *
 * PDF.js 6 直接使用這個 API，但 iOS Safari 要到 17.4 才支援；
 * 缺少時 PDF.js 會丟出 "undefined is not a function"，整個 PDF 無法開啟。
 * 主執行緒與 PDF worker 都必須各自安裝一次（Worker 有獨立的 global scope）。
 */
interface PromiseWithResolvers<T> {
  promise: Promise<T>;
  resolve: (value: T | PromiseLike<T>) => void;
  reject: (reason?: unknown) => void;
}

type PromiseConstructorWithResolvers = PromiseConstructor & {
  withResolvers?<T>(): PromiseWithResolvers<T>;
};

export function installPromiseWithResolvers(
  scope: { Promise: PromiseConstructor } = globalThis,
): void {
  const target = scope.Promise as PromiseConstructorWithResolvers;
  if (typeof target.withResolvers === "function") return;

  target.withResolvers = function withResolvers<T>(this: PromiseConstructor): PromiseWithResolvers<T> {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new this<T>((resolveFn, rejectFn) => {
      resolve = resolveFn;
      reject = rejectFn;
    });
    return { promise, resolve, reject };
  };
}
