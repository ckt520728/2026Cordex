import { describe, expect, it, vi } from "vitest";

import type { RangeAnchor, ReaderDecoration } from "./types";
import { renderTextSurface } from "./text-render-surface";

describe("text Render Surface", () => {
  it("保留原始空白、渲染 Highlight，並從第二個重複文字產生精確 token", () => {
    const element = document.createElement("article");
    document.body.append(element);
    const onSelectionChange = vi.fn();
    const anchor: RangeAnchor = {
      kind: "persisted-anchor",
      anchorKind: "range",
      format: "epub",
      codec: { namespace: "epub-text-range", version: 1 },
      payload: { start: 21, end: 26 },
      fallback: { progression: 0.8, exactQuote: "Alpha" },
    };
    const decorations: ReaderDecoration[] = [
      { kind: "highlight", id: "green-second-alpha", color: "green", anchor },
    ];

    const cleanup = renderTextSurface({
      format: "epub",
      text: "Preface\n\nAlpha  Beta Alpha",
      absoluteOffset: 0,
      decorations,
      host: { element, onSelectionChange },
    });

    expect(element.textContent).toBe("Preface\n\nAlpha  Beta Alpha");
    const highlighted = element.querySelector("mark.highlight-green");
    expect(highlighted).toHaveTextContent("Alpha");

    const selectedNode = highlighted?.firstChild;
    if (!selectedNode) throw new Error("缺少可選取的 Highlight 文字節點");
    const range = document.createRange();
    range.setStart(selectedNode, 0);
    range.setEnd(selectedNode, 5);
    const selection = document.getSelection();
    selection?.removeAllRanges();
    selection?.addRange(range);
    document.dispatchEvent(new Event("selectionchange"));

    expect(onSelectionChange).toHaveBeenLastCalledWith({
      token: "epub:21:26",
      text: "Alpha",
    });
    cleanup();
    element.remove();
  });
});
