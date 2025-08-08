import { Player } from './game';

export interface AIPlayer extends Player {
  isAI: true;
  aiPersonality: AIPersonality;
  decisionDelay: number; // milliseconds to simulate thinking
}

export interface AIPersonality {
  name: string;
  description: string;
  traits: {
    aggression: number; // 0-1: How likely to buy properties
    building: number; // 0-1: How likely to build churches/synagogues
    riskTaking: number; // 0-1: How willing to take financial risks
    trading: number; // 0-1: How likely to make deals (future feature)
  };
}

export interface AIDecision {
  action: 'buy' | 'build_church' | 'build_synagogue' | 'pass';
  confidence: number; // 0-1
  reasoning?: string;
}

export const AI_PERSONALITIES: AIPersonality[] = [
  {
    name: "Conservative Builder",
    description: "Builds steadily and avoids risks",
    traits: {
      aggression: 0.3,
      building: 0.8,
      riskTaking: 0.2,
      trading: 0.4
    }
  },
  {
    name: "Aggressive Investor",
    description: "Buys everything possible, takes big risks",
    traits: {
      aggression: 0.9,
      building: 0.6,
      riskTaking: 0.8,
      trading: 0.7
    }
  },
  {
    name: "Balanced Strategist",
    description: "Makes calculated decisions, adapts to situations",
    traits: {
      aggression: 0.6,
      building: 0.6,
      riskTaking: 0.5,
      trading: 0.6
    }
  },
  {
    name: "Property Collector",
    description: "Focuses on acquiring as many properties as possible",
    traits: {
      aggression: 0.8,
      building: 0.3,
      riskTaking: 0.4,
      trading: 0.8
    }
  }
];

export const AI_NAMES = [
  "Paul the Apostle",
  "Peter the Rock",
  "John the Beloved",
  "Matthew the Scribe",
  "Mark the Evangelist",
  "James the Just"
];