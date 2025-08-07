export interface Card {
  id: number;
  text_en: string;
  text_ro: string;
  action_type: string;
  action_value?: string;
  category: string;
}

export interface CommunityCard extends Card {}
export interface ChanceCard extends Card {}

export interface CardAction {
  type: 'add_money' | 'lose_money' | 'go_to_tile' | 'go_to_tile_and_pass_bonus' | 'go_to_nearest_port' | 'go_to_jail' | 'get_out_of_jail_card' | 'pay_per_building';
  value?: string | number;
  description: string;
}

export interface EconomyTransaction {
  playerId: string;
  amount: number;
  reason: string;
  type: 'income' | 'expense';
}