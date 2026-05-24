---
name: neurodynamic-ode-learning-cabin
description: Build, repair, and publish interactive differential-equation learning cabins for neurodynamic or clinical modeling education. Use when the user wants an ODE learning cockpit with adjustable parameters, visible simulation panels, mind maps, animated slide scenarios, interactive standalone web pages, generated podcast narration, and Jupyter Notebook practice environments from source notes, Python scripts, implementation plans, or prior AI-generated web code.
---

# Neurodynamic ODE Learning Cabin

Use this skill to turn differential-equation learning material into an interactive teaching environment that can be rebuilt, debugged, verified, and published.

## Output Contract

Create a package that can include:

1. an interactive ODE learning cabin with adjustable parameters and visible simulation panels;
2. a mind map showing how differential equations represent different real scenarios;
3. animated slide scenes for attractors, phase planes, stability, bifurcation, chaos, and clinical analogies;
4. a standalone interactive web page that runs from `file://` and can be published;
5. a podcast panel that can generate narration text and play browser speech safely;
6. a Jupyter Notebook practice environment with executable numerical exercises.

## Workflow

1. Gather source material.
   - Read the user's implementation plan, source code, Python scripts, notebook files, and prior repair notes.
   - If this skill package is available, load `references/design-spec.md` first.
   - For real examples and known pitfalls, load `references/pitfalls.md` and `references/session-records/`.

2. Preserve the existing visual design.
   - Treat style changes as regressions unless the user explicitly requests redesign.
   - Keep existing Tailwind class patterns and color palette.
   - When converting to a standalone Vite build, ensure the entry file imports the CSS entrypoint, for example `import './src/index.css';`.

3. Build the learning cabin.
   - Use sliders, toggles, selectors, and buttons for ODE parameters.
   - Keep at least one panel that renders the actual state trajectory or phase portrait.
   - Include scenario presets, for example LIF neuron, coupled oscillators, attractor dynamics, slow manifold, Lorenz chaos, or clinical control-system analogies.

4. Build the mind map.
   - Map each scenario to state variables, derivatives, parameters, equilibrium/stability behavior, and observable outputs.
   - Show how the same ODE grammar changes between physical, neural, and clinical cases.

5. Build animated slides.
   - Use animation to show trajectories, attractor basins, eigenvectors, nullclines, bifurcation shifts, or chaos.
   - Verify every tab or slide branch; lazy branches often hide scope errors until clicked.

6. Build podcast generation.
   - For static web pages, generate transcript/dialogue locally and play with Web Speech API.
   - Do not auto-play after asynchronous generation; browsers may block it.
   - Trigger `speechSynthesis.speak()` directly in the Play button click handler.
   - If the user explicitly wants NotebookLM-generated audio, use NotebookLM MCP as a separate generation workflow and attach the audio artifact.

7. Build the Jupyter practice environment.
   - Include executable notebook cells for Euler integration, vector fields, parameter sweeps, and interpretation prompts.
   - Keep code runnable without hidden cloud dependencies unless explicitly required.

8. Verify before publishing.
   - Run the app in a real browser or Playwright.
   - Check page load, dark/light design expectations, each tab, animated slide branches, podcast Play flow, and notebook file presence.
   - For standalone HTML, verify CSS is inlined and no network-only assets are required.

## Bundled Resources

- `references/design-spec.md`: reusable design and feature specification.
- `references/pitfalls.md`: repair pitfalls from the Neurodynamic ODE build.
- `references/implementation-plan-r1.md`: Anti-Gravity implementation plan source.
- `references/source-python/`: Python programs uploaded or produced during the build.
- `references/session-records/`: conversation and repair summaries.
- `assets/frontend-template/`: working React/Tailwind standalone template pieces.
- `assets/notebook/`: Jupyter Notebook practice material when available.
- `scripts/build_standalone.py`: helper for building a Vite React app into one HTML file.
- `scripts/verify_learning_cabin.mjs`: Playwright verification template.

## Validation Checklist

- The app loads with exactly one mounted root.
- Original visual design is preserved unless redesign is requested.
- Adjustable parameters update the visible panel.
- Mind map, slides, podcast, and notebook tabs all open.
- Chaos/animation branches do not throw runtime errors.
- Podcast Play is a direct user gesture.
- Standalone HTML includes CSS and JavaScript inline.
- Published URL returns HTTP 200 and matches the latest local build.
