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
          // Map tile names to positions from GAME_LOCATIONS
          const tileNameMap: Record<string, number> = {
            'EFES': 21,
            'ANTIOCHIA': 0,
            'CORINT': 24,
            'ATENA': 22,
            'FILIPI': 15,
            'TESALONIC': 17,
            'BEREEA': 18,
            'ICONIA': 5,
            'LISTRA': 7,
            'DERBE': 8,
            'TARS': 12,
            'TROAS': 13,
            'MALTA': 34,
            'RODOS': 31,
            'MILET': 28
          };
          
          const targetPosition = tileNameMap[card.action_value.toUpperCase()];
          if (targetPosition !== undefined) {
            result.newPosition = targetPosition;
            // Check if player passes start
            if (targetPosition < currentPlayerPosition) {
              result.passedStart = true;
              result.moneyChange = 200; // Start bonus
            }
          }
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
        // Find nearest port and apply 50 denari tax
        // Port positions: port1=9, port2=19, port3=29, port4=39 (based on game locations)
        const portPositions = [9, 19, 29, 39];
        let nearestPort = portPositions[0];
        let minDistance = Math.abs(currentPlayerPosition - portPositions[0]);
        
        for (const portPos of portPositions) {
          const distance = Math.min(
            Math.abs(currentPlayerPosition - portPos),
            boardLength - Math.abs(currentPlayerPosition - portPos)
          );
          if (distance < minDistance) {
            minDistance = distance;
            nearestPort = portPos;
          }
        }
        
        result.newPosition = nearestPort;
        result.moneyChange = -50; // 50 denari tax
        result.description = 'Go to nearest port and pay 50 denari ticket tax';
        break;

      case 'go_to_jail':
        // Send player directly to jail
        result.newPosition = 10; // Prison position (index 10 in GAME_LOCATIONS)
        result.description = 'Go directly to jail';
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