export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: AchievementCategory;
  condition: AchievementCondition;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlocked: boolean;
  unlockedAt?: Date;
  progress?: number;
  maxProgress?: number;
}

export type AchievementCategory = 
  | 'building' 
  | 'economy' 
  | 'movement' 
  | 'special' 
  | 'social' 
  | 'milestone';

export interface AchievementCondition {
  type: 'counter' | 'threshold' | 'event' | 'streak' | 'combo';
  target: number;
  metric: string;
  context?: any;
}

export interface PlayerAchievements {
  playerId: string;
  achievements: Achievement[];
  stats: GameStats;
}

export interface GameStats {
  gamesPlayed: number;
  gamesWon: number;
  totalMoney: number;
  propertiesBought: number;
  churchesBuilt: number;
  synagoguesBuilt: number;
  jailTime: number;
  doublesRolled: number;
  cardsDrawn: number;
  rentPaid: number;
  rentCollected: number;
  timesPassedStart: number;
  longestGame: number; // in rounds
  fastestWin: number; // in rounds
}

export const DEFAULT_ACHIEVEMENTS: Omit<Achievement, 'unlocked' | 'progress'>[] = [
  // Building Achievements
  {
    id: 'first_church',
    name: 'Foundation Stone',
    description: 'Build your first church',
    icon: '⛪',
    category: 'building',
    condition: { type: 'counter', target: 1, metric: 'churchesBuilt' },
    rarity: 'common'
  },
  {
    id: 'church_builder',
    name: 'Master Builder',
    description: 'Build 5 churches in a single game',
    icon: '🏗️',
    category: 'building',
    condition: { type: 'threshold', target: 5, metric: 'churchesBuiltInGame' },
    rarity: 'rare'
  },
  {
    id: 'architect',
    name: 'Divine Architect',
    description: 'Build both churches and synagogues in the same game',
    icon: '🏛️',
    category: 'building',
    condition: { type: 'combo', target: 1, metric: 'mixedBuildings' },
    rarity: 'epic'
  },

  // Economy Achievements
  {
    id: 'millionaire',
    name: 'Blessed Abundance',
    description: 'Accumulate 2000 coins',
    icon: '💰',
    category: 'economy',
    condition: { type: 'threshold', target: 2000, metric: 'money' },
    rarity: 'rare'
  },
  {
    id: 'property_mogul',
    name: 'Land Baron',
    description: 'Own 8 properties simultaneously',
    icon: '🏘️',
    category: 'economy',
    condition: { type: 'threshold', target: 8, metric: 'propertiesOwned' },
    rarity: 'epic'
  },
  {
    id: 'rent_collector',
    name: 'Faithful Steward',
    description: 'Collect 1000 coins in rent in a single game',
    icon: '💵',
    category: 'economy',
    condition: { type: 'threshold', target: 1000, metric: 'rentCollectedInGame' },
    rarity: 'rare'
  },

  // Movement Achievements
  {
    id: 'world_traveler',
    name: 'Great Commission',
    description: 'Pass GO 10 times in a single game',
    icon: '🌍',
    category: 'movement',
    condition: { type: 'threshold', target: 10, metric: 'passedStartInGame' },
    rarity: 'rare'
  },
  {
    id: 'lucky_roller',
    name: 'Blessed Steps',
    description: 'Roll doubles 3 times in a row',
    icon: '🎲',
    category: 'movement',
    condition: { type: 'streak', target: 3, metric: 'doublesStreak' },
    rarity: 'epic'
  },
  {
    id: 'jailbird',
    name: 'Suffering Servant',
    description: 'Spend 5 turns in jail in one game',
    icon: '⛓️',
    category: 'movement',
    condition: { type: 'threshold', target: 5, metric: 'jailTurnsInGame' },
    rarity: 'common'
  },

  // Special Achievements
  {
    id: 'first_win',
    name: 'Victory in Christ',
    description: 'Win your first game',
    icon: '👑',
    category: 'milestone',
    condition: { type: 'counter', target: 1, metric: 'gamesWon' },
    rarity: 'common'
  },
  {
    id: 'quick_victory',
    name: 'Swift Justice',
    description: 'Win a game in under 30 rounds',
    icon: '⚡',
    category: 'milestone',
    condition: { type: 'threshold', target: 30, metric: 'fastestWinRounds', context: { lessThan: true } },
    rarity: 'legendary'
  },
  {
    id: 'card_master',
    name: 'Scripture Scholar',
    description: 'Draw 20 cards in a single game',
    icon: '📜',
    category: 'special',
    condition: { type: 'threshold', target: 20, metric: 'cardsDrawnInGame' },
    rarity: 'rare'
  },

  // Social Achievements (for future multiplayer features)
  {
    id: 'generous_spirit',
    name: 'Generous Heart',
    description: 'Pay over 500 coins in rent to other players in one game',
    icon: '💝',
    category: 'social',
    condition: { type: 'threshold', target: 500, metric: 'rentPaidInGame' },
    rarity: 'rare'
  }
];