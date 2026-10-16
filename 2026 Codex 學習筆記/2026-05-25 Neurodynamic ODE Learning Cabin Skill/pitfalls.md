# Pitfalls From The Neurodynamic ODE Build

## Standalone build

- `ode.tsx` exported `App` but did not mount it. A standalone entrypoint must call `createRoot(...).render(<App />)`.
- If the entrypoint does not import `src/index.css`, Tailwind is not bundled and the page may become white even if the React app loads.
- `file://` pages should not depend on Vite asset paths; inline CSS and JS into one HTML.

## UI preservation

- A bug fix should not redesign the page. Treat white backgrounds, missing gradients, and palette shifts as regressions.
- Verify computed background color or screenshots, not just DOM presence.

## Podcast

- Async auto-play after generation is unreliable because browsers require user activation for speech/audio.
- Call `speechSynthesis.speak()` directly inside the Play button handler.
- Automated tests can verify the play flow and errors, but cannot prove the user hears sound on Windows.

## Hidden tab bugs

- Chaos branch crashed because it referenced `runTime` from another component scope.
- Lazy UI branches must be clicked during verification.

## Windows workflow

- PowerShell here-strings can corrupt Chinese text if encoding is not controlled.
- Use `npx.cmd` when PowerShell execution policy blocks `npx.ps1`.
- Git may require `safe.directory` when a checkout is owned by a different Windows account.
