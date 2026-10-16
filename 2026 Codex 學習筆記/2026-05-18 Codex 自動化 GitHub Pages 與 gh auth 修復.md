---
title: Codex 自動化 GitHub Pages 與 gh auth 修復
date: '2026-05-18'
status: resolved
type: operations-note
source: Codex conversation
tags:
  - codex
  - github-cli
  - github-pages
  - automation
  - obsidian
related:
  - '[[知識庫/index]]'
  - '[[知識庫/log]]'
  - '[[知識庫/Codex 懶人包/02.5-連接GitHub與Obsidian-安裝踩坑]]'
---
# Codex 自動化 GitHub Pages 與 gh auth 修復

## 範圍

這份筆記整理 2026-05-18 的實際 Codex 操作與踩坑，包含三件事：

- 每日 Codex heartbeat automation 無法 resume 舊 thread。
- `ckt520728/kidney-cognition-lab` 的 GitHub Pages build 失敗。
- Windows 上 GitHub CLI token / keyring 狀態失效，導致 Codex 內驗證混亂。

本筆記不包含任何 GitHub token 或敏感憑證。

## 1. 每日自動化無法啟動

### 症狀

Codex 顯示：

```text
無法啟動自動化
cannot resume running thread 019e1a2e-1496-7f22-a085-8902f3de8651 with stale path:
requested C:\Users\User\.codex\sessions\2026\05\12\rollout-2026-05-12T11-14-48-019e1a2e-1496-7f22-a085-8902f3de8651.jsonl,
active \\?\C:\Users\User\.codex\sessions\2026\05\12\rollout-2026-05-12T11-14-48-019e1a2e-1496-7f22-a085-8902f3de8651.jsonl
```

### 診斷

自動化設定檔位於：

```text
C:\Users\User\.codex\automations\automation\automation.toml
```

它是 heartbeat automation，原本綁定舊 thread：

```toml
id = "automation"
kind = "heartbeat"
name = "生活計畫與任務追蹤"
rrule = "FREQ=DAILY;BYHOUR=7,20;BYMINUTE=0;BYSECOND=0"
target_thread_id = "019e1a2e-1496-7f22-a085-8902f3de8651"
```

檔案本身存在，但 automation resume path stale。根因不是 prompt 壞掉，而是 heartbeat 還綁在舊 thread。

### 修復

保留原 prompt 與排程，只把 heartbeat destination 改綁到目前可恢復的 thread。

修復後：

```toml
target_thread_id = "019e3865-e67c-7ed1-a9f0-deb6467a5c32"
```

### 驗證

下一次 heartbeat 成功觸發早晨摘要，代表自動化可以恢復執行。

## 2. GitHub Pages build 失敗

### 症狀

Gmail 收到 GitHub Actions 通知：

```text
[ckt520728/kidney-cognition-lab] Run failed: pages build and deployment - main (7040b75)
pages build and deployment / build: Failed
deploy: Skipped
```

失敗 run：

```text
https://github.com/ckt520728/kidney-cognition-lab/actions/runs/25996085956
```

### 診斷

失敗點是 GitHub Pages 內建流程的 `Build with Jekyll`。遠端 `main` 從本機 `645de7a` 前進到：

```text
7040b75 Add Google site verification meta tag
```

該 commit 只新增：

```html
<meta name="google-site-verification" content="xxxxxxxxxxxxxxxx" />
```

此 repo 是純靜態 HTML，不是 Jekyll site。讓 GitHub Pages 走 Jekyll build 會增加不必要的解析風險，尤其頁面內含 JavaScript/template-like braces。

### 修復

在 repo root 新增 `.nojekyll`：

```text
C:\Users\User\Documents\github-repos\kidney-cognition-lab\.nojekyll
```

提交：

```text
e33e74a Disable Jekyll for GitHub Pages
```

### 驗證

新的 Pages workflow 成功：

```text
run id: 26006782036
status: completed
conclusion: success
head_sha: e33e74ad3126c75bb605d52bfbc59bd36736a656
```

網站也可正常開啟：

```text
https://ckt520728.github.io/kidney-cognition-lab/
```

首頁 HTTP 200，並保留 Google verification tag。

## 3. GitHub CLI token / keyring 修復

### 症狀

Codex 內執行 `gh auth status` 顯示：

```text
github.com
  X Failed to log in to github.com account ckt520728 (default)
  - Active account: true
  - The token in default is invalid.
  - To re-authenticate, run: gh auth login -h github.com
```

GraphQL repo access 失敗：

```text
HTTP 401: Requires authentication
Try authenticating with: gh auth login
```

Git HTTPS 也曾在 sandbox 裡失敗：

```text
fatal: unable to access 'https://github.com/ckt520728/kidney-cognition-lab.git/':
schannel: AcquireCredentialsHandle failed: SEC_E_NO_CREDENTIALS (0x8009030e)
```

### 踩到的坑

1. 從 Codex 直接啟動 `gh auth login --web`，device-code flow 會 timeout 或不顯示互動畫面。
2. 用 `Start-Process` 包 PowerShell helper 時，複雜引號與提示文字造成 PowerShell parser error。
3. `--with-token` 若被貼成 Unicode dash，不是 ASCII `--`，GitHub CLI 只會顯示 help，不會讀 token。
4. PAT flow 看似完成，但沒有寫入可用 token。
5. 使用者自己的 PowerShell 可以讀 Windows keyring，但 Codex 一般 sandbox 讀不到，導致誤判 token 仍 invalid。

### 成功流程

1. 清除失效帳號：

```powershell
gh auth logout -h github.com -u ckt520728
```

2. 在一般使用者 PowerShell 執行：

```powershell
gh auth login
```

3. 依序選擇：

```text
GitHub.com
HTTPS
Authenticate Git with your GitHub credentials: Yes
Login with a web browser
```

4. 用瀏覽器/device code 登入 `ckt520728` 並授權 GitHub CLI。

5. 在同一個 PowerShell 驗證：

```powershell
gh auth status
```

成功狀態：

```text
Logged in to github.com account ckt520728 (keyring)
Active account: true
Git operations protocol: https
Token scopes: 'gist', 'read:org', 'repo', 'workflow'
```

### Codex 端驗證規則

使用者 PowerShell 顯示成功後，Codex 一般 sandbox 仍可能顯示 invalid。此時不要立刻要求使用者重登，應改用允許讀 Windows keyring 的高權限驗證：

```text
gh auth status
gh repo view ckt520728/kidney-cognition-lab --json name,owner,url,visibility,defaultBranchRef
gh api repos/ckt520728/kidney-cognition-lab/actions/runs --jq '.workflow_runs[0]'
git ls-remote https://github.com/ckt520728/kidney-cognition-lab.git main
```

以上在高權限下全部通過，表示 GitHub CLI 已修復。

## 可重用規則

- Codex heartbeat resume 錯誤先查 `C:\Users\User\.codex\automations\<id>\automation.toml`，確認 `target_thread_id` 是否還指向舊 thread。
- 純靜態 GitHub Pages repo 建議加 `.nojekyll`，避免不必要的 Jekyll parsing。
- Windows 上 GitHub CLI 要分三層診斷：
  - `gh` 是否安裝且在 PATH。
  - `gh` 是否已登入 Windows keyring。
  - Codex sandbox 是否有權限讀 Windows keyring。
- 若使用者 PowerShell 顯示 `Logged in ... (keyring)`，但 Codex 仍說 token invalid，先用高權限驗證，不要重複要求登入。
- PAT 不要貼到聊天；若真的使用 PAT，只貼到本機 PowerShell prompt。

## 最終狀態

- 每日自動化已恢復。
- `kidney-cognition-lab` GitHub Pages build 已恢復。
- `gh` 已用 `ckt520728` 登入，scopes 包含 `gist`, `read:org`, `repo`, `workflow`。
- Codex 用高權限可驗證 GitHub repo/API/git access。
