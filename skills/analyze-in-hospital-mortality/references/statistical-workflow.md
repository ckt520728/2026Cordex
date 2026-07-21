# Statistical workflow

## 1. Protocol before coefficients

Declare the target population, eligibility window, unit of analysis, outcome, prediction time, intended user, intended decision, and estimand. Freeze candidate predictors from clinical knowledge and availability—not univariate significance.

For repeated admissions, choose one of these and justify it:

- first eligible admission per patient;
- all admissions with clustered resampling/robust methods;
- a clinically defined index episode.

## 2. Cohort audit

Verify:

- same source population and window for deaths and survivors;
- event and non-event counts;
- duplicates and repeat encounters;
- impossible chronology and length of stay;
- monthly numerator/denominator reconciliation;
- missingness and extraction coverage by outcome;
- consistency among structured disposition, death timestamp, and adjudication.

If the outcome is constant, stop. A death-only conference series can estimate distributions among decedents but cannot identify predictors of death.

## 3. Descriptive analysis

Report counts and percentages for categorical variables, and median/IQR for skewed continuous variables. Include standardized differences or unadjusted effect estimates as descriptions, not as a feature-selection filter. Show missing denominators for every variable.

For mortality rates, use the matching total eligible discharges as denominator and give binomial confidence intervals overall and by month. Do not combine services or months whose scope differs.

## 4. Predictor timing table

For each candidate record:

`name | definition | source | earliest availability | model family | causal role | leakage risk | missingness`

Admission models may include only data available by index time. Landmark models condition on survival/hospitalization to the landmark and must describe the changed target population.

## 5. Missing data

First distinguish true absence, not measured, structural inapplicability, and extraction failure. Investigate missingness by service, month, outcome, and workflow.

- Avoid complete-case analysis unless missingness is minimal and plausibly benign.
- Use multiple imputation when defensible; include the outcome, nonlinear terms, interactions, and useful auxiliary variables.
- Perform imputation and all preprocessing within validation resamples to avoid information leakage.
- Add sensitivity analyses when missing-not-at-random mechanisms are plausible.

## 6. Functional form and model

- Preserve continuous predictors; use clinically sensible transformations and restricted cubic splines when supported.
- Avoid automated stepwise selection and univariate p-value screening.
- Prefer shrinkage/penalization when candidate complexity is high relative to events.
- Use Firth or another separation-aware estimator when sparse cells produce separation and the target is association estimation.
- If estimating causal effects, select adjustment variables from the causal model; do not adjust for mediators or colliders.
- Do not mix post-treatment complications with baseline risk predictors.

Treat odds ratios as conditional associations, not risk ratios and not proof of causation.

## 7. Sample size and validation

Do not apply “10 events per variable” as a permission slip. Calculate required sample size from outcome prevalence, total candidate predictor parameters (including spline and interaction degrees of freedom), anticipated model fit, and desired shrinkage/precision.

For a small one-year dataset, use all eligible observations for development and estimate optimism with bootstrap resampling. Use cross-validation mainly when tuning is required and keep the complete pipeline inside folds. Reserve a later calendar period or another hospital for temporal/external evaluation when feasible.

## 8. Performance

Report with confidence intervals:

- calibration-in-the-large and calibration slope;
- flexible calibration plot;
- Brier score;
- ROC AUC;
- sensitivity, specificity, PPV, and NPV only at prespecified decision thresholds;
- decision-curve/net benefit when a real clinical action threshold exists.

Do not optimize a threshold on the same data and present it as validated. Do not report accuracy alone in an imbalanced outcome.

## 9. Interpretation and deployment boundary

Separate:

- **prognostic information** known at prediction time;
- **care-process markers** that may reflect staffing, transfer, or treatment selection;
- **mediators/complications** arising after index time;
- **terminal proxies** such as CPR, ventilation, or shock immediately before death.

An internally validated model is not ready for bedside use. Require external/temporal evaluation, calibration updating as needed, workflow testing, prospective impact evaluation, governance, drift monitoring, and a plan for subgroup harms before deployment.

## Core references

- Gawinski et al. (2023), the motivating paper: useful for logistics-variable generation, but its univariate analyses should not be copied as an independent predictor model.
- Collins et al. TRIPOD+AI (BMJ 2024): reporting guidance for regression and machine-learning prediction model studies.
- Moons et al. PROBAST+AI (BMJ 2025): quality, risk-of-bias, and applicability assessment.
- Riley et al. (BMJ 2020): context-specific sample-size planning for clinical prediction models.
