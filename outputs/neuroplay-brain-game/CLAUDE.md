# CLAUDE.md

Guidance for Claude Code (and any future contributor) working in this repository.

## Project

**NeuroPlay 腦力訓練** — a cognitive-training app for elderly users, built to
run on both phones and tablets. It doubles as a lightweight trend-tracking aid
for MCI / early Alzheimer's screening conversations, but it is **not a
diagnostic device** — see "Clinical guardrails" below.

Game design is grounded in the neuropsychology literature extracted into
[`docs/references/`](docs/references/):
- `docs/references/notes/` — book/paper summaries already translated into
  brain-game design implications (paradigm → game mechanic → what it measures).
- `docs/references/sources/` — underlying chapter/book source text.

Read the relevant note file before designing a new game or extending an
existing one; don't invent mechanics that aren't traceable to a paradigm in
these notes (or a clear extension of one).

## Decisions already made

- **Stack:** Expo (React Native) + `expo-router` (file-based routing),
  TypeScript strict mode. Chosen for one codebase → iOS/Android/tablet, fast
  iteration, mature ecosystem.
- **Audience & positioning:** Elderly users; the app serves **both** daily
  training and informal cognitive-trend tracking (dual purpose — not
  training-only, not screening-only).
- **Language:** Traditional Chinese (繁中) UI throughout. Don't introduce
  English-only strings in user-facing screens.
- **Storage:** Local-only, no backend/account in the MVP. `AsyncStorage` on
  native, falls back to `window.localStorage` on web — see
  `src/storage/store.ts`. This is the single persistence seam; if cloud sync
  is ever added, extend this module rather than calling storage APIs from
  screens.
- **Accessibility baseline:** large tap targets (64pt min via
  `MIN_TAP_TARGET`), high-contrast palette, body text ≥18pt — see
  `src/theme/tokens.ts`. Reuse `src/components/ui.tsx` primitives (`Screen`,
  `Title`, `Body`, `BigButton`, `Card`) instead of one-off styles so every new
  screen stays consistent with this baseline.
- **Quality gate:** `npm run typecheck` (`tsc --noEmit`) is the baseline CI
  gate for now. No unit test suite yet — acceptable for current scope, but
  add tests before this baseline no longer catches regressions in scoring
  logic (see "Clinical guardrails").
- **Disclaimer approach:** Light-touch, inline (current approach) — short
  reminders on the home screen and progress screen that this is for training
  / trend-tracking, not diagnosis. No forced consent modal at this stage.
- **Family/caregiver sharing:** Out of scope for MVP. Single-user, on-device
  only. Revisit if/when a sharing or export feature is explicitly requested.
- **Git workflow:** No formal commit-message convention or branching strategy
  imposed — keep it simple for now (single contributor).

## MVP games (all implemented)

1. **瞬間定位 Flash-and-Locate** (`app/games/flash-locate.tsx`) — iconic
   memory / partial-report paradigm (Sperling). Flash a target cell in a 3x3
   grid, delayed location recall. Measures visuospatial attention +
   processing speed.
2. **記憶宮殿 Palace** (`app/games/palace.tsx`) — object–location
   paired-associate learning (PAL) + semantic lure rejection (pattern
   separation). Study 6 items placed in a grid, then recognize each slot's
   item against a same-category lure.
3. **語意流暢 Semantic Fluency** (`app/games/semantic-fluency.tsx`) — verbal
   fluency under category constraint (e.g. "綠色蔬菜"), free-text entry,
   parses unique items vs. repetitions.

Each game writes a `SessionResult` (see `src/metrics/types.ts`) with
trial-level detail (`accuracy`, `reactionTimeMs`, `errorType`) rather than a
single score — this is intentional and should be preserved in any new game.

## File map

```
app/
  _layout.tsx            expo-router Stack, header theme, screen titles
  index.tsx              home screen — game list cards + link to progress
  progress.tsx           訓練紀錄 — past sessions, per-session interpretation, clear-data button
  games/
    flash-locate.tsx
    palace.tsx
    semantic-fluency.tsx
src/
  theme/tokens.ts         palette, typography, spacing, radius, MIN_TAP_TARGET
  metrics/types.ts        CognitiveDomain, GameId, TrialResult, SessionResult — the core data model
  content/stimuli.ts      STIMULI (emoji placeholder items w/ category), FLUENCY_PROMPTS
  games/
    catalog.ts             GAMES: id/route/title/subtitle/domains/paradigm per game
    session.ts              shuffle(), randomId(), summarizeTrials()
    scoring.ts               makeSession(), formatPercent(), interpretationFor() — plain-language, non-diagnostic trend readout
  storage/store.ts          loadProfile/saveProfile, loadSessions/appendSession, clearAllData
  components/ui.tsx         Screen, Title, Body, BigButton, Card — shared accessible primitives
docs/references/
  notes/                   book/paper summaries → brain-game design implications
  sources/                 underlying chapter/book source text
```

## Clinical guardrails (do not relax without explicit user instruction)

- **Never let scoring output become a diagnostic claim.** `interpretationFor()`
  in `src/games/scoring.ts` is deliberately cautious — it nudges toward
  "track the trend, consult a clinician if concerned," never a verdict like
  "you may have MCI." Keep this tone in any new/extended scoring logic.
- The reference literature in `docs/references/` is used for **game design
  inspiration**, not clinical validation of this app. Don't imply otherwise in
  copy or code comments.
- If you add tests, prioritize `summarizeTrials()` and `interpretationFor()`
  first — they encode the non-diagnostic framing that matters most.

## Known gaps / next steps

- Not yet smoke-tested end-to-end this session (`npm run web` /
  `npx expo start` should be verified working, including on a real
  phone/tablet via Expo Go, before further feature work).
- No git repository initialized yet.
- `difficultyLevel` is hardcoded to `1` in `scoring.ts`'s `makeSession()` —
  adaptive difficulty is a natural next feature (reference notes emphasize
  this as a key differentiator from static paper-based brain games).
- No onboarding/profile screen — `UserProfile`, `loadProfile`, `saveProfile`
  exist in `store.ts` but nothing in `app/` sets `highSupportMode` or
  `displayName` yet.
- App icon / splash assets are whatever the Expo template shipped with;
  verify `app.json`'s asset references resolve to real, reasonable images.
