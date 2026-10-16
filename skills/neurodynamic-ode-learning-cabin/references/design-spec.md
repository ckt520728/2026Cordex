# Neurodynamic ODE Learning Cabin Design Spec

## Core Modules

1. Learning cabin cockpit
   - Parameter controls: sliders, steppers, selectors, toggles.
   - Visible panels: time series, phase plane, vector field, attractor geometry, or state-space projection.
   - Presets: LIF neuron, STN-GPe oscillator, FORCE/RNN, Lorenz chaos, slow manifold, clinical feedback control.

2. Differential-equation mind map
   - Show state variables, derivatives, parameters, observables, stability, and interpretation.
   - Connect one ODE grammar to multiple scenarios.

3. Animated slides
   - Animate trajectories and explanatory overlays.
   - Verify each slide branch after implementation; do not assume hidden tab content works.

4. Interactive standalone web
   - Prefer a Vite React/Tailwind build for maintainability.
   - Export a single HTML for `file://` use and GitHub Pages deployment.
   - Keep CSS imported in the entrypoint before inlining.

5. Podcast generation
   - Static mode: generate transcript/dialogue and use Web Speech API.
   - NotebookLM mode: use NotebookLM MCP only when external audio generation is required.
   - Browser speech must start from a click handler.

6. Jupyter practice
   - Include numerical integration exercises.
   - Pair each code block with interpretation prompts.
