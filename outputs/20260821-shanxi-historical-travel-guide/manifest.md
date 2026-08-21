# Manifest - 20260821-shanxi-historical-travel-guide

## 核心文件

| 路徑 | 用途 | SHA-256 |
|---|---|---|
| wrap-up.md | 專案總結、pitfalls、QA 與重現方式 | 提交前以 Git 內容為準 |
| manifest.md | 本檔案清單 | 提交前以 Git 內容為準 |
| artifacts/AGENTS.md | 專案規則與品質標準 | 5F8E793EB3417A7ACEECB17014E2AB8EB41983EA0FB251E917BB3B27B89E233A |
| artifacts/handoff.md | 決策、完成狀態與環境說明 | B6FFEE64D6C132F199FA2ACEB81356AEEEDF7C75E5C5A586E2AD1F941912C0A2 |
| artifacts/itinerary.md | 14 天行程與 45 個景點清單 | 6406760310359962EA55BB4C848C4330C9D84A13B9219CBDE609E5F96CE23D1B |
| artifacts/research.md | 六批歷史文化研究筆記 | 7582B556E157866D46FE30CF8384F2AFFFBB78C6E64739EBD4D63DAC4BD3E48D |
| artifacts/sources.md | 41 筆直接來源與可信度說明 | FC18CF9651AA4C71ABC4D9906267A0B2B8FF78847F2625B7F031F77F2BC036A5 |
| artifacts/guide.md | 最終繁體中文指南 | B86A4EEEC0AF400D485F7A3BFA6FE28B0364C1FF60936C67854E93EEC69B246F |
| artifacts/guide.pdf | 20 頁可攜式 PDF | 6EF02435639A6B0F53059DB257098F159C7A711A96D8254BB6AEDE2892288B96 |
| reproducibility/build_guide_pdf.py | Markdown 轉 styled HTML builder | EA56006C7E7A5E1BE487BAEB11438B1B0678082F82623A65F1B2706956CDB562 |
| reproducibility/verify_pdf.py | PDF 結構、文字、連結與視覺渲染驗證 | 3C9F14B37A082D56D41DAACE55A213E796D6D6008DA86F9801EAB48233125E19 |

## 不納入版本控制

- Chrome／Edge profile。
- Google 搜尋結果快照。
- PDF 每頁 PNG 與 contact sheets。
- Python user-site packages。
- Google Drive 中的重複鏡像。
- 本機 helper executables。

## 原始行程

- 鳳凰旅行社：https://www.travel.com.tw/TOU/TOU0020/ZWS1400048/ZCC070414BR26A

## 驗證摘要

- 45 個具名景點：全數覆蓋。
- 14 個逐日章節：完整。
- 來源：41 筆。
- PDF：20 頁 A4、未加密、嵌入繁體中文字型、41 個外部連結。
- PDF SHA-256：6EF02435639A6B0F53059DB257098F159C7A711A96D8254BB6AEDE2892288B96。
