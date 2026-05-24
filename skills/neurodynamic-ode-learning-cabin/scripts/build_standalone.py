from __future__ import annotations

import subprocess
from pathlib import Path


def build_standalone(root: Path, entry: str = "/standalone-entry.tsx", output: str = "standalone.html") -> Path:
    """Build a Vite React/Tailwind app and inline the newest CSS/JS into one HTML file."""
    root = root.resolve()
    index = root / "index.html"
    index.write_text(f"""<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ODE Learning Cabin</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="{entry}"></script>
  </body>
</html>
""", encoding="utf-8")

    subprocess.run(["npx.cmd", "vite", "build"], cwd=root, check=True)
    assets = root / "dist" / "assets"
    js = max(assets.glob("*.js"), key=lambda p: p.stat().st_mtime).read_text(encoding="utf-8")
    css_files = list(assets.glob("*.css"))
    css = max(css_files, key=lambda p: p.stat().st_mtime).read_text(encoding="utf-8") if css_files else ""
    if not css:
        raise RuntimeError("No CSS bundle found. Check that the entrypoint imports src/index.css.")

    standalone = f"""<!doctype html>
<html lang="zh-Hant">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>ODE Learning Cabin</title>
    <style>{css}</style>
  </head>
  <body>
    <div id="root"></div>
    <script>{js}</script>
  </body>
</html>
"""
    target = root / output
    target.write_text(standalone, encoding="utf-8")
    return target


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument("root")
    parser.add_argument("--entry", default="/standalone-entry.tsx")
    parser.add_argument("--output", default="standalone.html")
    args = parser.parse_args()
    print(build_standalone(Path(args.root), args.entry, args.output))
