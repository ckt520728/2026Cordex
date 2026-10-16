import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { registerSW } from "virtual:pwa-register";

import { App } from "./App";
import { BookImportService } from "./application/book-import-service";
import { installPromiseWithResolvers } from "./platform/promise-with-resolvers";
import { installReadableStreamAsyncIterator } from "./platform/readable-stream-async-iterator";
import { IndexedDbBookFileStore } from "./storage/indexeddb-book-file-store";
import { OpfsBookFileStore } from "./storage/opfs-book-file-store";
import { ResilientBookFileStore } from "./storage/resilient-book-file-store";
import { LibraryRepository } from "./storage/library-repository";
import "./styles.css";

// PDF.js 6 需要 Promise.withResolvers（iOS Safari 17.4 以前沒有），
// 以及 ReadableStream 的 async iteration（Safari 至今未實作）。
installPromiseWithResolvers();
installReadableStreamAsyncIterator();

const repository = new LibraryRepository();
const fileStore = new ResilientBookFileStore(
  new OpfsBookFileStore(),
  new IndexedDbBookFileStore(),
);

const updateServiceWorker = registerSW({
  onNeedRefresh() {
    window.dispatchEvent(
      new CustomEvent("book-reader-update-available", {
        detail: { update: () => updateServiceWorker(true) },
      }),
    );
  },
  onOfflineReady() {
    window.dispatchEvent(new CustomEvent("book-reader-offline-ready"));
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App
      services={{
        repository,
        fileStore,
        importer: new BookImportService(repository, fileStore),
      }}
    />
  </StrictMode>,
);
