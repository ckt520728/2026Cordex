---
status: accepted
---

# FormatAdapter 採 capability-aware ReaderSession

`FormatAdapter` 以 `probe`／`open` 建立具名方法的 `ReaderSession`，由 session 提供 navigation、search、outline、point/range anchor capture、anchor resolution、presentation、decorations、events 與 lifecycle。每一本 Book 以 discriminated capabilities 回報 available／degraded／unavailable；Logical Location 與 persisted anchors 為 versioned、JSON-serializable、opaque tokens，所有重工作業接受 cancellable `TaskContext`。

## Consequences

- 不採單一 generic `request()` envelope，避免把合法與非法 operation 組合藏在大型 map。
- 不把每個 capability 暴露成巢狀 service ports，避免 UI 承擔 orchestration。
- Library、Bookmark／Highlight persistence、backup 與 external navigation 不屬於 adapter。
- adapter contract tests 必須跨 EPUB、TXT、PDF 驗證相同行為與 degradation reasons。
- engine-specific location schema 需透過 codec namespace／version migration，不得洩漏到 UI。
