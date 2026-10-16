---
status: accepted
---

# Keyword Lookup 採 privacy-minimized external handoff

讀者選取單字或片語後，可明示選擇 Web Search 或 Google AI Mode 摘要。系統只以選取文字組成 query/prompt，不附加周邊書籍內容；Web Search 開啟外部搜尋頁，Google AI Mode 則複製 prompt 並開啟 `google.com/ai`，由讀者確認送出。首版不使用未公開的 AI Mode API、不嵌入或擷取 Google 回應，也不把摘要存回 reader。

## Consequences

- 選單必須在外送前清楚標示會離開 app 並需要網路。
- 離線時仍可選取與 Highlight，但外部查詢動作應停用並說明原因。
- query/prompt 不得包含 Book title、author、裝置識別資訊或選取範圍外的文字。
- 外部頁面的登入、history、personalization 與生成內容正確性由 Google 服務處理；reader 不宣稱摘要已驗證。
