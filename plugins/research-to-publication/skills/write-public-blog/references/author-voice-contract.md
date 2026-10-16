# Author voice contract

The language policy makes an article *correct Traditional Chinese*. It does not make the
article sound like a particular person. This file closes that gap.

## Source and authority

The bound voice profile is `ckt520728/claude-skills` → `voice-profile/`:

| File | Use |
|---|---|
| `Voice_Profile_Kwo-Ta_Complete.md` | Q1–Q100 interview; the hard signatures and register model |
| `部落格寫作指導原則_Kwo-Ta.md` | Blog-specific conflict list and per-section rules |

**Precedence.** Evidence beats voice, always. The claim ledger, the evidence hierarchy and
the Gate 3 boundary override every rule in this file. Voice governs *how a supported claim
is said*, never *which claims may be said*. If a voice rule would require asserting
something the ledger does not support, the voice rule loses.

**Portability.** These rules are stated generically where possible so a different author can
bind a different profile. Anything author-specific is marked `[author-specific]`.

## Register

Blog and popular-science articles are **Public-Personal C-mix**: 80% real voice skeleton +
20% deliberate rhetorical intensification. Never literary-essay register. The academic
manuscript keeps its own register and is untouched by this file.

## Hard rules (violating any of these fails the voice audit)

1. **Formal second person only.** `您`, never `你` — including for students and juniors.
   No exceptions. `[author-specific: applies to any zh-TW author who has declared it]`
2. **Introduce the speaker first.** The reader must learn who is talking and from where
   before any argument begins. Without identity anchoring, the clinical observations, the
   flanking patches and the hedging calibration all lose the weight that makes them mean
   anything. This is the highest-priority rule in the profile.
3. **Calibrated-certainty vocabulary is the signature.** `應該`, `可能`, `不見得`,
   `高度相關`, `其實` are the hedging instruments. Never soften an opening with
   `我覺得` or `我認為`.
4. **Name the layer everyone skips.** For any mainstream account, find the part the
   institutional version has sanitised out.
5. **Concede the mainstream, then patch its flank.** Three-part dialectic: accept the
   thesis → `但是` → state what it drops → synthesise. Never a head-on collision.
6. **Outputs over process.** Give the finished thing, not the procedure that produced it.
7. **No banned vocabulary.** Two red lines: social-lubricant softeners
   (`真的蠻`, `哈哈哈`, `太棒了`, `加油!`, `親愛的`, `我覺得啦`) and mainland-internet
   register (`yyds`, `絕了`, `內捲`, `躺平`).

## Structure

### Opening (paragraphs 1–2)

Enter in the reader's language, exit in academic register. Never open on a definition, a
terminology table, or an abstract-style summary.

Formula: **what the reader currently thinks (their frame) → but here is what I see (pivot)
→ a concrete scene that anchors it (body, not abstraction)**.

The concrete anchor must be physical and specific. Vague appeals to experience
(`在我多年臨床經驗中`) are explicitly rejected by the profile.

### Body

- Write the inference out. Do not jump from A to B and leave the reader to bridge it.
  The most common AI failure mode against this voice is compressed, list-like reasoning
  that skips the connective step.
- End sections by naming the question the next section answers. Transitions carry the
  argument; headers alone do not.
- Prose to bullets roughly **7:3**. Bullets are for genuinely parallel list content only.
- At least one **concede-then-patch pivot** per article; two is better.

### First-hand observation — and the line you must not cross

The profile requires at least one first-hand observation per article, quantified where
possible (`教科書未提及，但我照顧過至少 5 例……`), and prefers the
"information the vendor does not supply" angle.

**The model must never invent one.** A fabricated case, case count, or patient detail
published under a named clinician's byline is a fabrication with that clinician's
professional credibility attached to it. This is not a style question.

Permitted sources for the first-hand layer, in order of preference:

1. An observation the author supplies in this session.
2. An observation already documented in the voice profile itself, **if it is genuinely
   on-topic** — these are real and attributable. `[author-specific: e.g. the ERP critique,
   the SGLT2i vulnerable-subgroup observations]`
3. A general, unquantified scene that claims nothing about specific patients or counts.

If only (3) is available, say so in the handoff, name the exact insertion point, and let
the author supply the real case. Do not fill the slot to satisfy a checklist.

### Ending

Evidence-based synthesis (1–2 sentences) followed by **at most 5** take-away bullets, each
a complete subject–predicate sentence.

**No disclaimer paragraph.** A named, board-certified clinician does not need a legal
template for self-protection, and the profile marks the long disclaimer as cringe. If a
limitation genuinely needs stating, one sentence in the author's own voice is the maximum:
`以上是研究整理，個別臨床決策仍需依病人狀況判斷。`

A factual caveat about a *simulation or model* is not a disclaimer and may stay — it states
what the artifact is, rather than disclaiming liability.

## Mechanics

| Item | Rule |
|---|---|
| Headers | Declarative sentences. Not questions, not bare noun phrases. The H1 title may be a question if the destination site's siblings do that. |
| Header count | ~3–5 H2 per 1,500 characters; sub-headers allowed |
| Citations, blog | Named in prose (`Myers 等人（2018）`), **no inline `[n]` markers**; full reference list with DOI hyperlinks at the end |
| Citations, academic | Numbered or author–date immediately after each factual claim, per the manuscript's style |
| Terminology | Define inline at first use, parenthetically or with an em-dash. **Never a terminology table at the top of the article.** |
| Tables | Maximum 2 per article, and only for genuine 3-or-more-dimension comparison. Binary A-vs-B contrasts go in prose. |
| Code-switching | Drug names, acronyms, anatomical structures and quantified indices stay English; disease names, procedures and institutional names go Chinese |
| Hedging density | At most **one** signature hedging token per paragraph |
| Punctuation | Grammar-first in written registers. Comma-chaining is a speech-to-text artifact, not voice. |

## Audit before Gate 3

Run alongside the language audit and report both together.

1. Does paragraph 1 establish who is speaking and from what vantage point?
2. Does the opening enter in the reader's language rather than on a definition?
3. Any occurrence of `你` anywhere in the prose? (Must be zero.)
4. Is there at least one concede-then-patch pivot?
5. Is there a first-hand observation — and is every part of it real?
6. Are all H2 headers declarative?
7. Does the ending use take-away bullets rather than a disclaimer paragraph?
8. Are there more than 2 tables, or a terminology table at the top?
9. Any paragraph with more than one signature hedging token?
10. Any banned vocabulary?
11. Blog only: any inline `[n]` citation markers left in the body?

Report the result as a pass/fail line per check. A failed check is fixed, not explained.

## Known AI failure modes against this voice

1. **Skipping the inference.** Models list well and explain poorly; the connective step is
   what has to be written back in.
2. **Missing first-hand material.** The model does not know whom the author has treated.
   This slot is filled by the author or left honestly empty — never invented.
3. **Opening too conservatively.** Models default to an academic definition. Replace it
   with the clinical or reader-facing scene.
4. **Over-dense signature vocabulary.** When imitating this voice a model will put
   `應該` / `其實` in every paragraph. One per paragraph, maximum.
5. **Reflexively adding a disclaimer.** The model adds it; the author deletes it. Do not
   add it in the first place.
