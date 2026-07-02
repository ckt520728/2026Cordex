import { useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { BigButton, Body, Card, Screen, Title } from '@/components/ui';
import { FLUENCY_PROMPTS } from '@/content/stimuli';
import { makeSession } from '@/games/scoring';
import type { TrialResult } from '@/metrics/types';
import { appendSession } from '@/storage/store';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function SemanticFluencyGame() {
  const router = useRouter();
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const prompt = useMemo(() => FLUENCY_PROMPTS[Math.floor(Math.random() * FLUENCY_PROMPTS.length)], [startedAt]);
  const [phase, setPhase] = useState<'intro' | 'input' | 'done'>('intro');
  const [text, setText] = useState('');

  async function finish() {
    const words = parseWords(text);
    const unique = new Set(words);
    const repetitions = words.length - unique.size;
    const trial: TrialResult = {
      index: 0,
      correct: unique.size >= 8,
      reactionTimeMs: 0,
      errorType: repetitions > 0 ? 'false-positive' : unique.size === 0 ? 'omission' : 'none',
      meta: { uniqueItems: unique.size, repetitions },
    };
    await appendSession(makeSession('semantic-fluency', startedAt, [trial], { itemsProduced: unique.size }));
    setPhase('done');
  }

  function reset() {
    setStartedAt(new Date().toISOString());
    setText('');
    setPhase('intro');
  }

  return (
    <Screen>
      <Title>語意流暢</Title>
      <Body muted>輸入越多同類詞越好；重複與離題可反映 executive monitoring。臨床正式測驗通常由施測者計時與判分。</Body>
      <Card>
        <Text style={styles.prompt}>{prompt.prompt}</Text>
        {phase === 'intro' && (
          <>
            <Body>建議計時 60 秒。可由家人協助記錄，也可以直接輸入答案，每個詞用逗號或空格分開。</Body>
            <BigButton label="開始輸入" onPress={() => setPhase('input')} />
          </>
        )}
        {phase === 'input' && (
          <>
            <TextInput
              accessibilityLabel="語意流暢答案"
              multiline
              value={text}
              onChangeText={setText}
              placeholder={`例如：${prompt.examples.join('、')}`}
              style={styles.input}
            />
            <BigButton label="完成並儲存" onPress={finish} />
          </>
        )}
        {phase === 'done' && (
          <>
            <Body>已儲存本回合。有效詞數：{new Set(parseWords(text)).size}</Body>
            <BigButton label="查看訓練紀錄" variant="success" onPress={() => router.push('/progress' as never)} />
            <BigButton label="再玩一次" onPress={reset} />
          </>
        )}
      </Card>
    </Screen>
  );
}

function parseWords(value: string): string[] {
  return value
    .split(/[,\s，、;；\n]+/)
    .map((word) => word.trim())
    .filter(Boolean);
}

const styles = StyleSheet.create({
  prompt: { fontSize: typography.heading, fontWeight: typography.weightBold, color: palette.text },
  input: {
    minHeight: 180,
    borderWidth: 2,
    borderColor: palette.border,
    borderRadius: radius.md,
    padding: spacing.md,
    fontSize: typography.body,
    color: palette.text,
    backgroundColor: '#FFFFFF',
    textAlignVertical: 'top',
  },
  examples: { flexDirection: 'row', gap: spacing.sm },
});
