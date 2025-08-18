import { useState, useCallback } from 'react';
import { AIPlayer, AIPersonality, AIDecision, AI_PERSONALITIES } from '@/types/ai';
import { Player } from '@/types/game';
import { GameLocation } from '@/types/game';

export const useAI = () => {
  const [isAIThinking, setIsAIThinking] = useState(false);

  const createAIPlayer = useCallback((
    id: string,
    name: string,
    character: any,
    color: string,
    personalityIndex: number = 0
  ): AIPlayer => {
    const personality = AI_PERSONALITIES[personalityIndex % AI_PERSONALITIES.length];
    
    return {
      id,
      name,
      character,
      position: 0,
      money: 1000,
      properties: [],
      propertyVisits: {},
      hasRolled: false,
      color,
      inJail: false,
      jailTurns: 0,
      hasGetOutOfJailCard: false,
      immunityUntil: 0,
      skipNextTurn: false,
      consecutiveDoubles: 0,
      isAI: true,
      aiPersonality: personality,
      decisionDelay: 1000 + Math.random() * 2000 // 1-3 seconds
    };
  }, []);

  const makeAIDecision = useCallback(async (
    aiPlayer: AIPlayer,
    currentLocation: GameLocation,
    gameState: any
  ): Promise<AIDecision> => {
    setIsAIThinking(true);
    
    // Simulate AI thinking time
    await new Promise(resolve => setTimeout(resolve, aiPlayer.decisionDelay));
    
    const { traits } = aiPlayer.aiPersonality;
    let decision: AIDecision = { action: 'pass', confidence: 0.5 };

    // Decision logic for buying property
    if (currentLocation.type === 'city' && !currentLocation.owner && currentLocation.price <= aiPlayer.money) {
      const moneyRatio = aiPlayer.money / currentLocation.price;
      const shouldBuy = Math.random() < (traits.aggression * 0.8 + moneyRatio * 0.2);
      
      if (shouldBuy && moneyRatio > 1.5) { // Don't spend all money
        decision = {
          action: 'buy',
          confidence: traits.aggression * moneyRatio * 0.3,
          reasoning: `${aiPlayer.name} decides to invest in ${currentLocation.name}`
        };
      }
    }

    // Decision logic for building
    if (currentLocation.owner === aiPlayer.id && aiPlayer.money > currentLocation.churchCost * 2) {
      const shouldBuild = Math.random() < traits.building;
      
      if (shouldBuild && currentLocation.buildings.churches < 2) {
        decision = {
          action: 'build_church',
          confidence: traits.building,
          reasoning: `${aiPlayer.name} strengthens their ministry in ${currentLocation.name}`
        };
      } else if (shouldBuild && currentLocation.buildings.synagogues < 1 && aiPlayer.money > currentLocation.synagogueCost * 2) {
        decision = {
          action: 'build_synagogue',
          confidence: traits.building * 0.8,
          reasoning: `${aiPlayer.name} builds interfaith relations in ${currentLocation.name}`
        };
      }
    }

    setIsAIThinking(false);
    return decision;
  }, []);

  const shouldAIBuyProperty = useCallback((
    aiPlayer: AIPlayer,
    location: GameLocation
  ): boolean => {
    const { traits } = aiPlayer.aiPersonality;
    
    // Don't buy if it would leave AI with less than 200 coins
    if (aiPlayer.money - location.price < 200) return false;
    
    // Higher aggression = more likely to buy
    const aggressionFactor = traits.aggression;
    
    // Consider money-to-price ratio
    const moneyRatio = aiPlayer.money / location.price;
    const moneyFactor = Math.min(moneyRatio / 3, 1); // Cap at 1
    
    // Consider property value (rent/price ratio)
    const valueFactor = location.rent / location.price;
    
    // Combined probability
    const buyProbability = (aggressionFactor * 0.4) + (moneyFactor * 0.4) + (valueFactor * 0.2);
    
    return Math.random() < buyProbability;
  }, []);

  const shouldAIBuildChurch = useCallback((
    aiPlayer: AIPlayer,
    location: GameLocation
  ): boolean => {
    const { traits } = aiPlayer.aiPersonality;
    
    // Don't build if it would leave AI with less than 300 coins
    if (aiPlayer.money - location.churchCost < 300) return false;
    
    // Don't build if already has 2 churches
    if (location.buildings.churches >= 2) return false;
    
    // Building trait influences decision
    const buildingFactor = traits.building;
    
    // Consider ROI - how much rent increase per cost
    const currentRent = location.rent + (location.buildings.churches * 50);
    const newRent = location.rent + ((location.buildings.churches + 1) * 50);
    const rentIncrease = newRent - currentRent;
    const roiFactor = rentIncrease / location.churchCost;
    
    const buildProbability = (buildingFactor * 0.7) + (roiFactor * 0.3);
    
    return Math.random() < buildProbability;
  }, []);

  const shouldAIBuildSynagogue = useCallback((
    aiPlayer: AIPlayer,
    location: GameLocation
  ): boolean => {
    const { traits } = aiPlayer.aiPersonality;
    
    // Don't build if it would leave AI with less than 400 coins
    if (aiPlayer.money - location.synagogueCost < 400) return false;
    
    // Don't build if already has a synagogue
    if (location.buildings.synagogues >= 1) return false;
    
    // Must have at least 1 church first
    if (location.buildings.churches < 1) return false;
    
    // Building trait influences decision (synagogues are rarer)
    const buildingFactor = traits.building * 0.8;
    
    const buildProbability = buildingFactor;
    
    return Math.random() < buildProbability;
  }, []);

  return {
    createAIPlayer,
    makeAIDecision,
    shouldAIBuyProperty,
    shouldAIBuildChurch,
    shouldAIBuildSynagogue,
    isAIThinking
  };
};