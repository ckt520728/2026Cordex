---
status: failed-gate-use-local-adapter
reviewed: 2026-08-29
---

# Readium Web compatibility spike

## 結論

Readium TypeScript Toolkit 不作為 v1 的 packaged EPUB parser。保留既定 `FormatAdapter` 邊界，v1 改用受限的 local EPUB adapter；未來若加入 Publication Server 或 Readium 提供瀏覽器端 packaged-publication pipeline，可替換 adapter，不改 domain 或 UI。

## Gate evidence

- Readium Web 將 TypeScript Toolkit 定位為讀取 Readium Web Publication Manifest 與相關 API 的 Navigator；Go Toolkit／Readium CLI 負責把 packaged EPUB 轉為 manifest 並經 HTTP(S) 串流資源。
- 官方架構亦把 Web 的 Publication Server 定義為 publication manifest 與 resource provider。
- 本產品的 hard constraint 是純 local、offline、OPFS、無 server，且 imported EPUB 不得取得 trusted shell 權限。

官方來源：

- https://readium.org/web/
- https://github.com/readium/ts-toolkit
- https://github.com/readium/architecture

## 判定

| Gate | 結果 | 理由 |
| --- | --- | --- |
| local packaged EPUB from OPFS | 不通過 | TypeScript Toolkit 的主要輸入是 RWPM/API，不包含本產品所需的 browser-only packaged EPUB pipeline |
| no server | 不通過 | 官方建議部署模型由 Go Toolkit／CLI 經 HTTP(S) 提供 manifest 與 resources |
| replaceable UI/domain boundary | 通過 | 現有 `FormatAdapter` 可封裝替代引擎 |
| sandbox policy | 待 local adapter fixtures 驗證 | local adapter 必須拒絕 active content 與 remote resources |

這是 architecture compatibility gate，不代表 Readium 本身品質不佳，也不排除未來版本重新評估。
