/**
 * PDF.js worker entry。
 *
 * 先在 worker 的 global scope 安裝 polyfill，再載入 PDF.js 的 legacy worker build，
 * 讓 iPhone／iPad Safari 也能開啟 PDF。import 的執行順序保證 polyfill 先生效。
 */
import "../../platform/install-promise-with-resolvers";
import "pdfjs-dist/legacy/build/pdf.worker.min.mjs";
