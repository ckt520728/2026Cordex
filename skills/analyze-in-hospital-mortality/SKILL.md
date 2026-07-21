---
name: analyze-in-hospital-mortality
description: Design, audit, analyze, validate, and report a PHI-safe one-year hospital cohort study of predictors of all-cause in-hospital mortality. Use for hospital discharge/EHR datasets, mortality-rate denominators, admission-time or landmark prediction models, logistic regression or penalized models, missing-data plans, calibration/discrimination, temporal validation, causal interpretation of risk factors, and critical appraisal of mortality predictor studies. Refuse predictor modeling when the outcome has no survivor/death contrast or the denominator is only an aggregate count.
---

# Analyze In-Hospital Mortality

Build an auditable hospital mortality analysis while keeping prediction, causal explanation, and descriptive audit distinct.

## Required inputs

Obtain or infer, then explicitly state:

- Target population, hospital/service scope, and exact one-year admission/discharge window.
- Unit of analysis: admission, discharge episode, or patient; define repeat-admission handling.
- Outcome definition: all-cause death before discharge, source field, transfer/hospice handling, and adjudication rules.
- Prediction time: admission, 24-hour landmark, pre-procedure, or another fixed time.
- Candidate predictor availability time and provenance.
- Complete eligible cohort or sampling design, including survivors.
- Data dictionary, missing-value codes, linkage rules, and de-identification status.

Never transmit patient-level data externally. Never copy names, chart numbers, national IDs, dates of birth, addresses, or free text into reports, logs, prompts, or test fixtures. Work from a de-identified analysis table and keep any linking key separate.

## Gate 1: establish estimability

Run `python scripts/audit_cohort.py <csv> --outcome <column>` before modeling when a CSV is available.

Stop predictor modeling and explain why if any condition holds:

- Only deaths/cases are available, the outcome is constant, or there are fewer than two outcome classes.
- Only a death numerator plus aggregate discharge denominator is available. Compute a rate, not predictors.
- The comparison group does not represent the same source population and eligibility window.
- Outcome or index-time definitions cannot be reconstructed reliably.

When blocked, still produce a descriptive mortality audit and a data-acquisition plan. Never manufacture controls or treat a few conference recovery cases as an adequate survivor cohort.

## Gate 2: choose the estimand

Select exactly one primary question before analysis:

1. **Admission-time prediction:** use only variables known at or before admission/index time.
2. **Landmark prediction:** predict among patients alive and hospitalized at a prespecified landmark; use only information observed by that landmark.
3. **Causal risk-factor analysis:** define exposure, outcome, time zero, confounders, mediators, and selection mechanisms with a causal diagram.
4. **Descriptive mortality audit:** describe deaths, rates, causes, care pathways, and missingness without calling characteristics “predictors.”

Do not combine these estimands in one coefficient table. Read [references/statistical-workflow.md](references/statistical-workflow.md) for the full analysis sequence.

## Build the analysis table

Read [references/data-dictionary.md](references/data-dictionary.md). Create one row per declared analysis unit and include:

- surrogate `study_id` only;
- index and discharge/death timing sufficient to verify eligibility, then reduce date precision in exported reports;
- binary outcome with an explicit source and adjudication flag;
- predictor value, unit, measurement time, source, and missingness reason;
- repeat-admission and transfer indicators;
- code-status variables with decision timestamps.

Treat DNR/comfort care carefully. A pre-existing code status may be an admission predictor; a new DNR order after deterioration is usually a mediator or severity marker. Never place untimed “ever DNR” in an admission model.

## Prevent leakage and structural bias

Classify every candidate variable as baseline confounder, baseline predictor, treatment, mediator, complication, outcome proxy, or administrative/logistical feature.

- Exclude future information from admission-time models: CPR, ventilation initiated later, shock during a procedure, unsuccessful procedure, ICU transfer after deterioration, discharge disposition, and length of stay.
- Do not interpret unadjusted logistic regressions as independent effects.
- Expect confounding by indication for treatment choices such as conservative treatment, ICU care, femoral access, or invasive procedures.
- Use a common time zero and preserve temporal order.
- Do not collapse continuous predictors into “normal/abnormal” without a clinical reason; retain continuous form and model nonlinearity with restricted cubic splines when data permit.
- Do not select predictors solely by univariate p-values.

## Statistical workflow

1. Freeze a protocol: estimand, predictors, transformations, interactions, missing-data plan, and validation strategy.
2. Report cohort flow, event and non-event counts, outcome rate with confidence interval, and monthly denominators.
3. Audit ranges, units, duplicates, impossible chronology, missingness, and extraction coverage.
4. Describe survivors and deaths with effect estimates and uncertainty; avoid screening claims from p-values.
5. Plan sample size from outcome prevalence, candidate predictor parameters, and anticipated model fit; do not rely on a fixed 10-events-per-variable rule alone.
6. Handle missing predictors with multiple imputation when assumptions are defensible; include outcome and auxiliary variables in imputation, and keep preprocessing inside resampling.
7. Fit a prespecified multivariable model. Prefer penalized/shrunk logistic regression for development; use Firth-type methods for separation when inference is the goal. Keep a parsimonious clinical baseline comparator.
8. Validate internally with bootstrap optimism correction when the cohort is small. Use temporal evaluation on a later period when enough data exist; do not waste a small one-year cohort on an arbitrary split.
9. Report calibration-in-the-large, calibration slope/plot, Brier score, ROC AUC with confidence intervals, and clinically relevant decision-curve or threshold metrics. Never report accuracy alone.
10. Assess subgroup performance and calibration where sample size permits, without overclaiming fairness from unstable small cells.
11. Present full coefficients, intercept, transformations, and executable scoring logic. Label the result development/internal validation—not clinical deployment—until externally validated.

Use [references/reporting-and-bias-checklist.md](references/reporting-and-bias-checklist.md) before finalizing.

## Hospital-specific safeguards

- Match the death numerator and discharge denominator to the same hospital/service, eligibility criteria, and calendar window.
- Include deaths among discharges in the denominator when that is the hospital’s operational definition.
- Preserve explicit clinician adjudications as versioned overrides; never silently infer them from filenames.
- Report heavily skewed length of stay with median and IQR; retain genuine long stays and investigate rather than automatically deleting them.
- Keep cause of death on separate axes: underlying cause, terminal mechanism, and contributing conditions.
- Label free-text-derived variables as algorithmic abstractions requiring clinician review.

## Required outputs

Produce:

1. Protocol and estimand statement.
2. Cohort flow and data-quality report.
3. Predictor timing/leakage table.
4. Descriptive table and mortality-rate table.
5. Model specification and validation report, only if Gate 1 passes.
6. Limitations, transportability, and clinical-use boundary.
7. Reproducibility appendix containing software versions, seeds, code, data dictionary, and adjudication log location—without PHI.

Use precise language: “associated with” for observational coefficients, “predicts” only for validated predictive performance, and “causes” only under a defensible causal design.
