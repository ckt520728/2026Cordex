# Reporting and bias checklist

## Population and outcome

- Is the target population identical to the population represented in the data?
- Are deaths and survivors selected using the same rules and calendar window?
- Is in-hospital death operationally defined, including transfer and hospice cases?
- Is the unit an admission or a patient, and are repeat admissions handled?
- Are outcome assessors and adjudication rules described?

## Predictors and timing

- Is every predictor available at the declared prediction time?
- Are timestamps or windows specified for first/most abnormal values?
- Are post-baseline treatments, complications, and terminal proxies excluded from baseline models?
- Are continuous variables retained without arbitrary categorization?
- Are code-status timing and causal role explicit?

## Analysis

- Are event/non-event counts and candidate parameter degrees of freedom adequate?
- Are missing-data methods and denominators reported?
- Are predictor selection and transformations prespecified?
- Is overfitting addressed with shrinkage and resampling?
- Is separation checked?
- Is clustering by patient, ward, clinician, or month handled when relevant?
- Are sensitivity analyses defined for adjudication, missingness, and cohort rules?

## Performance and validation

- Are calibration, discrimination, and overall performance reported with uncertainty?
- Is evaluation separated from model fitting/tuning?
- Is validation internal, temporal, or external—and labeled accurately?
- Are subgroup estimates sufficiently precise?
- Is clinical utility evaluated only against a concrete decision?

## Interpretation

- Are unadjusted associations kept distinct from adjusted effects?
- Are odds ratios not mislabeled as risk ratios?
- Is causality avoided unless the design supports it?
- Are confounding by indication, selection bias, information bias, and leakage discussed?
- Are transportability limits and changes in hospital practice acknowledged?

## Reproducibility and privacy

- Are code, software versions, seeds, transformations, coefficients, and intercept retained?
- Is the data dictionary versioned?
- Are adjudication overrides explicit and reviewable?
- Do all outputs contain only aggregate or de-identified data?
- Is the linking key stored separately with restricted access?

Use TRIPOD+AI for reporting completeness and PROBAST+AI for risk-of-bias/applicability appraisal; neither substitutes for statistical judgment.
