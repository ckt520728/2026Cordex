# HANDOFF — NeuroPlay 腦力訓練 App

Last updated: 2026-07-02

## 1. What this project is

A cognitive-training app for elderly users (mobile + tablet), built with Expo /
React Native. It doubles as a lightweight trend-tracking aid for MCI / early
Alzheimer's screening discussions — **not a diagnostic device**. Every game
records structured trial-level metrics (accuracy, reaction time, false
positives, omissions, PAL accuracy) instead of a single score.

Design source material: two zips of neuropsychology literature notes were
extracted into [`docs/references/`](docs/references/) — `notes/` (book/paper
summaries translated into brain-game design implications) and `sources/`
(underlying chapter/book text). These are the design bible for any new game;
read them before inventing new mechanics.

## 2. Decisions already made (don't re-litigate without reason)

- **Stack:** Expo (React Native) + expo-router (file-based routing), TypeScript strict mode.
- **Audience:** Elderly users, both daily training AND informal screening use case.
- **Language:** Traditional Chinese (繁中) UI throughout.
- **Storage:** Local-only, no backend/account in MVP. `AsyncStorage` on native,
  falls back to `window.localStorage` on web (see `src/storage/store.ts`).
- **Accessibility defaults:** large tap targets (64pt min), high-contrast
  palette, body text ≥18pt — see `src/theme/tokens.ts`. Keep new UI consistent
  with these tokens; don't hardcode raw colors/sizes in screens.
- **MVP games (all 3 implemented):**
  1. **瞬間定位 Flash-and-Locate** (`app/games/flash-locate.tsx`) — iconic
     memory / partial-report paradigm (Sperling). 3x3 grid, flash a target
     cell, delayed location recall.
  2. **記憶宮殿 Palace** (`app/games/palace.tsx`) — object–location
     paired-associate learning + semantic lure rejection (pattern
     separation). Study 6 items in a grid, then recognize each slot's item
     against a same-category lure.
  3. **語意流暢 Semantic Fluency** (`app/games/semantic-fluency.tsx`) — verbal
     fluency under category constraint (e.g. "綠色蔬菜"), free-text entry,
     parses unique items vs. repetitions.
- **No CLAUDE.md yet.** The original plan was to author `CLAUDE.md` via Q&A
  before/alongside scaffolding — **this was not completed**. Do this next
  (see §5).

## 3. Current file map

```
app/
  _layout.tsx           expo-router Stack, header theme, screen titles
  index.tsx             home screen — game list cards + link to progress
  progress.tsx           训练纪录 — lists past sessions, per-session interpretation, clear-data button
  games/
    flash-locate.tsx
    palace.tsx
    semantic-fluency.tsx
src/
  theme/tokens.ts        palette, typography, spacing, radius, MIN_TAP_TARGET
  metrics/types.ts        CognitiveDomain, GameId, TrialResult, SessionResult — the core data model
  content/stimuli.ts      STIMULI (emoji placeholder items w/ category), FLUENCY_PROMPTS
  games/
    catalog.ts            GAMES: id/route/title/subtitle/domains/paradigm per game
    session.ts             shuffle(), randomId(), summarizeTrials()
    scoring.ts              makeSession(), formatPercent(), interpretationFor() — plain-language trend readout, explicitly non-diagnostic
  storage/store.ts         loadProfile/saveProfile, loadSessions/appendSession, clearAllData (AsyncStorage + web localStorage fallback)
  components/ui.tsx        Screen, Title, Body, BigButton, Card — shared accessible primitives
docs/references/
  notes/                  9 markdown files: book/paper summaries → brain-game design implications
  sources/                13 markdown files: underlying chapter/book source text
package.json, app.json, tsconfig.json  — Expo SDK ~57, RN 0.86, React 19.2, expo-router ~57
```

Two zip files still sit at the project root
(`Psychology_人類記憶_Paradigm_Brain Game design_note1.zip` /
`_source1.zip`) — already extracted into `docs/references/`, safe to leave or
delete once confirmed unneeded.

## 4. Known gaps / things NOT done yet

- **CLAUDE.md missing.** Was supposed to be built via Q&A with the user as
  part of project init. Needs the 4 answers already given (see §2 "Decisions
  already made") plus probably a few more (see below) turned into a proper
  CLAUDE.md.
- **No git repo.** `.git/` exists but is empty/uninitialized (`git status`
  fails with "not a git repository"). Nothing has been committed. Consider
  `git init` + first commit early in the next session.
- **No app icon / splash assets** beyond whatever the Expo template shipped
  with — `app.json` references `./assets/icon.png` etc.; verify these exist
  and look reasonable, or regenerate.
- **Not yet run/tested in a browser or simulator.** `npm run web` /
  `npx expo start` have not been verified working end-to-end this session
  (deps were installed via `npm install` + `npx expo install ...`, but no
  smoke test was performed). **Do this first in the next session.**
- **Difficulty is static.** `difficultyLevel` is hardcoded to `1` in
  `scoring.ts`'s `makeSession()`. The reference notes (e.g. `B_Brain
  games_everyone...md`) emphasize *adaptive difficulty* as a key differentiator
  from paper-based brain games — this is a natural next feature.
- **`interpretationFor()` in `scoring.ts`** is deliberately cautious/plain-language
  (steers toward "track trends, see a clinician" rather than any verdict).
  Keep that tone if extending it — see clinical-guardrails note below.
- **No onboarding / profile screen UI.** `UserProfile` type + `loadProfile` /
  `saveProfile` exist in `store.ts` but nothing in `app/` calls them yet — no
  screen sets `highSupportMode` or `displayName`.
- **No tests.** Consider adding at least a smoke test for `summarizeTrials()`
  and `interpretationFor()` since those encode the "non-diagnostic" framing
  that matters most.

## 5. Suggested next steps, in order

1. **Verify it runs:** `npm run web` (fastest smoke test on this Windows
   dev machine) and `npx expo start` → scan QR with Expo Go on a phone/tablet
   to confirm layout/tap targets feel right on real hardware.
2. **Write `CLAUDE.md`** via Q&A with the user. Reuse the 4 decisions already
   locked in (§2) as starting context so you don't re-ask them. Additional
   things worth asking about if not already obvious from context:
   - Clinical/legal framing: how explicit should in-app disclaimers be about
     "not a diagnostic tool"? Any regions/regulations to be aware of (e.g. if
     targeting Taiwan users specifically)?
   - Whether family/caregiver-facing views (e.g. sharing a session summary)
     are in scope for a later phase.
   - Testing philosophy — is `npm run typecheck` sufficient as a CI gate for
     now, or do we want unit tests from day one?
3. **`git init` + first commit** once CLAUDE.md exists, so the initial
   scaffold + MVP games + docs land in one clean baseline commit.
4. Pick up remaining MVP polish from §4 (adaptive difficulty, onboarding
   screen, asset check) based on user priority.

## 6. Guardrails to preserve when extending this app

- **Never turn `interpretationFor()` (or any new scoring output) into a
  diagnostic claim.** The reference material is neuropsychology literature
  used for *game design inspiration*, not a clinical validation — the app
  must stay framed as training + informal trend-tracking, always deferring to
  "consult a clinician" for anything alarming. This is stated in
  `src/metrics/types.ts`'s top comment and `progress.tsx`'s subtitle — keep
  it that way in any new screen.
- **Keep all persistence behind `src/storage/store.ts`.** If cloud sync is
  ever added, that's the seam to extend, not something to bypass from screens.
- **Reuse `src/components/ui.tsx` primitives and `src/theme/tokens.ts`**
  rather than one-off styles, to keep the large-target/high-contrast
  accessibility baseline consistent across new games.
