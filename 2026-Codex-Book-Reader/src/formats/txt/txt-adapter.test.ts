import { describe, expect, it } from "vitest";

import type { TaskContext, UntrustedBookSource } from "../types";
import { TxtFormatAdapter } from "./txt-adapter";

function task(signal = new AbortController().signal): TaskContext {
  return { signal };
}

function source(text: string): UntrustedBookSource {
  return {
    fileName: "腎臟生理.txt",
    declaredMediaType: "text/plain",
    bytes: new Blob([text], { type: "text/plain" }),
    limits: {
      maxBytes: 1_000_000,
      maxExpandedBytes: 1_000_000,
      maxResourceCount: 1,
    },
  };
}

async function openSession(text: string, pageSize = 24) {
  const adapter = new TxtFormatAdapter({ pageSize });
  const opened = await adapter.open(source(text), task());
  expect(opened.ok).toBe(true);
  if (!opened.ok) throw new Error(opened.error.message);
  return opened.value;
}

describe("TxtFormatAdapter", () => {
  it("以穩定文字 offset 前後翻頁，排版改變後仍保留 Logical Location", async () => {
    const session = await openSession("0123456789".repeat(10), 20);

    const next = await session.navigate({ kind: "next" }, task());
    expect(next).toMatchObject({
      ok: true,
      value: {
        location: { payload: { offset: 20 } },
        canGoPrevious: true,
      },
    });

    const relayout = await session.setPresentation(
      {
        kind: "reflowable",
        theme: "sepia",
        fontFamily: "system-serif",
        fontSizePx: 28,
        lineHeight: 1.8,
      },
      task(),
    );

    expect(relayout).toMatchObject({
      ok: true,
      value: { location: { payload: { offset: 20 } } },
    });
  });

  it("搜尋目前書籍全文並回傳可跳轉的命中位置", async () => {
    const session = await openSession("腎臟負責調節體液。認知研究也關注腎功能。", 12);

    const result = await session.search({ text: "腎", limit: 10 }, task());

    expect(result).toMatchObject({
      ok: true,
      value: [
        { location: { payload: { offset: 0 } } },
        { location: { payload: { offset: 16 } } },
      ],
    });
  });

  it("只把明確章節標題建立為 Outline", async () => {
    const session = await openSession(
      "前言\n\n第 1 章 腎臟\n內容\n\nChapter 2 Cognition\nContent",
      30,
    );

    const result = await session.outline(task());

    expect(result).toMatchObject({
      ok: true,
      value: [{ label: "第 1 章 腎臟" }, { label: "Chapter 2 Cognition" }],
    });
  });

  it("取消中的工作回傳 aborted，而不是部分結果", async () => {
    const session = await openSession("腎功能".repeat(20), 20);
    const controller = new AbortController();
    controller.abort();

    const result = await session.search({ text: "腎" }, task(controller.signal));

    expect(result).toEqual({
      ok: false,
      error: { code: "aborted", message: "操作已取消。" },
    });
  });
});
