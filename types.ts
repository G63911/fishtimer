
export interface Fish {
  id: string;
  name: string;
  multiplier: number;
}

export interface FishCategory {
    label: string;
    fishes: Fish[];
}

export type TimerState = 'idle' | 'steaming' | 'heat_alarm' | 'resting' | 'ready_alarm' | 'feedback' | 'rescue';

export type Language = 'zh' | 'ph' | 'id';
