---
name: ai-agent-research-automation
description: Use when designing, evaluating, or running AI-agent workflows for research automation, including literature-grounded hypothesis generation, novelty checks, experiment planning, data analysis, write-up, peer-review style critique, and iterative improvement. Especially useful for workflows inspired by Sakana AI Scientist, Co-Scientist, Robin, or other multi-agent scientific discovery systems.
---

# AI Agent Research Automation

## Core Workflow

Use this skill to turn a research topic into a structured, auditable agent workflow.

1. Define the research objective, target field, constraints, available data, and acceptable evidence.
2. Split the workflow into specialist agent roles:
   - Literature agent: retrieves and summarizes prior work with citations.
   - Hypothesis agent: proposes testable hypotheses and mechanisms.
   - Novelty agent: checks whether ideas are known, incremental, or unsupported.
   - Experiment agent: turns hypotheses into executable experiment plans or computational templates.
   - Analysis agent: analyzes results, produces figures, and records assumptions.
   - Critic/reviewer agent: scores plausibility, novelty, safety, feasibility, and evidence strength.
   - Evolution agent: revises hypotheses based on critique and experimental results.
3. Require every important output to include:
   - hypothesis or claim,
   - supporting literature,
   - proposed experiment or validation route,
   - expected observable,
   - failure mode or falsification condition,
   - confidence and uncertainty.
4. Run the workflow in rounds: generate -> rank -> validate -> analyze -> critique -> refine.
5. Preserve artifacts: prompts, searched sources, candidate rankings, analysis notebooks, figures, reviews, and decisions.

## AI Scientist Pattern

When using the Sakana AI Scientist pattern, structure the project as a template:

- `experiment.py`: the executable experiment.
- `plot.py`: figure generation from run outputs.
- `prompt.json`: task-specific scientific context and constraints.
- `seed_ideas.json`: known starting ideas or examples.
- `latex/template.tex` or another manuscript template: write-up structure.
- `run_0/final_info.json`: baseline results for comparison.

Recommended loop:

1. Generate multiple ideas.
2. Check novelty using scholarly search.
3. For each novel idea, copy the template to a result folder.
4. Modify experiment and plotting code for the idea.
5. Run experiments and compare against baseline.
6. Write a paper-style report.
7. Review the report with an independent reviewer prompt or model ensemble.
8. Optionally improve the report and rerun the review.

Use containerization for any workflow that executes LLM-written code.

## Co-Scientist / Robin Pattern

Use this pattern when wet-lab or data-rich biomedical research is involved.

- Keep expert-in-the-loop checkpoints before expensive or risky experiments.
- Prefer tournament or pairwise ranking over single-pass scoring when many hypotheses are generated.
- Use reflection and external search to reduce hallucinated novelty.
- Use multiple independent analysis trajectories for complex data analysis, then compare consensus findings.
- Treat in vitro, retrospective, or simulation evidence as screening evidence, not clinical validation.
- Record whether the system automated hypothesis generation, experimental planning, data analysis, or only literature synthesis.

## Evaluation Checklist

Before presenting a research-agent result as useful, check:

- Does it cite retrievable sources for key claims?
- Is the hypothesis specific enough to falsify?
- Is the experiment executable with available data, tools, and budget?
- Is there a baseline or control?
- Are rankings reproducible or at least auditably logged?
- Did an independent critic find obvious novelty, safety, or feasibility problems?
- Are agent-generated code and shell commands isolated from sensitive files and unrestricted network access?

## Safety Boundaries

Do not run LLM-generated code on the host machine when it can install packages, access the network, or spawn processes unless the user explicitly approves and the environment is isolated.

For biomedical or clinical topics, phrase outputs as research hypotheses. Do not present cell-line, organoid, retrospective, or computational findings as patient-ready treatment guidance.
