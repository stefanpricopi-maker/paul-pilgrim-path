import { useCallback } from 'react';
import { Player } from '@/types/game';
import { EconomyTransaction } from '@/types/cards';

export const useEconomy = () => {
  // Calculate income from buildings
  const calculateBuildingIncome = useCallback((player: Player, locations: any[]) => {
    let totalIncome = 0;
    
    player.properties.forEach(propertyId => {
      const location = locations.find(loc => loc.id === propertyId);
      if (location) {
        // Church income: 50 coins per church
        totalIncome += location.buildings.churches * 50;
        // Synagogue income: 25 coins per synagogue  
        totalIncome += location.buildings.synagogues * 25;
      }
    });
    
    return totalIncome;
  }, []);

  // Handle passing start (Antiohia) - award bonus
  const handlePassStart = useCallback((player: Player, startBonus: number = 200): EconomyTransaction => {
    return {
      playerId: player.id,
      amount: startBonus,
      reason: 'Passed through Antiohia (Start)',
      type: 'income'
    };
  }, []);

  // Handle card rewards/penalties
  const handleCardAction = useCallback((player: Player, actionType: string, actionValue?: string): EconomyTransaction[] => {
    const transactions: EconomyTransaction[] = [];
    
    switch (actionType) {
      case 'add_money':
        // We'll get the amount from the card text processing, not actionValue
        // The text contains the amount like "150 Tec$"
        let rewardAmount = 100; // Default fallback
        // Since we don't have the full text here, we'll use a default
        // The actual amount extraction happens in processCardAction
        transactions.push({
          playerId: player.id,
          amount: rewardAmount,
          reason: 'Community/Chance card reward',
          type: 'income'
        });
        break;
        
      case 'lose_money':
        const penaltyAmount = parseInt(actionValue || '50');
        transactions.push({
          playerId: player.id,
          amount: penaltyAmount,
          reason: 'Community/Chance card penalty',
          type: 'expense'
        });
        break;
        
      case 'pay_per_building':
        // Pay for each building owned
        const costPerBuilding = parseInt(actionValue || '25');
        // This would need to be calculated based on total buildings owned
        transactions.push({
          playerId: player.id,
          amount: costPerBuilding, // Simplified - would need actual building count
          reason: 'Building maintenance fee',
          type: 'expense'
        });
        break;
    }
    
    return transactions;
  }, []);

  // Handle rent payments
  const handleRentPayment = useCallback((
    tenant: Player, 
    landlord: Player, 
    rentAmount: number
  ): EconomyTransaction[] => {
    return [
      {
        playerId: tenant.id,
        amount: rentAmount,
        reason: `Rent paid to ${landlord.name}`,
        type: 'expense'
      },
      {
        playerId: landlord.id,
        amount: rentAmount,
        reason: `Rent received from ${tenant.name}`,
        type: 'income'
      }
    ];
  }, []);

  // Handle building costs
  const handleBuildingCost = useCallback((
    player: Player, 
    buildingType: 'church' | 'synagogue', 
    cost: number
  ): EconomyTransaction => {
    return {
      playerId: player.id,
      amount: cost,
      reason: `Built ${buildingType}`,
      type: 'expense'
    };
  }, []);

  // Apply transactions to update player money
  const applyTransactions = useCallback((
    players: Player[], 
    transactions: EconomyTransaction[]
  ): Player[] => {
    const updatedPlayers = [...players];
    
    transactions.forEach(transaction => {
      const playerIndex = updatedPlayers.findIndex(p => p.id === transaction.playerId);
      if (playerIndex !== -1) {
        const player = updatedPlayers[playerIndex];
        const newAmount = transaction.type === 'income' 
          ? player.money + transaction.amount
          : player.money - transaction.amount;
          
        updatedPlayers[playerIndex] = {
          ...player,
          money: Math.max(0, newAmount) // Don't allow negative money
        };
      }
    });
    
    return updatedPlayers;
  }, []);

  return {
    calculateBuildingIncome,
    handlePassStart,
    handleCardAction,
    handleRentPayment,
    handleBuildingCost,
    applyTransactions,
  };
};