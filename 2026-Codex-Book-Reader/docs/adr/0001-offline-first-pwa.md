---
status: accepted
---

# 採用 Offline-first PWA 作為部署形式

本產品採用 Offline-first Progressive Web App，透過 Safari 的「加入主畫面」部署至 iPhone 12 Pro Max 與 iPad，讓同一套程式碼可服務兩種裝置並支援離線閱讀。相較 Native SwiftUI 或 Capacitor hybrid，此選擇優先降低初期部署與維護成本；代價是必須接受 iOS Safari 對儲存空間、背景執行與本機檔案存取的限制。

## Considered Options

- Native SwiftUI：原生整合最佳，但需要 macOS、Xcode、簽章與 Apple Developer 發布流程。
- Capacitor hybrid：可進入 App Store，但增加 native wrapper 與雙層除錯成本。

## Consequences

- 核心閱讀與書庫資料必須能在瀏覽器端離線運作。
- 不把 App Store 上架視為首版完成條件。
- 必須在 iPhone 12 Pro Max 與 iPad 尺寸下驗證 Safari 與 standalone display mode。
