const GOOGLE_SEARCH = "https://www.google.com/search";

export function webSearchUrl(keyword: string): string {
  const url = new URL(GOOGLE_SEARCH);
  url.searchParams.set("q", keyword.trim());
  return url.toString();
}

export function googleAiModeUrl(keyword: string): string {
  const url = new URL(GOOGLE_SEARCH);
  url.searchParams.set("udm", "50");
  url.searchParams.set("q", `請摘要並解釋關鍵字：${keyword.trim()}`);
  return url.toString();
}
