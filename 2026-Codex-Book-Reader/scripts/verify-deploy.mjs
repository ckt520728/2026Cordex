// 逐一比對本機 dist 與 production 上「全部」檔案的 SHA-256。
// 用法：node scripts/verify-deploy.mjs [origin]
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import { join, posix, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";

const origin = (process.argv[2] ?? "https://codex-book-reader.web.app").replace(/\/$/, "");
const distDir = fileURLToPath(new URL("../dist/", import.meta.url));

async function listFiles(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listFiles(full)));
    else files.push(full);
  }
  return files;
}

const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");

const files = (await listFiles(distDir))
  .map((file) => relative(distDir, file).split(sep).join(posix.sep))
  .sort();

let mismatched = 0;
for (const file of files) {
  const local = sha256(await readFile(join(distDir, file)));
  let remote = "";
  try {
    const response = await fetch(`${origin}/${file}`, { cache: "no-store" });
    remote = response.ok ? sha256(Buffer.from(await response.arrayBuffer())) : `HTTP ${response.status}`;
  } catch (error) {
    remote = error instanceof Error ? error.message : "fetch failed";
  }
  const ok = local === remote;
  if (!ok) mismatched += 1;
  console.log(`${ok ? "MATCH" : "DIFF "}  ${file}\n        local  ${local}\n        remote ${remote}`);
}

console.log(`\n檢查 ${files.length} 個 production 檔案；一致 ${files.length - mismatched}、不一致 ${mismatched}。`);
process.exit(mismatched === 0 ? 0 : 1);
