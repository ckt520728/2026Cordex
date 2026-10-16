import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { BookImportService } from "./application/book-import-service";
import { App, type AppServices } from "./App";
import type { BookFileStore } from "./storage/book-file-store";
import { LibraryRepository } from "./storage/library-repository";

class MemoryBookFileStore implements BookFileStore {
  private readonly files = new Map<string, Blob>();

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

const repositories: LibraryRepository[] = [];

function services(): AppServices {
  const repository = new LibraryRepository(`app-test-${crypto.randomUUID()}`);
  const fileStore = new MemoryBookFileStore();
  repositories.push(repository);
  return {
    repository,
    fileStore,
    importer: new BookImportService(repository, fileStore),
  };
}

async function readyImportInput(): Promise<HTMLInputElement> {
  const input = screen.getByLabelText("匯入電子書") as HTMLInputElement;
  await waitFor(() => expect(input).toBeEnabled());
  return input;
}

afterEach(async () => {
  cleanup();
  await Promise.all(repositories.splice(0).map((repository) => repository.destroy()));
});

describe("Library user flow", () => {
  it("匯入 TXT、標記 Beloved，並由 Beloved view 找回", async () => {
    const user = userEvent.setup();
    render(<App services={services()} />);

    await user.upload(
      await readyImportInput(),
      new File(["第 1 章 腎臟\n測試內容"], "腎臟生理.txt", {
        type: "text/plain",
      }),
    );

    expect(await screen.findByRole("heading", { name: "腎臟生理" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "加入最愛：腎臟生理" }));
    await user.click(screen.getByRole("button", { name: "最愛" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "腎臟生理" })).toBeInTheDocument();
    });
  });

  it("開啟 TXT 後可閱讀下一頁並返回書庫", async () => {
    const user = userEvent.setup();
    render(<App services={services()} />);
    const content = `第 1 章 腎臟\n${"腎臟調節體液與電解質。".repeat(120)}`;

    await user.upload(
      await readyImportInput(),
      new File([content], "腎臟生理.txt", { type: "text/plain" }),
    );

    await user.click(await screen.findByRole("button", { name: "開始閱讀：腎臟生理" }));

    expect(await screen.findByRole("heading", { name: "腎臟生理" })).toBeInTheDocument();
    expect(screen.getByText(/第 1 章 腎臟/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "下一頁" }));
    expect(screen.getByLabelText(/閱讀進度/)).not.toHaveAccessibleName("閱讀進度 0%");

    await user.click(screen.getByRole("button", { name: "返回書庫" }));
    expect(await screen.findByRole("heading", { name: "我的書庫" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "繼續閱讀：腎臟生理" }));
    await waitFor(() => {
      expect(screen.getByLabelText(/閱讀進度/)).not.toHaveAccessibleName("閱讀進度 0%");
    });
  });

  it("Reader 可使用目錄、書內搜尋、Bookmark 與 Typography", async () => {
    const user = userEvent.setup();
    render(<App services={services()} />);
    const content = `第 1 章 腎臟\n${"體液調節。".repeat(80)}\n第 2 章 腎小球\n腎小球過濾率`;
    await user.upload(
      await readyImportInput(),
      new File([content], "腎臟生理.txt", { type: "text/plain" }),
    );
    await user.click(await screen.findByRole("button", { name: "開始閱讀：腎臟生理" }));

    await user.click(screen.getByRole("button", { name: "目錄" }));
    const outlineEntry = await screen.findByRole("button", { name: /第 1 章 腎臟/ });
    expect(outlineEntry).toBeInTheDocument();
    // 目錄項目必須同時顯示頁碼。
    expect(outlineEntry).toHaveTextContent(/1 \/ \d+/);
    await user.click(screen.getByRole("button", { name: "目錄" }));

    await user.click(screen.getByRole("button", { name: "搜尋" }));
    await user.type(screen.getByLabelText("搜尋目前書籍"), "腎小球過濾率");
    await user.click(within(screen.getByLabelText("閱讀功能面板")).getByRole("button", { name: "搜尋" }));
    expect(await screen.findByRole("button", { name: /腎小球過濾率/ })).toBeInTheDocument();
    await user.click(within(screen.getByLabelText("閱讀工具")).getByRole("button", { name: "搜尋" }));

    await user.click(screen.getByRole("button", { name: "書籤" }));
    await user.click(screen.getByRole("button", { name: "書籤清單" }));
    expect(await screen.findByRole("button", { name: "位置 1 / 1" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "字體" }));
    expect(screen.getByLabelText(/字級 19px/)).toHaveAttribute("min", "14");
  });

  it("批次匯入部分失敗時仍顯示已成功寫入的書籍", async () => {
    const user = userEvent.setup({ applyAccept: false });
    render(<App services={services()} />);

    await user.upload(await readyImportInput(), [
      new File(["第 1 章 腎臟\n內容"], "成功書籍.txt", { type: "text/plain" }),
      new File(["不支援"], "失敗書籍.mobi", { type: "application/x-mobipocket-ebook" }),
    ]);

    expect(await screen.findByRole("heading", { name: "成功書籍" })).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveTextContent("已匯入 1 本；1 本失敗：失敗書籍.mobi");
  });

  it("PWA 收到更新事件時顯示更新提示，並提供立即更新與稍後選項", async () => {
    const user = userEvent.setup();
    let updated = false;
    render(<App services={services()} />);

    window.dispatchEvent(
      new CustomEvent("book-reader-update-available", {
        detail: { update: () => { updated = true; } },
      }),
    );

    expect(await screen.findByRole("status", { name: "應用程式更新提示" })).toBeInTheDocument();
    expect(screen.getByText(/墨頁有新版本可用/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "立即更新" }));
    expect(updated).toBe(true);
  });

  it("iOS 安裝提示可在 Safari 瀏覽環境顯示並允許讀者關閉", async () => {
    const user = userEvent.setup();
    const originalUserAgent = navigator.userAgent;
    Object.defineProperty(navigator, "userAgent", {
      value: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15",
      configurable: true,
    });

    try {
      render(<App services={services()} />);
      const guidance = await screen.findByLabelText("iOS 安裝說明");
      expect(guidance).toBeInTheDocument();
      expect(screen.getByText(/加入主畫面/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "關閉安裝說明" }));
      await waitFor(() => {
        expect(screen.queryByLabelText("iOS 安裝說明")).not.toBeInTheDocument();
      });
    } finally {
      Object.defineProperty(navigator, "userAgent", {
        value: originalUserAgent,
        configurable: true,
      });
    }
  });

  it("Storage Usage 顯示使用量、配額，並在空間高於 80% 時呈現警示", async () => {
    const user = userEvent.setup();
    const originalStorage = navigator.storage;
    let estimateCount = 0;
    Object.defineProperty(navigator, "storage", {
      value: {
        estimate: () => {
          estimateCount++;
          return Promise.resolve({ usage: 850 * 1024 * 1024, quota: 1000 * 1024 * 1024 });
        },
      },
      configurable: true,
    });

    try {
      render(<App services={services()} />);
      const storagePanel = await screen.findByLabelText("裝置儲存空間");
      expect(storagePanel).toBeInTheDocument();
      expect(screen.getByText(/850\.0 MB/)).toBeInTheDocument();
      expect(screen.getByText(/空間偏高|空間即將不足/)).toBeInTheDocument();

      await user.click(screen.getByRole("button", { name: "重新整理空間估算" }));
      expect(estimateCount).toBeGreaterThanOrEqual(2);
    } finally {
      Object.defineProperty(navigator, "storage", {
        value: originalStorage,
        configurable: true,
      });
    }
  });
});

describe("iOS 檔案來源相容性", () => {
  it("匯入輸入不設 accept filter，避免 iOS Files／Google Drive／Dropbox 檔案變灰無法選取", async () => {
    render(<App services={services()} />);
    const input = await readyImportInput();

    expect(input.getAttribute("accept")).toBeNull();
  });

  it("還原 Backup 輸入同樣不設 accept filter", async () => {
    render(<App services={services()} />);
    const input = screen.getByLabelText("選擇 Backup 檔案") as HTMLInputElement;

    expect(input.getAttribute("accept")).toBeNull();
  });

  it("匯入不支援的格式時，明確說明失敗原因", async () => {
    const user = userEvent.setup();
    render(<App services={services()} />);

    await user.upload(
      await readyImportInput(),
      new File(["dummy"], "筆記.mobi", { type: "application/octet-stream" }),
    );

    expect(await screen.findByText(/只支援 EPUB、TXT、PDF/)).toBeInTheDocument();
  });
});
