import { useState, useCallback } from 'react';
import { Card, CommunityCard, ChanceCard } from '@/types/cards';
import { supabase } from '@/integrations/supabase/client';

export const useCards = () => {
  const [communityCards, setCommunityCards] = useState<CommunityCard[]>([]);
  const [chanceCards, setChanceCards] = useState<ChanceCard[]>([]);
  const [loading, setLoading] = useState(false);

  // Load cards from database
  const loadCards = useCallback(async () => {
    setLoading(true);
    try {
      const [communityResult, chanceResult] = await Promise.all([
        supabase.from('cards_community').select('*'),
        supabase.from('cards_chance').select('*')
      ]);

      if (communityResult.data) {
        setCommunityCards(communityResult.data);
      }
      
      if (chanceResult.data) {
        setChanceCards(chanceResult.data);
      }
    } catch (error) {
      console.error('Failed to load cards:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Draw a random community card
  const drawCommunityCard = useCallback((): CommunityCard | null => {
    if (communityCards.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * communityCards.length);
    return communityCards[randomIndex];
  }, [communityCards]);

  // Draw a random chance card
  const drawChanceCard = useCallback((): ChanceCard | null => {
    if (chanceCards.length === 0) return null;
    const randomIndex = Math.floor(Math.random() * chanceCards.length);
    return chanceCards[randomIndex];
  }, [chanceCards]);

  // Process card action based on type
  const processCardAction = useCallback((card: Card, currentPlayerPosition: number, boardLength: number) => {
    const result = {
      newPosition: currentPlayerPosition,
      moneyChange: 0,
      passedStart: false,
      description: ''
    };

    switch (card.action_type) {
      case 'add_money':
        // Extract money amount directly from the card text
        const moneyMatch = card.text_en.match(/(\d+)/);
        result.moneyChange = moneyMatch ? parseInt(moneyMatch[1]) : 100;
        result.description = `Received ${result.moneyChange} denarii`;
        break;

      case 'lose_money':
      case 'pay_money':
        const lossMatch = card.text_en.match(/(\d+)/);
        result.moneyChange = -(lossMatch ? parseInt(lossMatch[1]) : 50);
        result.description = `Lost ${Math.abs(result.moneyChange)} denarii`;
        break;

      case 'go_to_tile':
        if (card.action_value) {
          // This would need to map tile names to positions
          // For now, simplified logic
          result.description = `Go to ${card.action_value}`;
        }
        break;

      case 'go_to_tile_and_pass_bonus':
        if (card.action_value) {
          // Check if player passes start when moving
          result.passedStart = true; // Simplified logic
          result.moneyChange = 200; // Start bonus
          result.description = `Go to ${card.action_value} and collect start bonus`;
        }
        break;

      case 'go_to_nearest_port':
        result.description = 'Go to nearest port';
        break;

      default:
        result.description = card.text_en;
    }

    return result;
  }, []);

  return {
    communityCards,
    chanceCards,
    loading,
    loadCards,
    drawCommunityCard,
    drawChanceCard,
    processCardAction,
  };
};