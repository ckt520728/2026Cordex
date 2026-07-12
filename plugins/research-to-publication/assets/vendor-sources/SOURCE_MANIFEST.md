# Vendor source manifest

These are immutable provenance snapshots, not directly triggered Plugin skills. Adapted behavior lives under `skills/`.

## Repositories

- `ckt520728/claude-skills`, branch `master`, commit `438e0777c9b896edec63315c834c40e4d994d0b0`.
- `ckt520728/2026-Hermes`, branch `main`, commit `dedf2287d0baa9c33b48940a2039e2cbc14c44be`.

## Files and SHA-256

```text
5F5C805F6FA101A98661DB479EE3C235D0875EE39C422C95BCA638A3F26C1DE0  academic-paper-deep-analysis.skill
EAC4A23E96B297416B2451ADF4F6E278E21C8F313C0919F2A7B2C93A2388806D  article-writer.skill
4198440983E602EB7D1B055300EAAC0001F785A4FF1780888BEF74E96307CEA8  data-analyzer.SKILL.md
8EECFF4C9B8FE1BBC08E2A5C4744293C92D7C9B591113FB0CA799A26A109166C  knowledge-base.SKILL.md
2BEA4408A2365FC96C2B56CEC1A9CBB289EB87FEF191FF618A6C444D9453DD40  multi_agent_research_skill_v2.7.md
C78F65F4216D4B4C08FFDE5981ADB73EF8B77906F1FBF5B597D2095B5FAAFE6E  multi_agent_research_skill_v3.0.md
8BAE2DA035234C0E251F10B20C025F5CD0A788A46ED43B5EAD9326922A982F85  paper-summary-extraction.skill
D44902BBD3A5677B5F1C4A51FC327C12294B94007C6AEBD5A0C55B0DF638F30A  phcssm_multi_agent_analysis_workflow_v3.js
D8E1A8E312E6DAE52A4416981ACCAF12C28DD8577D4E99A8712B893C67B469BD  publish-lab-blog.skill
7BA13E2309CB395F8A17E7CF26D0C6972431A6A8A49998050E548305A1C0236A  research-organizer.SKILL.md
```

## Adaptation decisions

- Phase 1 combines data integrity, research organization, knowledge provenance, summary extraction, and deep paper analysis under one shared registry.
- Phase 2 reuses structured schemas, grounding, pairwise contradiction resolution, consensus, and self-healing. PHCSSM content is excluded from executable behavior.
- v3.0 loop automation is optional; it is not the default for narrative reviews.
- Article Writer is included as a general outline-first drafting skill; evidence-bound writer skills override generic content-generation rules.
- Publication behavior is adapted to require explicit approval and live desktop/mobile verification.
