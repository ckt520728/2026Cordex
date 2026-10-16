import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Body, Card, Screen, Title } from '@/components/ui';
import { GAMES } from '@/games/catalog';
import { palette, radius, spacing, typography } from '@/theme/tokens';

export default function Home() {
  const router = useRouter();
  return (
    <Screen>
      <Title>NeuroPlay 大腦認知訓練</Title>
      <Body muted>
        給高齡者使用的短回合 brain game。每次約 3 到 8 分鐘，記錄反應時間、正確率、漏答與誤認誘餌。
      </Body>

      <Card>
        <Text style={styles.warning}>使用界線</Text>
        <Body>
          本工具用於認知訓練與就醫討論前的趨勢整理，不提供自動診斷。若近期有明顯退步、幻覺、步態改變或生活功能下降，應安排正式神經心理評估。
        </Body>
      </Card>

      {GAMES.map((game) => (
        <Pressable
          key={game.id}
          accessibilityRole="button"
          accessibilityLabel={`${game.title}，${game.subtitle}`}
          onPress={() => router.push(game.route as never)}
          style={({ pressed }) => [styles.gameCard, pressed && { opacity: 0.9 }]}
        >
          <Text style={styles.glyph}>{game.glyph}</Text>
          <View style={styles.gameText}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gameSubtitle}>{game.subtitle}</Text>
            <Text style={styles.paradigm}>{game.paradigm}</Text>
          </View>
        </Pressable>
      ))}

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="查看訓練紀錄"
        onPress={() => router.push('/progress' as never)}
        style={({ pressed }) => [styles.progressLink, pressed && { opacity: 0.9 }]}
      >
        <Text style={styles.progressText}>查看訓練紀錄</Text>
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  warning: { fontSize: typography.heading, fontWeight: typography.weightBold, color: palette.danger },
  gameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: palette.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: palette.border,
  },
  glyph: { fontSize: 52 },
  gameText: { flex: 1, gap: 4 },
  gameTitle: { fontSize: typography.heading, fontWeight: typography.weightBold, color: palette.text },
  gameSubtitle: { fontSize: typography.label, color: palette.textMuted },
  paradigm: { fontSize: 14, color: palette.primaryDark },
  progressLink: {
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: palette.surfaceAlt,
  },
  progressText: { fontSize: typography.heading, fontWeight: typography.weightBold, color: palette.primaryDark },
});
