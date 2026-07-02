import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import { Body, Card, Screen, Title } from '@/components/ui';
import { GAMES } from '@/games/catalog';
import { formatPercent, interpretationFor } from '@/games/scoring';
import type { SessionResult } from '@/metrics/types';
import { clearAllData, loadSessions } from '@/storage/store';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function ProgressScreen() {
  const [sessions, setSessions] = useState<SessionResult[]>([]);

  const refresh = useCallback(() => {
    loadSessions().then((loaded) => setSessions([...loaded].reverse()));
  }, []);

  useFocusEffect(refresh);

  async function clearData() {
    await clearAllData();
    refresh();
  }

  return (
    <Screen>
      <Title>訓練紀錄</Title>
      <Body muted>所有資料只存在這台裝置。趨勢比單次分數重要；本頁不提供診斷。</Body>
      {sessions.length === 0 ? (
        <Card>
          <Body>目前還沒有紀錄。完成任一遊戲後會出現在這裡。</Body>
        </Card>
      ) : (
        sessions.map((session) => {
          const game = GAMES.find((item) => item.id === session.gameId);
          return (
            <Card key={session.id}>
              <Text style={styles.title}>{game?.title ?? session.gameId}</Text>
              <Text style={styles.date}>{new Date(session.completedAt).toLocaleString()}</Text>
              <Text style={styles.metric}>正確率：{formatPercent(session.summary.accuracy)}</Text>
              <Text style={styles.metric}>
                平均反應：{session.summary.meanReactionTimeMs ? `${session.summary.meanReactionTimeMs} ms` : '未記錄'}
              </Text>
              <Text style={styles.metric}>誤認誘餌：{formatPercent(session.summary.falsePositiveRate)}</Text>
              <Text style={styles.metric}>漏答：{formatPercent(session.summary.omissionRate)}</Text>
              {typeof session.summary.itemsProduced === 'number' && <Text style={styles.metric}>有效詞數：{session.summary.itemsProduced}</Text>}
              <Body>{interpretationFor(session)}</Body>
            </Card>
          );
        })
      )}
      {sessions.length > 0 && (
        <Pressable accessibilityRole="button" accessibilityLabel="清除本機紀錄" onPress={clearData} style={styles.clearButton}>
          <Text style={styles.clearText}>清除本機紀錄</Text>
        </Pressable>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: typography.heading, fontWeight: typography.weightBold, color: palette.text },
  date: { fontSize: typography.label, color: palette.textMuted },
  metric: { fontSize: typography.body, color: palette.text, fontVariant: ['tabular-nums'] },
  clearButton: {
    minHeight: 64,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: palette.danger,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.md,
  },
  clearText: { fontSize: typography.heading, fontWeight: typography.weightBold, color: palette.danger },
});
