import type { GameId, SessionResult, TrialResult } from '@/metrics/types';
import { GAMES } from '@/games/catalog';
import { randomId, summarizeTrials } from '@/games/session';

export function makeSession(
  gameId: GameId,
  startedAt: string,
  trials: TrialResult[],
  extraSummary: Partial<SessionResult['summary']> = {},
): SessionResult {
  const meta = GAMES.find((game) => game.id === gameId);
  return {
    id: randomId(),
    gameId,
    startedAt,
    completedAt: new Date().toISOString(),
    difficultyLevel: 1,
    domains: meta?.domains ?? [],
    trials,
    summary: {
      ...summarizeTrials(trials),
      ...extraSummary,
    },
  };
}

export function formatPercent(value?: number): string {
  if (typeof value !== 'number') return '尚無';
  return `${Math.round(value * 100)}%`;
}

export function interpretationFor(session: SessionResult): string {
  const { accuracy, falsePositiveRate = 0, omissionRate = 0, meanReactionTimeMs } = session.summary;
  if (accuracy >= 0.8 && falsePositiveRate < 0.2 && omissionRate < 0.2) {
    return '本回合表現穩定，可逐步增加難度或延長訓練週期。';
  }
  if (falsePositiveRate >= omissionRate && falsePositiveRate >= 0.25) {
    return '誤認相似誘餌偏多，代表 recollection / lure rejection 需要追蹤；若日常記憶也退步，建議正式評估。';
  }
  if (omissionRate >= 0.25 || meanReactionTimeMs > 4500) {
    return '漏答或反應偏慢，可能受注意、疲勞、視力、情緒或處理速度影響；建議固定時段重測比較。';
  }
  return '可作為個人基準值，重點是觀察連續幾週的趨勢。';
}
