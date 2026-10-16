/**
 * MVP stimulus set.
 *
 * Emoji are temporary, high-contrast stand-ins for artwork. Each item keeps a
 * category so recognition trials can include semantic lures.
 */

export interface StimulusItem {
  id: string;
  label: string;
  glyph: string;
  category: 'fruit' | 'household' | 'tool' | 'clothing' | 'animal' | 'food';
}

export const STIMULI: StimulusItem[] = [
  { id: 'apple', label: '蘋果', glyph: '🍎', category: 'fruit' },
  { id: 'green-apple', label: '青蘋果', glyph: '🍏', category: 'fruit' },
  { id: 'banana', label: '香蕉', glyph: '🍌', category: 'fruit' },
  { id: 'grapes', label: '葡萄', glyph: '🍇', category: 'fruit' },
  { id: 'cup', label: '杯子', glyph: '☕', category: 'household' },
  { id: 'key', label: '鑰匙', glyph: '🔑', category: 'household' },
  { id: 'clock', label: '時鐘', glyph: '🕒', category: 'household' },
  { id: 'umbrella', label: '雨傘', glyph: '☂️', category: 'household' },
  { id: 'comb', label: '梳子', glyph: '🪮', category: 'household' },
  { id: 'scissors', label: '剪刀', glyph: '✂️', category: 'tool' },
  { id: 'hammer', label: '槌子', glyph: '🔨', category: 'tool' },
  { id: 'hat', label: '帽子', glyph: '🎩', category: 'clothing' },
  { id: 'shoe', label: '鞋子', glyph: '👞', category: 'clothing' },
  { id: 'cat', label: '貓', glyph: '🐱', category: 'animal' },
  { id: 'dog', label: '狗', glyph: '🐶', category: 'animal' },
  { id: 'bread', label: '麵包', glyph: '🍞', category: 'food' },
];

export function itemById(id: string): StimulusItem | undefined {
  return STIMULI.find((s) => s.id === id);
}

export function itemsInCategory(category: StimulusItem['category']): StimulusItem[] {
  return STIMULI.filter((s) => s.category === category);
}

export const FLUENCY_PROMPTS: { id: string; prompt: string; examples: string[] }[] = [
  { id: 'green-veg', prompt: '請說出或輸入綠色蔬菜', examples: ['菠菜', '青江菜', '空心菜', '花椰菜'] },
  { id: 'transport', prompt: '請說出或輸入交通工具', examples: ['公車', '捷運', '機車', '火車'] },
  { id: 'fruit', prompt: '請說出或輸入水果', examples: ['蘋果', '香蕉', '葡萄', '芭樂'] },
  { id: 'kitchen', prompt: '請說出或輸入廚房會用到的東西', examples: ['碗', '鍋子', '筷子', '湯匙'] },
];
