# CGM／HHSA 證據核查公開版

本資料夾保存一份去識別化、可公開的 methods-review wrap-up。研究問題是：當一組生理限制的 Holo-Hilbert Spectral Analysis（HHSA）features 在 internal cross-validation 中呈現較高平均表現時，現有證據是否足以宣稱它優於 conventional CGM metrics？

結論：較高的 mean internal CV performance 尚不足以建立 statistical superiority、incremental value、clinical usefulness 或 generalizability。單一真實 CGM 個案可用於檢查分解、頻帶指派、數值敏感度與可重現性，不能重現 population-level classification performance。

## 內容

- [`WRAP_UP_PUBLIC.md`](WRAP_UP_PUBLIC.md)：完成事項、遭遇的 pitfalls、驗證與後續建議。
- [`EVIDENCE_BOUND_REVIEW_SUMMARY.md`](EVIDENCE_BOUND_REVIEW_SUMMARY.md)：可公開的審稿判定與作者需補充的分析。
- [`artifact/index.html`](artifact/index.html)：離線可開啟的互動式 evidence-audit artifact。
- [`PRIVATE_ARTIFACTS_MANIFEST.md`](PRIVATE_ARTIFACTS_MANIFEST.md)：未公開的完整內部產物清單與不公開理由。
- [`manifest.sha256`](manifest.sha256)：本資料夾已提交檔案的 SHA-256。

## 公開邊界

本 package 不包含未出版 manuscript、reviewer PDF、Word 摘錄、原始或 digitized CGM、AGP PDF、單一患者 HHSA 圖、患者識別資料、Claude private artifact URL、本機絕對路徑或暫存環境。完整內部成果保存在使用者的私人 Obsidian Second Brain。

> 此為方法學與審稿證據強度的 AI 輔助判斷，需由 reviewer 依原稿、期刊政策與統計分析結果自行確認。
