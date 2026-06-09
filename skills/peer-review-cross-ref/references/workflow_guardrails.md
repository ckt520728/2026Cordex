# Workflow Guardrails

## 高價值判準

文獻整合審稿不是把 PDF 列滿。優先順序:

1. 定位稿件 claim 與文獻方向不一致之處。
2. 找出 systematic review 或 consensus paper,判斷是否存在 unresolved controversy。
3. 把使用者自己的 PhD/lecture/reference list 轉成 mechanistic axes。
4. 把上述內容寫成作者可執行的 Major/Minor comments。

## 常見踩坑與預防

### 不要用全文 grep 掃整個磁碟 PDF

大型 PDF 庫容易 timeout,且 PDF 文字抽取不可靠。先掃資料夾名與檔名,再針對候選讀內容。

### 不要手寫特殊字元路徑

Windows 檔名可能有 en-dash、em-dash、特殊空白、Unicode normalization 差異。檔案操作先用 `Get-ChildItem` 取得真實物件與 `FullName`,再 copy。

### 不要把健康老化與疾病軌跡混為一談

每個 index 都要分開問 healthy aging、AD/MCI、stage-dependent reversal、region-dependent differences。

### 不要過早寫定論

若只有單一經典論文支持,先標成 "initial support"。寫進 reviewer comment 前,找近年 systematic review / consensus / editorial 確認是否有爭議。

### 不要忽略使用者個人引用庫

PhD viva、演講、既有 review 草稿通常已經建立機制軸。這類資料可直接轉化為高價值 reviewer comments,也能自然帶入使用者代表作。

### 長報告要設計成可迭代

報告第一屏放版本記錄。新增重大 finding 時 append `v2/v3/v3.1 更新說明`,不要每輪重寫 Executive Summary。

## Frontiers Aging Neuroscience 案例提示

此案例的可重用模式:

- Delta/theta 在 healthy aging vs AD 方向不同,是 L4 鑑別點。
- FOOOF slope/exponent convention 需先定義,AD 方向存在三方爭議。
- Microstate 空缺需用 gap note 誠實標示,再由使用者指出深層資料夾補上。
- PhD viva 引用清單可映射為 BFCS-PAF、Neurovascular-gamma、Lawlor triangulation 三條 L5 機制軸。
