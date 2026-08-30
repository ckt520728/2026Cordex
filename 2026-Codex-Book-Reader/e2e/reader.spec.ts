import { test, expect } from "@playwright/test";
import { strToU8, zipSync } from "fflate";

function generateSampleEpub(): Buffer {
  const files = {
    "META-INF/container.xml": strToU8(`<?xml version="1.0"?>
      <container xmlns="urn:oasis:names:tc:opendocument:xmlns:container">
        <rootfiles><rootfile full-path="EPUB/package.opf" media-type="application/oebps-package+xml"/></rootfiles>
      </container>`),
    "EPUB/package.opf": strToU8(`<?xml version="1.0"?>
      <package xmlns="http://www.idpf.org/2007/opf" version="3.0">
        <metadata xmlns:dc="http://purl.org/dc/elements/1.1/">
          <dc:title>臨床神經解剖學</dc:title><dc:creator>朱國大醫師</dc:creator><dc:language>zh-TW</dc:language>
        </metadata>
        <manifest>
          <item id="nav" href="nav.xhtml" media-type="application/xhtml+xml" properties="nav"/>
          <item id="c1" href="chapter1.xhtml" media-type="application/xhtml+xml"/>
          <item id="fig1" href="images/figure1.png" media-type="image/png"/>
        </manifest>
        <spine><itemref idref="c1"/></spine>
      </package>`),
    "EPUB/nav.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><body>
      <nav epub:type="toc" xmlns:epub="http://www.idpf.org/2007/ops"><ol><li><a href="chapter1.xhtml">基底核與運動迴路</a></li></ol></nav>
    </body></html>`),
    "EPUB/chapter1.xhtml": strToU8(`<html xmlns="http://www.w3.org/1999/xhtml"><body><span id="p12"></span><h1>Preface</h1><p>紋狀體接收大腦皮質的興奮性麩胺酸投射，並透過直接路徑與間接路徑調控視丘。</p><figure><img src="images/figure1.png" alt="圖 1.1 基底核迴路"/></figure><h2>Index</h2><ol><li>i</li><li>ii</li><li>iii</li><li>73</li><li>74</li><li>75</li></ol><div><a href="chapter1.xhtml#tail">前往章節結尾</a></div><p id="tail">章節結尾內容。</p></body></html>`),
    "EPUB/images/figure1.png": Uint8Array.from(
      Buffer.from(
        "iVBORw0KGgoAAAANSUhEUgAAAAgAAAAICAYAAADED76LAAAAFklEQVR42mNk+M9QzzCKRsEoGgWjAAB6mAP9pC5tzwAAAABJRU5ErkJggg==",
        "base64",
      ),
    ),
  };
  return Buffer.from(zipSync(files));
}

function generateSamplePdf(): Buffer {
  const stream = [
    "q",
    "0.15 0.55 0.75 rg",
    "50 180 200 100 re f",
    "Q",
    "BT /F1 18 Tf 50 340 Td (Figure 2.1 Visible spectrum) Tj ET",
  ].join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    "<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 400] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    `<< /Length ${Buffer.byteLength(stream, "ascii")} >>\nstream\n${stream}\nendstream`,
  ];
  let pdf = "%PDF-1.4\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(Buffer.byteLength(pdf, "ascii"));
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });
  const xrefOffset = Buffer.byteLength(pdf, "ascii");
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(pdf, "ascii");
}

const sampleTxtContent = `第 1 章 腎臟生理學概論
腎臟是人體維持體液恆定、電解質平衡以及酸鹼調節的中樞器官。
腎小球每日過濾約 180 公升的血漿原尿，其中超過 99% 的水分與溶質在腎小管系統中被重吸收。
腎素-血管緊張素-醛固酮系統（RAAS）在血壓調節中扮演關鍵角色。

第 2 章 腎小球過濾率與測定
腎小球過濾率（GFR）是評估腎功能最重要的臨床指標。
臨床上常使用肌酸酐清除率（Creatinine Clearance）或以血清肌酸酐推估之 eGFR 公式進行分期。
慢性腎臟病（CKD）可依 GFR 與蛋白尿程度分為第一期至第五期。

第 3 章 電解質與酸鹼失衡
低鈉血症與高鉀血症是內科常見的急重症。
高鉀血症可能導致心律不整甚至心搏驟停，需緊急評估心電圖變化並施以鈣劑穩定心肌細胞膜。
`;

test.describe("墨頁 電子書閱讀器 E2E 跨裝置功能驗證", () => {
  test.beforeEach(async ({ page, browserName }) => {
    if (browserName === "webkit") {
      await page.addInitScript(() => {
        if (navigator.storage?.getDirectory) return;
        const cacheName = "codex-book-reader-opfs-e2e";
        const requestFor = (name: string) => new Request(`https://opfs.test/${encodeURIComponent(name)}`);
        const booksDirectory = {
          async getFileHandle(name: string, options?: { create?: boolean }) {
            const cache = await caches.open(cacheName);
            if (!options?.create && !(await cache.match(requestFor(name)))) {
              throw new DOMException("找不到檔案", "NotFoundError");
            }
            return {
              async createWritable() {
                let pending: Blob | undefined;
                return {
                  async write(data: Blob | BufferSource | string) {
                    pending = data instanceof Blob ? data : new Blob([data]);
                  },
                  async close() {
                    if (!pending) pending = new Blob();
                    await cache.put(requestFor(name), new Response(pending));
                  },
                  async abort() {
                    pending = undefined;
                  },
                };
              },
              async getFile() {
                const response = await cache.match(requestFor(name));
                if (!response) throw new DOMException("找不到檔案", "NotFoundError");
                const blob = await response.blob();
                return new File([blob], name, { type: blob.type });
              },
            };
          },
          async removeEntry(name: string) {
            const cache = await caches.open(cacheName);
            if (!(await cache.delete(requestFor(name)))) throw new DOMException("找不到檔案", "NotFoundError");
          },
        };
        const root = {
          async getDirectoryHandle() {
            return booksDirectory;
          },
        };
        const storage = navigator.storage ?? {};
        Object.defineProperty(storage, "getDirectory", {
          configurable: true,
          value: async () => root,
        });
        if (!navigator.storage) {
          Object.defineProperty(navigator, "storage", { configurable: true, value: storage });
        }
      });
    }
    await page.goto("/");
  });

  test("書庫載入、匯入 TXT、分類篩選與書庫搜尋", async ({ page }) => {
    // 檢查 App Shell 與書庫標題
    await expect(page.getByRole("heading", { name: "我的書庫" })).toBeVisible();

    // 匯入書籍檔案
    const fileInput = page.getByLabel("匯入電子書");
    await expect(fileInput).toBeEnabled();
    await fileInput.setInputFiles({
      name: "腎臟生理學.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(sampleTxtContent, "utf-8"),
    });

    // 驗證書籍卡片顯示
    const bookCard = page.locator(".book-card").filter({ hasText: "腎臟生理學" });
    await expect(bookCard).toBeVisible();
    await expect(bookCard.locator(".book-cover").getByText("TXT")).toBeVisible();

    // 加入必讀與最愛
    const mustReadButton = bookCard.getByRole("button", { name: /必讀/i });
    await mustReadButton.click();
    await expect(mustReadButton).toHaveAttribute("aria-pressed", "true");

    const belovedButton = bookCard.getByRole("button", { name: /最愛|♥|♡/i });
    await belovedButton.click();
    await expect(belovedButton).toHaveAttribute("aria-pressed", "true");

    // 測試必讀、最愛與已讀分類標籤切換
    const mustReadTab = page.locator(".mobile-view-tabs, .sidebar-nav").getByRole("button", { name: /^必讀/i }).first();
    await mustReadTab.click();
    await expect(page.locator(".book-card").filter({ hasText: "腎臟生理學" })).toBeVisible();

    const belovedTab = page.locator(".mobile-view-tabs, .sidebar-nav").getByRole("button", { name: /最愛/i }).first();
    await belovedTab.click();
    await expect(page.locator(".book-card").filter({ hasText: "腎臟生理學" })).toBeVisible();

    await bookCard.getByRole("button", { name: "標記已讀：腎臟生理學" }).click();
    const finishedTab = page.locator(".mobile-view-tabs, .sidebar-nav").getByRole("button", { name: /^已讀/i }).first();
    await finishedTab.click();
    await expect(page.locator(".book-card").filter({ hasText: "腎臟生理學" })).toBeVisible();

    // 測試書庫搜尋
    const searchInput = page.getByPlaceholder("搜尋 title、author 或檔名");
    await searchInput.fill("生理學");
    await expect(page.locator(".book-card").filter({ hasText: "腎臟生理學" })).toBeVisible();

    await searchInput.fill("不存在的書名");
    await expect(page.getByText("沒有符合條件的書")).toBeVisible();
    await searchInput.clear();
  });

  test("完整閱讀流程：分頁閱讀、章節目錄、書內搜尋、書籤與字級排版", async ({ page }) => {
    // 匯入書籍
    const fileInput = page.getByLabel("匯入電子書");
    await expect(fileInput).toBeEnabled();
    await fileInput.setInputFiles({
      name: "腎臟生理學.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(sampleTxtContent, "utf-8"),
    });

    // 進入閱讀畫面
    const startReadButton = page.getByRole("button", { name: /開始閱讀：腎臟生理學/i });
    await startReadButton.click();

    // 驗證閱讀器載入
    await expect(page.locator(".reader-toolbar h1")).toHaveText("腎臟生理學");
    await expect(page.getByLabel("閱讀文字")).toContainText("第 1 章 腎臟生理學概論");

    // 翻頁測試
    const nextButton = page.getByRole("button", { name: "下一頁" });
    if (await nextButton.isEnabled()) {
      await nextButton.click();
      const prevButton = page.getByRole("button", { name: "上一頁" });
      await expect(prevButton).toBeEnabled();
      await prevButton.click();
    }

    // 目錄（Outline）面板測試
    const outlineButton = page.getByLabel("閱讀工具").getByRole("button", { name: "目錄" });
    await outlineButton.click();
    const chapter2Button = page.locator(".reader-panel").getByRole("button", { name: /第 2 章 腎小球過濾率/ });
    await expect(chapter2Button).toBeVisible();
    await chapter2Button.click();
    await expect(page.getByLabel("閱讀文字")).toContainText("第 2 章 腎小球過濾率");
    await outlineButton.click();

    // 書內搜尋測試
    const searchToolButton = page.getByLabel("閱讀工具").getByRole("button", { name: "搜尋" });
    await searchToolButton.click();
    const readerSearchInput = page.getByLabel("搜尋目前書籍");
    await readerSearchInput.fill("高鉀血症");
    const locationBeforeCursorKey = await page.locator(".reader-navigation span").textContent();
    await readerSearchInput.press("ArrowLeft");
    await expect(page.locator(".reader-navigation span")).toHaveText(locationBeforeCursorKey ?? "");
    await page.locator(".reader-panel").getByRole("button", { name: "搜尋" }).click();

    const searchResultItem = page.locator(".reader-panel").getByRole("button", { name: /高鉀血症/ }).first();
    await expect(searchResultItem).toBeVisible();
    await searchResultItem.click();
    await expect(page.getByLabel("閱讀文字")).toContainText("高鉀血症");
    await searchToolButton.click();

    // 書籤（Bookmark）測試
    const bookmarkButton = page.getByLabel("閱讀工具").getByRole("button", { name: "書籤", exact: true });
    await bookmarkButton.click();

    const bookmarkListButton = page.getByLabel("閱讀工具").getByRole("button", { name: "書籤清單" });
    await bookmarkListButton.click();
    await expect(page.locator(".reader-panel li")).toBeVisible();
    await bookmarkListButton.click();

    // 字體排版（Typography）面板測試
    const fontButton = page.getByLabel("閱讀工具").getByRole("button", { name: "字體" });
    await fontButton.click();
    await expect(page.getByLabel(/字級/)).toBeVisible();
    await expect(page.getByLabel(/行距/)).toBeVisible();
    await page.getByLabel("字體").selectOption("system-sans");
    await page.getByLabel(/字級/).fill("24");
    await page.getByLabel(/行距/).fill("2");
    await expect(page.getByLabel("閱讀文字")).toHaveCSS("font-size", "24px");
    await expect(page.getByLabel("閱讀文字")).toHaveCSS("line-height", "48px");
    const renderedFamily = await page.getByLabel("閱讀文字").evaluate((element) => getComputedStyle(element).fontFamily);
    expect(renderedFamily.toLocaleLowerCase()).toContain("sans");
    if ((page.viewportSize()?.width ?? 800) < 800) {
      const panelBounds = await page.locator(".reader-panel").boundingBox();
      expect(panelBounds).not.toBeNull();
      expect(panelBounds!.y).toBeGreaterThan((page.viewportSize()?.height ?? 0) * 0.2);
      expect(panelBounds!.width).toBeGreaterThan((page.viewportSize()?.width ?? 0) * 0.9);
    }

    // 返回書庫並檢查閱讀進度
    const backButton = page.getByRole("button", { name: "返回書庫" });
    await backButton.click();
    await expect(page.getByRole("heading", { name: "我的書庫" })).toBeVisible();
    await expect(page.getByRole("button", { name: /繼續閱讀：腎臟生理學/i })).toBeVisible();
  });

  test("備份工具、儲存空間顯示與無水平溢位驗證", async ({ page }) => {
    // 檢查 Backup 工具區
    await expect(page.getByRole("button", { name: "Reading Data Backup" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Full Library Backup" })).toBeVisible();
    await expect(page.getByRole("button", { name: "檢查更新" })).toBeVisible();
    // 更新入口必須固定可見，不能只藏在可橫向捲動的備份列裡。
    await expect(page.getByRole("button", { name: "更新 App" })).toBeVisible();
    await expect(page.getByRole("button", { name: "強制更新" })).toBeVisible();

    // 檢查儲存空間指示器
    await expect(page.locator(".storage-usage")).toBeVisible();

    // 驗證行動裝置無水平溢位（Viewport overflow check）
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    const windowWidth = await page.evaluate(() => window.innerWidth);
    expect(bodyWidth).toBeLessThanOrEqual(windowWidth + 1);
  });

  test("EPUB 匯入、Metadata 解析、章節目錄與閱讀流程", async ({ page }) => {
    await page.emulateMedia({ colorScheme: "dark" });
    const fileInput = page.getByLabel("匯入電子書");
    await expect(fileInput).toBeEnabled();
    await fileInput.setInputFiles({
      name: "臨床神經解剖學.epub",
      mimeType: "application/epub+zip",
      buffer: generateSampleEpub(),
    });

    const bookCard = page.locator(".book-card").filter({ hasText: "臨床神經解剖學" });
    await expect(bookCard).toBeVisible();
    await expect(bookCard.locator(".book-cover").getByText("EPUB")).toBeVisible();

    const startReadButton = page.getByRole("button", { name: /開始閱讀：臨床神經解剖學/i });
    await startReadButton.click();

    await expect(page.locator(".reader-toolbar h1")).toHaveText("臨床神經解剖學");
    await expect(page.getByLabel("閱讀文字")).toContainText("Preface");
    await expect(page.getByLabel("閱讀文字")).toContainText("• i · ii · iii · 73 · 74 · 75");

    // EPUB 內嵌圖片必須真的解碼並顯示，而不是只留下 alt 文字。
    const figure = page.locator(".reader-content img.reader-figure-image").first();
    await expect(figure).toBeVisible();
    await expect(figure).toHaveAttribute("alt", "圖 1.1 基底核迴路");
    await expect
      .poll(async () => figure.evaluate((element: HTMLImageElement) => element.naturalWidth))
      .toBeGreaterThan(0);

    const headingContrast = await page.locator(".reader-heading").filter({ hasText: "Preface" }).evaluate((element) => {
      const parse = (value: string) => (value.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number);
      const luminance = (rgb: number[]) => {
        const channels = rgb.map((value) => {
          const normalized = value / 255;
          return normalized <= 0.04045 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
        });
        return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
      };
      const foreground = luminance(parse(getComputedStyle(element).color));
      const background = luminance(parse(getComputedStyle(element.parentElement!).backgroundColor));
      return (Math.max(foreground, background) + 0.05) / (Math.min(foreground, background) + 0.05);
    });
    expect(headingContrast).toBeGreaterThanOrEqual(4.5);

    await page.locator(".reader-paragraph").filter({ hasText: "紋狀體" }).selectText();
    await page.getByRole("button", { name: "以 green Highlight" }).click();
    await expect(page.locator(".reader-content mark.highlight-green")).toContainText("紋狀體");

    // 書中 Contents 連結必須可點擊並導覽。
    const inBookLink = page.locator(".reader-content a.reader-link").first();
    await expect(inBookLink).toBeVisible();
    await inBookLink.click();
    await expect(page.locator(".return-location-banner")).toBeVisible();
    await page.getByRole("button", { name: "關閉返回提示" }).click();

    const outlineButton = page.getByLabel("閱讀工具").getByRole("button", { name: "目錄" });
    await outlineButton.click();
    const outlineEntry = page.locator(".reader-panel").getByRole("button", { name: /基底核與運動迴路/ });
    await expect(outlineEntry).toBeVisible();
    // 目錄必須顯示書中自帶的印刷頁碼。
    await expect(outlineEntry.locator(".outline-page")).toHaveText("第 12 頁");
    await outlineButton.click();

    const backButton = page.getByRole("button", { name: "返回書庫" });
    await backButton.click();
    await expect(page.getByRole("heading", { name: "我的書庫" })).toBeVisible();
  });

  test("PDF 保留原始頁面圖形並提供 selectable Text Layer", async ({ page }) => {
    const fileInput = page.getByLabel("匯入電子書");
    await expect(fileInput).toBeEnabled();
    await fileInput.setInputFiles({
      name: "含圖表的 PDF.pdf",
      mimeType: "application/pdf",
      buffer: generateSamplePdf(),
    });

    await page.getByRole("button", { name: /開始閱讀：含圖表的 PDF/i }).click();

    await expect(page.locator("canvas[aria-label='PDF 第 1 頁']")).toBeVisible();
    await expect(page.locator(".pdf-text-layer")).toContainText("Figure 2.1 Visible spectrum");

    await page.getByLabel("閱讀工具").getByRole("button", { name: "縮放" }).click();
    const originalWidth = (await page.locator(".pdf-page-surface").boundingBox())!.width;
    await expect(page.getByLabel("PDF 縮放 100%")).toBeVisible();
    await page.getByLabel("PDF 縮放 100%").fill("1.5");
    await expect(page.getByLabel("PDF 縮放 150%")).toBeVisible();
    await expect.poll(async () => (await page.locator(".pdf-page-surface").boundingBox())!.width).toBeGreaterThan(originalWidth * 1.45);
    await page.getByLabel("閱讀工具").getByRole("button", { name: "縮放" }).click();

    await page.locator(".pdf-text-layer span").filter({ hasText: "Figure 2.1" }).first().selectText();
    await expect(page.getByRole("toolbar", { name: "選取文字工具" })).toBeVisible();
    await page.getByRole("button", { name: "以 green Highlight" }).click();
    await expect(page.getByText("無法定位這段文字，請重新選取。")).toHaveCount(0);
    await expect(page.locator(".pdf-highlight-overlay.highlight-green")).not.toHaveCount(0);

    await page.getByLabel("閱讀工具").getByRole("button", { name: "Highlights" }).click();
    await expect(page.locator("mark.highlight-green")).toContainText("Figure 2.1 Visible spectrum");
  });

  test("缺少 Iterator helpers 與 ReadableStream async iteration 時仍能開啟 PDF", async ({ page }) => {
    // 重現 iPhone／iPad Safari：沒有 Iterator 全域，ReadableStream 也不能 for await。
    await page.addInitScript(() => {
      // @ts-expect-error 模擬舊版引擎
      delete globalThis.Iterator;
      const prototype = ReadableStream.prototype as unknown as Record<symbol, unknown>;
      delete prototype[Symbol.asyncIterator];
    });

    await page.goto("/");
    const fileInput = page.getByLabel("匯入電子書");
    await expect(fileInput).toBeEnabled();
    await fileInput.setInputFiles({
      name: "相容性測試.pdf",
      mimeType: "application/pdf",
      buffer: generateSamplePdf(),
    });

    await page.getByRole("button", { name: /開始閱讀/i }).first().click();

    // 出現任何 "undefined is not a function" 或 "Can't find variable: Iterator" 都算失敗。
    await expect(page.locator("canvas[aria-label='PDF 第 1 頁']")).toBeVisible({ timeout: 20000 });
    await expect(page.locator(".pdf-text-layer")).toContainText("Figure 2.1 Visible spectrum");
  });

  test("重新啟動後保留書檔、進度、Bookmark 與 Highlight", async ({ page }) => {
    const fileInput = page.getByLabel("匯入電子書");
    await expect(fileInput).toBeEnabled();
    await fileInput.setInputFiles({
      name: "離線腎臟學.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(`${sampleTxtContent}\n${"離線閱讀內容與腎臟照護。".repeat(240)}`, "utf-8"),
    });

    await page.getByRole("button", { name: /開始閱讀：離線腎臟學/i }).click();
    await page.getByRole("button", { name: "下一頁" }).click();
    await page.getByLabel("閱讀工具").getByRole("button", { name: "書籤", exact: true }).click();
    await page.locator(".reader-paragraph").first().selectText();
    await page.getByRole("button", { name: "以 yellow Highlight" }).click();
    await expect(page.locator(".reader-content mark.highlight-yellow")).not.toHaveCount(0);

    await page.getByRole("button", { name: "返回書庫" }).click();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await expect(page.getByRole("button", { name: /繼續閱讀：離線腎臟學/i })).toBeVisible();
    await page.getByRole("button", { name: /繼續閱讀：離線腎臟學/i }).click();
    await expect(page.getByLabel(/閱讀進度/)).not.toHaveAccessibleName("閱讀進度 0%");
    await expect(page.locator(".reader-content mark.highlight-yellow")).not.toHaveCount(0);

    await page.getByLabel("閱讀工具").getByRole("button", { name: "書籤清單" }).click();
    await expect(page.locator(".reader-panel li")).toBeVisible();
  });

  test("離線重新啟動可開啟已匯入書籍", async ({ page, context, browserName }) => {
    test.skip(browserName !== "chromium", "Playwright WebKit 的 offline reload 會回報 engine internal error；由實機 Safari gate 驗證。");
    const fileInput = page.getByLabel("匯入電子書");
    await expect(fileInput).toBeEnabled();
    await fileInput.setInputFiles({
      name: "離線書籍.txt",
      mimeType: "text/plain",
      buffer: Buffer.from(sampleTxtContent, "utf-8"),
    });
    await expect(page.getByRole("button", { name: /開始閱讀：離線書籍/i })).toBeVisible();
    await page.evaluate(async () => {
      await navigator.serviceWorker.ready;
    });
    await page.reload();
    await context.setOffline(true);
    await page.reload({ waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "我的書庫" })).toBeVisible();
    await page.getByRole("button", { name: /開始閱讀：離線書籍/i }).click();
    await expect(page.getByLabel("閱讀文字")).toContainText("第 1 章 腎臟生理學概論");
  });
});
