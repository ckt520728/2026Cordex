/** Helpers for assembling and summarizing game sessions. */
import type { SessionResult, TrialResult } from '@/metrics/types';

export function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function randomId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function summarizeTrials(trials: TrialResult[]): SessionResult['summary'] {
  const n = trials.length || 1;
  const correct = trials.filter((t) => t.correct).length;
  const rts = trials.map((t) => t.reactionTimeMs).filter((r) => r > 0);
  const fp = trials.filter((t) => t.errorType === 'false-positive').length;
  const om = trials.filter((t) => t.errorType === 'omission').length;
  return {
    accuracy: correct / n,
    meanReactionTimeMs: rts.length ? Math.round(rts.reduce((a, b) => a + b, 0) / rts.length) : 0,
    falsePositiveRate: fp / n,
    omissionRate: om / n,
  };
}
