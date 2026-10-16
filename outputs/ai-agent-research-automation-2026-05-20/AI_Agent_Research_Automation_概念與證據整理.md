# AI Agent Research Automation: 重要概念與實驗證據整理

日期: 2026-05-20

## 一句話結論

這三篇文章共同支持一個可操作的 AI Agent Research Automation 概念: 研究代理人不只是摘要文獻，而是把「文獻搜尋 -> 假說生成 -> 新穎性/可行性評估 -> 實驗設計 -> 資料分析 -> 評審批判 -> 迭代修正」做成可稽核的多代理人流程。最強的實驗證據來自 Ghareeb 2026 的 Robin 與 Gottweis 2026 的 Co-Scientist；Talukdar 2024 則提供較高層次的 agentic AI / multi-agent system 定義與產業風險框架，但不是實驗論文。

## 重要概念

### 1. 從「AI 輔助研究」走向「AI 代理式研究流程」

傳統 LLM 用於研究，多半停在 brainstorming、文獻摘要、寫作或程式輔助。Robin 與 Co-Scientist 的核心差異，是把研究拆成多個具角色分工的代理人，並讓代理人之間形成可迭代流程。

可採用的工作流:

1. 文獻代理人搜尋與整理先驗知識。
2. 假說代理人提出可測試假說。
3. 評估代理人檢查新穎性、可行性、引用依據與安全性。
4. 實驗代理人提出實驗或運算模板。
5. 分析代理人處理實驗資料、產圖、產生解釋。
6. 評審代理人批判輸出。
7. 演化代理人根據批判與新資料修改假說。

### 2. Multi-agent specialization 比單一 agent 更可靠

Ghareeb 2026 的 Robin 使用 Crow/Falcon 作為文獻搜尋代理人，Finch 作為資料分析代理人；Gottweis 2026 的 Co-Scientist 使用 Generation、Reflection、Ranking、Evolution、Proximity、Meta-review 等代理人。兩者都把「研究推理」拆成不同模組，而不是靠一個聊天模型一次完成。

### 3. Test-time compute scaling 與 tournament/ranking 是核心機制

Co-Scientist 的關鍵不是只生成一個答案，而是大量生成候選假說，再透過 ranking、debate、evolution 逐步提高品質。這對研究自動化很重要，因為科學研究通常是搜尋問題，而不是單一正解問題。

### 4. Lab-in-the-loop / scientist-in-the-loop 是目前合理邊界

兩篇強證據論文都不是宣稱完全取代科學家。Robin 由 AI 產生假說與分析資料，但濕實驗仍由人類執行；Co-Scientist 也強調 expert-in-the-loop，尤其在候選藥物篩選、實驗優先順序與臨床轉譯判斷上。

### 5. 可稽核性比「自動化程度」更重要

有效的 research automation 需要保存 prompt、文獻來源、候選假說、排名、實驗腳本、分析 notebook、圖表、review 與修正紀錄。AI Scientist GitHub repo 的 template/run/result/paper/review 結構正好符合這個方向。

## 與重要概念相關的實驗證據

### Ghareeb 2026: Robin multi-agent system

核心主張: Robin 自動化了生物研究中的假說生成與實驗資料分析，並把結果回饋到下一輪假說。

證據:

- Robin 分析 551 篇論文約 30 分鐘，作者估計人類約需 540 小時；整體 discovery workflow 從估計 872-937 human hours 降到少於 2 小時。
- Robin 先提出 30 個 dry AMD 治療候選，經排序後測試 top candidates。
- 初始 RPE phagocytosis assay 後，Robin/Finch 推薦 Y-27632 相關 RNA-seq follow-up，Finch 做 DGE 與 GO enrichment。
- RNA-seq 發現 ABCA1 約 3-fold upregulation，adjusted p = 2.13 x 10^-83。
- 後續迭代中 Robin 提出 ripasudil；Finch 分析顯示 ripasudil 使 RPE phagocytosis 增加 1.89-fold，人類分析為 1.75-fold。
- primary human RPE cells 中也驗證 ripasudil 與 Y-27632 的 phagocytosis effect，且 ripasudil potency 較高。
- Ablation: 移除 Crow/Falcon 文獻代理後，候選提案品質下降；o4-mini 替代流程出現較多 hallucinated references。
- Finch 在 BixBench 相關 bioinformatics/statistics tasks 上優於沒有 agent harness 的模型。
- 與 OpenAI Deep Research 比較時，Deep Research 生成 17 個 unique candidates，但沒有藥物在該 phagocytosis assay 中成為 hits。

研究意義:

Robin 是最接近「AI Agent Research Automation」的實驗案例，因為它包含文獻搜尋、假說生成、實驗建議、資料分析、機制解釋與下一輪假說。

限制:

- 濕實驗仍由人執行。
- 實驗 protocol 還不是完全可執行格式。
- Finch 仍依賴 domain expert prompt engineering。
- 生物醫學結果屬於早期研究證據，不是臨床建議。

### Gottweis 2026: Co-Scientist

核心主張: Co-Scientist 是 Gemini-based multi-agent scientific thinking engine，用 test-time compute scaling、self-play debate、ranking tournament 與 evolution 來提升假說品質。

證據:

- 系統包含 Generation、Reflection、Ranking、Evolution、Proximity、Meta-review 等代理人，並有 persistent context memory。
- Ablation 顯示 Reflection agent 使用外部搜尋可降低「看似新穎但不合理」的 hallucinated hypotheses；Ranking agent 的 debate/ranking prompt 改善排名並減少 positional bias；Evolution agent 提升假說品質。
- 在 203 個 research goals 的 tournament 中，後期產生的 hypotheses/proposals Elo rating 較早期顯著提升，顯示 test-time compute scaling 有效。
- 在 15 個由 biomedical experts 策劃的 challenging goals 中，Co-Scientist 經迭代後在 Elo rating 上超過 Gemini 2.0 Pro、Gemini 2.0 Flash Thinking、OpenAI o1、OpenAI o3-mini-high、DeepSeek R1 與 expert best guess 等比較對象。
- 11 個 expert-evaluated goals 中，Co-Scientist 平均 preference rank 2.36，novelty 3.64/5，impact 3.09/5，整體優於比較模型。
- AML drug repurposing 濕實驗: 5 個初始候選中 Binimetinib、Pacritinib、Cerivastatin 抑制 AML cell viability；Binimetinib 在多數 AML cell lines 中 IC50 可低至 2 nM，但 TK6 non-AML control 較高。
- Novel single-agent candidates: KIRA6 在多個 AML cell lines 抑制 viability；KG-1a IC50 約 10 nM，TK6 約 180 nM，呈現可能的 selective therapeutic window。
- Drug combination: 7 組 Co-Scientist 提出的 AML combinations 在 MOLM-13 與 KG-1a 中測試，MOLM-13 多數呈現 synergy，KG-1a 則有 context-dependent synergy/antagonism。
- 另有 liver fibrosis target discovery 與 AMR mechanism hypothesis 案例，顯示系統不只適用藥物重定位。

研究意義:

Co-Scientist 對我們的概念特別重要，因為它提供了「多代理人 + 競賽式評分 + 迭代演化 + expert feedback」的完整設計。

限制:

- 大量評估仍依賴 Elo/LLM-as-judge 或小規模 expert preference。
- 濕實驗是早期 validation，不能直接推出臨床療效。
- 系統細節與基礎模型能力高度相關。

### Talukdar 2024: Agentic AI across industries

核心主張: Agentic AI 是能自主決策與執行任務的系統；multi-agent systems 透過多個代理人協作、協商與分散決策，提高複雜問題處理能力。

證據型態:

- 這篇主要是概念性/產業觀察文章，不是嚴格實驗研究。
- 重要貢獻在於整理 agentic AI 的跨產業應用方向與風險: healthcare diagnostics、finance、manufacturing、autonomous transportation，以及 coordination complexity、data privacy、bias、scalability、integration、regulation、human oversight 等問題。

研究意義:

可作為 introduction 或 background，用來定義 agentic AI 與 multi-agent systems，但不應拿它當作 AI research automation 有效性的主要實驗證據。

## AI Scientist GitHub 分析

Repo: https://github.com/sakanaai/ai-scientist

符合 AI Agent Research Automation 概念的部分:

- 自動 idea generation。
- novelty check，可使用 Semantic Scholar 或 OpenAlex。
- template-based experiment execution。
- 自動修改 `experiment.py`、`plot.py`、`notes.txt` 來執行 idea。
- 自動 LaTeX write-up。
- LLM-generated paper review。
- optional improvement loop。
- parallel GPU execution。
- 以 `templates/` 封裝研究領域，預設 NanoGPT、2D Diffusion、Grokking。

不符合或需要注意的部分:

- 它不是 Codex skill repo，沒有可直接安裝的 `SKILL.md`。
- 主要支援 Linux + NVIDIA GPU + CUDA + PyTorch；Windows/CPU-only 不適合直接跑完整流程。
- 會執行 LLM 產生的程式碼，必須 containerize 並限制網路與檔案權限。
- 目前研究範圍偏向能以程式實驗表示的問題；濕實驗或一般臨床研究需要另外做 template 與安全邊界。

已安裝的本機 skill:

- `C:\Users\User\.codex\skills\ai-agent-research-automation\SKILL.md`
- 這是根據 AI Scientist、Co-Scientist、Robin 的共同 workflow 整理成的 Codex skill。
- 不是 SakanaAI repo 原生附帶的 skill，因為該 repo 沒有 Codex skill 格式。

使用提醒:

重啟 Codex 後，新 skill 才會被自動載入。

## 建議下一步

1. 用 `ai-agent-research-automation` skill 建立你的研究 automation blueprint。
2. 先選一個可控題目，例如「AI agents for periodontal literature review and hypothesis generation」或「AI agents for neuroscience paper-to-experiment planning」。
3. 先做 dry-run: 只跑文獻搜尋、假說生成、novelty check、review，不執行 agent-generated code。
4. 若要跑 AI Scientist 類型實驗，建議另開 Linux/GPU/container 環境，再建立專用 template。
