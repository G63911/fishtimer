
import type { FishCategory } from './types';

export const TAELS_PER_CATTY = 16;
export const GRAMS_PER_TAEL = 37.8;

export const FISH_CATEGORIES: FishCategory[] = [
  {
    label: '👑 石斑/貴價 (Premium Groupers)',
    fishes: [
        { id: 'red_grouper', name: '東星斑 (Red Grouper)', multiplier: 1.0 },
        { id: 'tiger_grouper', name: '老虎斑 (Tiger Grouper)', multiplier: 1.05 },
        { id: 'green_grouper', name: '青斑 (Green Grouper)', multiplier: 1.0 },
        { id: 'pearl_grouper', name: '珍珠斑 (Pearl Grouper)', multiplier: 1.0 },
        { id: 'mouse_grouper', name: '老鼠斑 (Humpback Grouper)', multiplier: 0.95 },
        { id: 'coral_trout', name: '西星/燕星 (Coral Trout)', multiplier: 1.0 },
    ]
  },
  {
    label: '🌊 常見海魚 (Marine Fish)',
    fishes: [
        { id: 'yellow_croaker', name: '黃花魚 (Yellow Croaker)', multiplier: 0.9 },
        { id: 'pomfret_white', name: '白鯧 (White Pomfret)', multiplier: 0.85 },
        { id: 'pomfret_gold', name: '金鯧 (Golden Pomfret)', multiplier: 0.9 },
        { id: 'threadfin', name: '馬友 (Threadfin)', multiplier: 1.0 },
        { id: 'tilefish', name: '馬頭魚 (Tilefish)', multiplier: 0.85 },
        { id: 'grey_mullet', name: '烏頭 (Grey Mullet)', multiplier: 1.1 },
        { id: 'sole_fish', name: '撻沙/龍利 (Sole Fish)', multiplier: 0.8 },
        { id: 'seabream', name: '立魚/臘魚 (Seabream)', multiplier: 1.05 },
    ]
  },
  {
    label: '🏞️ 淡水/河鮮 (Freshwater)',
    fishes: [
        { id: 'grass_carp', name: '鯇魚 (Grass Carp)', multiplier: 1.1 },
        { id: 'carp_belly', name: '鯇魚腩 (Carp Belly)', multiplier: 1.2 },
        { id: 'mandarin_fish', name: '桂花魚 (Mandarin Fish)', multiplier: 1.0 },
        { id: 'marble_goby', name: '筍殼魚 (Marble Goby)', multiplier: 1.05 },
        { id: 'white_eel', name: '白鱔 (White Eel)', multiplier: 1.25 },
        { id: 'bighead_carp', name: '大魚/大頭 (Bighead Carp)', multiplier: 1.15 },
    ]
  },
  {
    label: '🔪 特別部位/其他 (Special Cuts)',
    fishes: [
        { id: 'giant_grouper_meat', name: '龍躉球/肉 (Giant Grouper Meat)', multiplier: 1.3 },
        { id: 'fish_head', name: '魚雲/魚頭 (Fish Head)', multiplier: 1.25 },
        { id: 'squid', name: '鮮魷魚 (Fresh Squid)', multiplier: 0.6 },
    ]
  }
];


export const BASE_TIME_SECONDS = 480; // 8 minutes for 1 catty (16 taels)
export const SECONDS_PER_TAEL_ADJUSTMENT = 30;
export const RESTING_TIME_SECONDS = 120; // 2 minutes
