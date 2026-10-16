---
status: accepted
---

# iPhone 與 iPad 採不同密度的 responsive reader layout

iPhone Library 使用頂部分類 chips，Reader 採全螢幕並以 bottom sheets 呈現 Outline、Search、Bookmarks、Highlights 與 Typography；iPad Library 使用 sidebar＋書籍 grid，Reader 提供可收合 side panel 並維持適讀內容寬度。兩者皆保留明確 Previous／Next、進度與 Bookmark controls，採暖色紙張感及低對比夜間模式，不複製參考 Android app 的舊式 Material UI。

## Consequences

- 所有 interactive targets 至少 44×44 CSS px，並處理 iOS safe-area insets。
- portrait／landscape 切換後維持 Logical Location 與已開啟 panel context。
- 支援 Dynamic Type、keyboard focus、screen-reader labels、color contrast 與 reduced motion。
- iPhone bottom sheet 與 iPad side panel 使用同一組 feature modules，不能形成兩套行為。
