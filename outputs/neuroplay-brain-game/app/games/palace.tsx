import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { BigButton, Body, Card, Screen, Title } from '@/components/ui';
import { STIMULI, itemsInCategory } from '@/content/stimuli';
import { makeSession } from '@/games/scoring';
import { shuffle } from '@/games/session';
import type { TrialResult } from '@/metrics/types';
import { appendSession } from '@/storage/store';
import { palette, radius, spacing, typography } from '@/theme/tokens';

const ITEMS = STIMULI.slice(0, 6);

export default function PalaceGame() {
  const router = useRouter();
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [phase, setPhase] = useState<'study' | 'test' | 'done'>('study');
  const [queryIndex, setQueryIndex] = useState(0);
  const [trialStarted, setTrialStarted] = useState(Date.now());
  const [trials, setTrials] = useState<TrialResult[]>([]);
  const layout = useMemo(() => shuffle(ITEMS).map((item, index) => ({ ...item, slot: index })), [startedAt]);
  const current = layout[queryIndex];
  const options = useMemo(() => (current ? shuffle([current, semanticLure(current.id, current.category)]) : []), [current]);

  function beginTest() {
    setTrialStarted(Date.now());
    setPhase('test');
  }

  async function answer(itemId: string) {
    const correct = itemId === current.id;
    const trial: TrialResult = {
      index: trials.length,
      correct,
      reactionTimeMs: Date.now() - trialStarted,
      errorType: correct ? 'none' : 'lure-intrusion',
      meta: { target: current.id, answer: itemId, slot: current.slot },
    };
    const nextTrials: TrialResult[] = [
      ...trials,
      trial,
    ];
    setTrials(nextTrials);
    if (queryIndex + 1 >= layout.length) {
      await appendSession(makeSession('palace', startedAt, nextTrials, { palAccuracy: nextTrials.filter((t) => t.correct).length / nextTrials.length }));
      setPhase('done');
      return;
    }
    setQueryIndex(queryIndex + 1);
    setTrialStarted(Date.now());
  }

  function reset() {
    setStartedAt(new Date().toISOString());
    setTrials([]);
    setQueryIndex(0);
    setPhase('study');
  }

  return (
    <Screen>
      <Title>記憶宮殿</Title>
      <Body muted>先記住物品與位置，再選出每個位置原本的物品。相似誘餌可觀察 lure rejection。</Body>
      <Card>
        <View style={styles.grid}>
          {Array.from({ length: 6 }, (_, slot) => {
            const item = layout.find((entry) => entry.slot === slot);
            const showItem = phase === 'study';
            const isPrompt = phase === 'test' && current?.slot === slot;
            return (
              <View key={slot} style={[styles.cell, isPrompt && styles.promptCell]}>
                <Text style={styles.glyph}>{showItem ? item?.glyph : isPrompt ? '?' : ''}</Text>
                <Text style={styles.cellLabel}>{showItem ? item?.label : `位置 ${slot + 1}`}</Text>
              </View>
            );
          })}
        </View>
        {phase === 'study' && <BigButton label="我記好了，開始測驗" onPress={beginTest} />}
        {phase === 'test' && current && (
          <>
            <Text style={styles.prompt}>位置 {current.slot + 1} 原本是哪一個？</Text>
            {options.map((item) => (
              <BigButton key={item.id} label={`${item.glyph} ${item.label}`} variant="neutral" onPress={() => answer(item.id)} />
            ))}
          </>
        )}
        {phase === 'done' && (
          <>
            <Body>已儲存本回合。重點觀察 PAL accuracy 與 lure intrusion。</Body>
            <BigButton label="查看訓練紀錄" variant="success" onPress={() => router.push('/progress' as never)} />
            <BigButton label="再玩一次" onPress={reset} />
          </>
        )}
      </Card>
    </Screen>
  );
}

function semanticLure(id: string, category: (typeof STIMULI)[number]['category']) {
  return itemsInCategory(category).find((item) => item.id !== id) ?? STIMULI.find((item) => item.id !== id)!;
}

const styles = StyleSheet.create({
  grid: { gap: spacing.sm, flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '47%',
    minHeight: 120,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: palette.border,
    backgroundColor: palette.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  promptCell: { borderColor: palette.primary, backgroundColor: '#DBEAFE' },
  glyph: { fontSize: 42 },
  cellLabel: { fontSize: typography.label, color: palette.text, textAlign: 'center' },
  prompt: { fontSize: typography.heading, fontWeight: typography.weightBold, color: palette.text },
});
