import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton, Body, Card, Screen, Title } from '@/components/ui';
import { makeSession } from '@/games/scoring';
import type { TrialResult } from '@/metrics/types';
import { appendSession } from '@/storage/store';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const TOTAL_TRIALS = 8;

export default function FlashLocateGame() {
  const router = useRouter();
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [phase, setPhase] = useState<'intro' | 'show' | 'answer' | 'done'>('intro');
  const [target, setTarget] = useState(0);
  const [trialStarted, setTrialStarted] = useState(0);
  const [trials, setTrials] = useState<TrialResult[]>([]);

  const trialNumber = trials.length + 1;
  const cells = useMemo(() => Array.from({ length: 9 }, (_, index) => index), []);

  function startTrial() {
    const nextTarget = Math.floor(Math.random() * 9);
    setTarget(nextTarget);
    setPhase('show');
    setTrialStarted(Date.now());
    setTimeout(() => setPhase('answer'), 900);
  }

  async function choose(index: number) {
    const correct = index === target;
    const trial: TrialResult = {
      index: trials.length,
      correct,
      reactionTimeMs: Date.now() - trialStarted,
      errorType: correct ? 'none' : 'location-error',
      meta: { target, answer: index },
    };
    const nextTrials: TrialResult[] = [
      ...trials,
      trial,
    ];
    setTrials(nextTrials);
    if (nextTrials.length >= TOTAL_TRIALS) {
      await appendSession(makeSession('flash-locate', startedAt, nextTrials));
      setPhase('done');
      return;
    }
    setPhase('intro');
  }

  function reset() {
    setStartedAt(new Date().toISOString());
    setTrials([]);
    setPhase('intro');
  }

  return (
    <Screen>
      <Title>閃現定位</Title>
      <Body muted>短暫呈現 3x3 格子的目標位置，測量 visual attention、location binding 與反應時間。</Body>

      <Card>
        <Text style={styles.counter}>第 {Math.min(trialNumber, TOTAL_TRIALS)} / {TOTAL_TRIALS} 題</Text>
        <View style={styles.grid}>
          {cells.map((cell) => (
            <Pressable
              key={cell}
              disabled={phase !== 'answer'}
              accessibilityRole="button"
              accessibilityLabel={`第 ${cell + 1} 格`}
              onPress={() => choose(cell)}
              style={[
                styles.cell,
                phase === 'show' && cell === target && styles.targetCell,
                phase === 'answer' && styles.answerCell,
              ]}
            >
              <Text style={styles.cellText}>{phase === 'show' && cell === target ? '●' : ''}</Text>
            </Pressable>
          ))}
        </View>
        {phase === 'intro' && <BigButton label="顯示下一題" onPress={startTrial} />}
        {phase === 'show' && <Body>請記住藍色圓點的位置。</Body>}
        {phase === 'answer' && <Body>請點剛才出現的位置。</Body>}
        {phase === 'done' && (
          <>
            <Body>已儲存本回合。可到「訓練紀錄」查看趨勢。</Body>
            <BigButton label="查看訓練紀錄" variant="success" onPress={() => router.push('/progress' as never)} />
            <BigButton label="再玩一次" onPress={reset} />
          </>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  counter: { fontSize: typography.heading, fontWeight: typography.weightBold, color: palette.text },
  grid: { gap: spacing.sm, flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '30%',
    aspectRatio: 1,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: palette.border,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  targetCell: { backgroundColor: palette.primary },
  answerCell: { borderColor: palette.primaryDark },
  cellText: { color: '#FFFFFF', fontSize: 44, fontWeight: typography.weightBold },
});
