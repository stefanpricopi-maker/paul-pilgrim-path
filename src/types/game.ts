export interface Player {
  id: string;
  name: string;
  character: BiblicalCharacter;
  position: number;
  money: number;
  properties: string[];
  propertyVisits: Record<string, number>; // Track visits to owned properties
  color: string;
  inJail: boolean;
  jailTurns: number;
  hasGetOutOfJailCard: boolean;
  immunityUntil: number; // Round number until which player has immunity
  skipNextTurn: boolean;
  consecutiveDoubles: number;
  hasRolled: boolean; // Track if player has rolled this turn
}

export interface BiblicalCharacter {
  name: string;
  description: string;
  specialAbility: string;
  avatar: string;
  avatar_face: string;
}

export interface GameLocation {
  id: string;
  name: string;
  type: 'city' | 'port' | 'special' | 'prison' | 'go-to-prison' | 'chance' | 'community-chest' | 'court' | 'sacrifice';
  journey: 1 | 2 | 3 | 4;
  price: number;
  rent: number;
  churchCost: number;
  synagogueCost: number;
  owner?: string;
  buildings: {
    churches: number;
    synagogues: number;
  };
  description: string;
  color?: string; // For matching image colors
}

export interface GameState {
  players: Player[];
  currentPlayerIndex: number;
  locations: GameLocation[];
  gameStarted: boolean;
  diceValue: number;
  isRolling: boolean;
  gameLog: string[];
}

export interface DiceProps {
  dice1: number;
  dice2: number;
  isRolling: boolean;
  onRoll: () => void;
  canRoll?: boolean; // optional: controls whether the user can roll now
}

export const BIBLICAL_CHARACTERS: BiblicalCharacter[] = [
  {
    name: "Barnabas",
    description: "The encourager and Paul's trusted companion",
    specialAbility: "Receives 10% more income from properties",
    avatar: "/barnabas_small.png",
    avatar_face: "/barnabas_face.png"
  },
  {
    name: "Silas",
    description: "The faithful missionary partner",
    specialAbility: "Can move an extra space once per turn",
    avatar: "/silas_small.png"
  },
  {
    name: "Timothy",
    description: "The young disciple",
    specialAbility: "Pays 50% less for building churches",
    avatar: "👨‍🎓"
  },
  {
    name: "Luke",
    description: "The physician and historian",
    specialAbility: "Heals from negative effects faster",
    avatar: "👨‍⚕️"
  },
  {
    name: "Aquila",
    description: "The tentmaker and teacher",
    specialAbility: "Earns extra money when passing GO",
    avatar: "👨‍🏭"
  },
  {
    name: "Priscilla",
    description: "The wise teacher and leader",
    specialAbility: "Can negotiate better property prices",
    avatar: "👸🏽"
  }
];