import { describe, expect, it } from "vitest";

import { googleAiModeUrl, webSearchUrl } from "./external-lookup";

describe("external keyword lookup", () => {
  it("Web Search 只傳送選取詞", () => {
    expect(webSearchUrl("腎小球過濾率")).toBe("https://www.google.com/search?q=%E8%85%8E%E5%B0%8F%E7%90%83%E9%81%8E%E6%BF%BE%E7%8E%87");
  });

  it("Google AI Mode 使用明示摘要 prompt 且不帶書籍上下文", () => {
    const url = new URL(googleAiModeUrl("腎小球過濾率"));
    expect(url.searchParams.get("udm")).toBe("50");
    expect(url.searchParams.get("q")).toBe("請摘要並解釋關鍵字：腎小球過濾率");
  });
});
