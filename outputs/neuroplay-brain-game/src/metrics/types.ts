/**
 * Cognitive metric model.
 *
 * NeuroPlay is both a training app and a lightweight screening aid, so every
 * game emits structured metrics rather than a single "score". These fields map
 * to constructs from the reference literature (see docs/references/) — e.g.
 * false positives / lure rejection for hippocampal pattern separation, and
 * object–location binding accuracy for paired-associate learning (PAL).
 *
 * IMPORTANT: This app is a wellness/training tool, NOT a diagnostic device.
 * Metrics are indicative trends for the user and their family/clinician to
 * discuss — never an automated diagnosis. See CLAUDE.md "Clinical guardrails".
 */

/** Cognitive domains the games target, per the neuropsychology notes. */
export type CognitiveDomain =
  | 'visuospatial-attention'
  | 'working-memory'
  | 'episodic-memory'
  | 'pattern-separation'
  | 'paired-associate-learning'
  | 'processing-speed'
  | 'semantic-fluency'
  | 'executive-inhibition';

export type GameId = 'flash-locate' | 'palace' | 'semantic-fluency';

/** A single stimulus-response event within a session (trial-level record). */
export interface TrialResult {
  index: number;
  correct: boolean;
  /** Reaction time in ms from stimulus onset to response. */
  reactionTimeMs: number;
  /**
   * Error classification, when applicable. This is the clinically meaningful
   * part: AD/MCI patients tend toward false positives (familiarity without
   * recollection), whereas depression/attention issues tend toward omissions.
   */
  errorType?: 'false-positive' | 'omission' | 'location-error' | 'lure-intrusion' | 'none';
  /** Optional payload for game-specific detail (e.g. lure category). */
  meta?: Record<string, string | number | boolean>;
}

/** Aggregated result of one completed game session. */
export interface SessionResult {
  id: string;
  gameId: GameId;
  startedAt: string; // ISO
  completedAt: string; // ISO
  difficultyLevel: number;
  domains: CognitiveDomain[];
  trials: TrialResult[];
  /** Derived summary metrics (0..1 unless noted). */
  summary: {
    accuracy: number;
    meanReactionTimeMs: number;
    falsePositiveRate?: number;
    omissionRate?: number;
    /** Object–location binding accuracy for PAL games. */
    palAccuracy?: number;
    /** Count of valid items produced (semantic fluency). */
    itemsProduced?: number;
  };
}
