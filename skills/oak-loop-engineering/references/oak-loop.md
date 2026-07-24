# Oak architecture: primary-source mapping

Use this reference to distinguish Sutton's architecture from the engineering adaptation
in this skill.

## Primary architecture

Sutton's RLC 2025 keynote describes Oak as model-based reinforcement learning with three
special features:

1. every component learns continually;
2. every learned weight has a dedicated step-size parameter meta-learned by online
   cross-validation;
3. state and temporal abstractions are continually created through **FC-STOMP**:
   Feature Construction -> SubTask -> Option -> Model -> Planning.

This is more specific than the earlier four-phase shorthand
`Perceive -> Encapsulate -> Predict/Update -> Recurse`. Use that shorthand only as an
operational mnemonic; use FC-STOMP as the architectural contract.

## FC-STOMP in a software loop

| Oak stage | Meaning in the architecture | Durable software-loop evidence |
|---|---|---|
| Feature Construction | create a learnable state abstraction | detector/probe, examples, predictive use |
| SubTask | pose a problem from the Feature | terminal test plus reward that preserves the parent objective |
| Option | learn temporally extended behavior | versioned policy, initiation contract, termination test |
| Model | predict consequences of following the Option | outcome, reward, duration/cost, side effects, uncertainty |
| Planning | use Models to choose behavior | choice trace and utility versus primitive/current baseline |

The mapping is an engineering analogy, not a claim that Markdown counters implement
gradient meta-learning. A document-based loop can nevertheless honor the same design
pressure by calibrating each item's confidence/update-rate online and retaining the raw
evidence behind every change.

## Options and Models

The classic options framework defines an Option with an initiation set, policy, and
termination condition. Sutton's Oak talk often emphasizes policy plus termination. For
software operation, retain initiation explicitly because calling a valid procedure in
the wrong repository state is a common failure.

Knowledge is not a fact collection or audit log. An Option Model predicts what following
the Option will produce. It should cover terminal state, cumulative reward, cost/time,
side effects, and uncertainty. The loop learns by comparing those predictions with
first-hand outcomes.

## Reward-respecting SubTasks

Do not discover Options against arbitrary proxy goals. Sutton et al.'s
reward-respecting-subtasks work preserves the original reward and adds a terminal
Feature bonus. In a software loop:

`subtask score = parent reward + bounded terminal-feature bonus - risk/cost penalties`

Safety constraints are not penalty terms. A denylisted path or action is an absolute
gate and cannot be compensated by a larger bonus.

## Planning utility is part of promotion

An Option is useful to Oak because its Model improves planning. Success alone is
insufficient. Compare against a baseline:

- decisions or primitive actions to reach the same terminal state;
- tool calls, tokens, elapsed time, and external cost;
- reward and regression result;
- uncertainty and blast radius.

Record the comparison. If the Option adds no planning advantage, keep it as a procedure
or archive it; do not cite it as recursive capability growth.

## Continual adaptation and plasticity

Update after every interaction (online, batch-size-1 in the engineering adaptation).
Track calibration separately from success:

- binary prediction: probability `p`, outcome `y`, Brier error `(p-y)^2`;
- numeric prediction: normalized absolute error;
- categorical/text prediction: explicit field match or a human-scored rubric.

Use recent calibration to adjust an item's update-rate/confidence. Preserve a floor for
new evidence, and periodically reset low-signal confidence so old Options do not prevent
new Feature discovery. This is a practical analogue, not Sutton's exact meta-gradient
algorithm.

## Recursive growth

Recursion occurs only after an Option has a learned Model usable by the planner. The
planner's results expose new Features; those Features pose higher-order SubTasks whose
action set may include verified lower-order Options.

`F -> ST -> O -> M -> P -> F2 -> ST2 -> O2 ...`

Composition does not inherit trust automatically. Each higher-order Option needs its own
Model, calibration record, regression test, scope check, and human gate.

## Source ledger

- Richard S. Sutton, **"The Oak Architecture: A Vision of SuperIntelligence from
  Experience,"** RLC 2025 keynote abstract and video:
  `https://rl-conference.cc/2025/schedule.html` and
  `https://rl-conference.cc/2025/keynotes.html`
- Richard S. Sutton, Michael Bowling, Patrick M. Pilarski, **"The Alberta Plan for AI
  Research"** (2022): `https://arxiv.org/abs/2208.11173`
- Richard S. Sutton et al., **"Reward-Respecting Subtasks for Model-Based Reinforcement
  Learning"** (Artificial Intelligence 324, 2023):
  `https://arxiv.org/abs/2202.03466`
- Richard S. Sutton, Doina Precup, Satinder Singh, **"Between MDPs and semi-MDPs: A
  Framework for Temporal Abstraction in Reinforcement Learning"** (1999):
  `https://www.sciencedirect.com/science/article/pii/S0004370299000521`
- David Silver and Richard S. Sutton, **"Welcome to the Era of Experience"**:
  `https://storage.googleapis.com/deepmind-media/Era-of-Experience%20/The%20Era%20of%20Experience%20Paper.pdf`
- `ckt520728/loop-engineering`: cadence, Automations/Worktrees/Skills/Connectors/
  Sub-agents/Memory, L1/L2/L3, maker/checker, and operational safety:
  `https://github.com/ckt520728/loop-engineering`
