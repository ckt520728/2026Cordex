import type { CognitiveDomain, GameId } from '@/metrics/types';

export interface GameMeta {
  id: GameId;
  route: string;
  title: string;
  subtitle: string;
  glyph: string;
  domains: CognitiveDomain[];
  paradigm: string;
}

export const GAMES: GameMeta[] = [
  {
    id: 'flash-locate',
    route: '/games/flash-locate',
    title: '閃現定位',
    subtitle: '看一下、記位置，訓練視覺注意與處理速度',
    glyph: '⚡',
    domains: ['visuospatial-attention', 'processing-speed'],
    paradigm: 'Iconic memory / partial-report (Sperling)',
  },
  {
    id: 'palace',
    route: '/games/palace',
    title: '記憶宮殿',
    subtitle: '記住物品位置，再避開相似誘餌',
    glyph: '🏠',
    domains: ['paired-associate-learning', 'pattern-separation', 'episodic-memory'],
    paradigm: 'Object-location PAL + lure rejection (pattern separation)',
  },
  {
    id: 'semantic-fluency',
    route: '/games/semantic-fluency',
    title: '語意流暢',
    subtitle: '在時間內產生同類詞，觀察語意搜尋與抑制',
    glyph: '🗣️',
    domains: ['semantic-fluency', 'executive-inhibition'],
    paradigm: 'Verbal / semantic fluency',
  },
];
