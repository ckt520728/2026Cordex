# Minimum data dictionary

Use this as a starting schema, not a demand to collect every field. Record source, units, timing, missing-value codes, and extraction confidence for every variable.

## Identity and time

| Field | Purpose |
|---|---|
| `study_id` | Surrogate identifier; never encode chart number |
| `index_datetime` | Declared time zero |
| `discharge_datetime` | Outcome/eligibility verification |
| `death_datetime` | If death occurred in hospital |
| `analysis_year` / `analysis_month` | Aggregation without exposing exact dates |
| `encounter_id` | Surrogate episode ID for repeat admissions |
| `prior_encounter_count` | Repeat-use context known at index time |

## Outcome and cohort

| Field | Purpose |
|---|---|
| `in_hospital_death` | 1=death before discharge; 0=alive discharge, per protocol |
| `outcome_source` | Structured field, registry, clinician adjudication |
| `adjudication_override` | Explicit, versioned exception flag |
| `eligibility_status` / `exclusion_reason` | Reproducible cohort flow |
| `transfer_in`, `transfer_out`, `hospice_discharge` | Define handling in protocol |

## Baseline candidate predictors

- Age in years, sex, source of admission, service/ward, emergency/elective status.
- Baseline vital signs with timestamp: systolic/diastolic BP, heart rate, respiratory rate, temperature, oxygen saturation.
- First available labs within a prespecified window: CBC, renal function, electrolytes, glucose, albumin, inflammatory markers, blood gas when clinically appropriate.
- Comorbidities defined from a fixed lookback window or validated index; record ascertainment method.
- Baseline severity/organ-support status present at time zero.
- Prior utilization and medication variables available before index time.

Do not use diagnoses first documented after deterioration as though they were baseline comorbidities.

## Time-updated variables

Keep these separate from baseline predictors and timestamp them:

- ICU transfer, ventilation, vasopressors, CPR, shock, procedures, complications.
- DNR/comfort-care decision, withdrawal or withholding of life-sustaining treatment.
- Repeat labs/vitals and treatment response.

Use only values observed before a declared landmark. “Ever during admission” creates leakage.

## Cause-of-death audit

For deaths, maintain:

- `underlying_cause`: disease initiating the fatal sequence;
- `terminal_mechanism`: immediate physiologic mechanism;
- `contributing_conditions`: other relevant conditions;
- `cause_review_status`: algorithmic proposal vs clinician-confirmed.

Do not substitute terminal mechanisms such as respiratory failure or cardiac arrest for the underlying cause.

## Missingness and provenance

For each field preserve:

- raw source and extraction rule/version;
- measurement unit and reference range if relevant;
- timestamp relative to index;
- missingness reason: not ordered, unavailable, structurally inapplicable, extraction failure, or unknown;
- quality flag and clinician-review flag.

Never encode missing as zero or “normal.”
