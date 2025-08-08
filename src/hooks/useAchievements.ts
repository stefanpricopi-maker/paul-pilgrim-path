import { useState, useCallback, useEffect } from 'react';
import { Achievement, PlayerAchievements, GameStats, DEFAULT_ACHIEVEMENTS } from '@/types/achievements';
import { Player } from '@/types/game';
import { useToast } from '@/hooks/use-toast';

const STORAGE_KEY = 'missionary-journey-achievements';

export const useAchievements = () => {
  const [playerAchievements, setPlayerAchievements] = useState<PlayerAchievements[]>([]);
  const [currentGameStats, setCurrentGameStats] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Load achievements from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setPlayerAchievements(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load achievements:', error);
      }
    }
  }, []);

  // Save achievements to localStorage
  const saveAchievements = useCallback((achievements: PlayerAchievements[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
    setPlayerAchievements(achievements);
  }, []);

  const initializePlayerAchievements = useCallback((playerId: string, playerName: string) => {
    const existing = playerAchievements.find(pa => pa.playerId === playerId);
    if (existing) return existing;

    const newPlayerAchievements: PlayerAchievements = {
      playerId,
      achievements: DEFAULT_ACHIEVEMENTS.map(achievement => ({
        ...achievement,
        unlocked: false,
        progress: 0,
        maxProgress: achievement.condition.target
      })),
      stats: {
        gamesPlayed: 0,
        gamesWon: 0,
        totalMoney: 0,
        propertiesBought: 0,
        churchesBuilt: 0,
        synagoguesBuilt: 0,
        jailTime: 0,
        doublesRolled: 0,
        cardsDrawn: 0,
        rentPaid: 0,
        rentCollected: 0,
        timesPassedStart: 0,
        longestGame: 0,
        fastestWin: 0
      }
    };

    const updated = [...playerAchievements, newPlayerAchievements];
    saveAchievements(updated);
    return newPlayerAchievements;
  }, [playerAchievements, saveAchievements]);

  const checkAchievement = useCallback((
    playerId: string,
    metric: string,
    value: number,
    context?: any
  ) => {
    const playerAch = playerAchievements.find(pa => pa.playerId === playerId);
    if (!playerAch) return;

    const newAchievements = [...playerAchievements];
    const playerIndex = newAchievements.findIndex(pa => pa.playerId === playerId);
    
    playerAch.achievements.forEach((achievement, achievementIndex) => {
      if (achievement.unlocked) return;

      const condition = achievement.condition;
      let shouldUnlock = false;

      // Check if this achievement relates to the current metric
      if (condition.metric !== metric) return;

      switch (condition.type) {
        case 'threshold':
          if (context?.lessThan) {
            shouldUnlock = value < condition.target;
          } else {
            shouldUnlock = value >= condition.target;
            // Update progress for threshold achievements
            newAchievements[playerIndex].achievements[achievementIndex].progress = Math.min(value, condition.target);
          }
          break;

        case 'counter':
          shouldUnlock = value >= condition.target;
          newAchievements[playerIndex].achievements[achievementIndex].progress = Math.min(value, condition.target);
          break;

        case 'streak':
          shouldUnlock = value >= condition.target;
          break;

        case 'combo':
          shouldUnlock = context?.hasCombo === true;
          break;

        case 'event':
          shouldUnlock = value > 0;
          break;
      }

      if (shouldUnlock) {
        newAchievements[playerIndex].achievements[achievementIndex].unlocked = true;
        newAchievements[playerIndex].achievements[achievementIndex].unlockedAt = new Date();
        newAchievements[playerIndex].achievements[achievementIndex].progress = condition.target;

        // Show toast notification
        toast({
          title: "🏆 Achievement Unlocked!",
          description: `${achievement.name}: ${achievement.description}`,
        });
      }
    });

    saveAchievements(newAchievements);
  }, [playerAchievements, saveAchievements, toast]);

  const updateGameStats = useCallback((playerId: string, statUpdates: Partial<GameStats>) => {
    const updated = playerAchievements.map(pa => {
      if (pa.playerId === playerId) {
        const newStats = { ...pa.stats, ...statUpdates };
        
        // Check relevant achievements
        Object.entries(statUpdates).forEach(([key, value]) => {
          if (typeof value === 'number') {
            checkAchievement(playerId, key, value);
          }
        });

        return { ...pa, stats: newStats };
      }
      return pa;
    });

    saveAchievements(updated);
  }, [playerAchievements, saveAchievements, checkAchievement]);

  const updateCurrentGameStat = useCallback((playerId: string, stat: string, value: number) => {
    setCurrentGameStats(prev => ({
      ...prev,
      [`${playerId}_${stat}`]: value
    }));

    // Check achievements that depend on current game stats
    checkAchievement(playerId, `${stat}InGame`, value);
  }, [checkAchievement]);

  const incrementCurrentGameStat = useCallback((playerId: string, stat: string, amount: number = 1) => {
    const currentKey = `${playerId}_${stat}`;
    const currentValue = currentGameStats[currentKey] || 0;
    const newValue = currentValue + amount;
    
    updateCurrentGameStat(playerId, stat, newValue);
  }, [currentGameStats, updateCurrentGameStat]);

  const recordGameEnd = useCallback((players: Player[], winnerId: string, rounds: number) => {
    players.forEach(player => {
      const stats: Partial<GameStats> = {
        gamesPlayed: (playerAchievements.find(pa => pa.playerId === player.id)?.stats.gamesPlayed || 0) + 1
      };

      if (player.id === winnerId) {
        stats.gamesWon = (playerAchievements.find(pa => pa.playerId === player.id)?.stats.gamesWon || 0) + 1;
        
        // Check for fastest win
        const currentFastest = playerAchievements.find(pa => pa.playerId === player.id)?.stats.fastestWin || 999;
        if (rounds < currentFastest || currentFastest === 0) {
          stats.fastestWin = rounds;
          checkAchievement(player.id, 'fastestWinRounds', rounds, { lessThan: true });
        }
      }

      // Update longest game
      const currentLongest = playerAchievements.find(pa => pa.playerId === player.id)?.stats.longestGame || 0;
      if (rounds > currentLongest) {
        stats.longestGame = rounds;
      }

      updateGameStats(player.id, stats);
    });

    // Reset current game stats
    setCurrentGameStats({});
  }, [playerAchievements, updateGameStats, checkAchievement]);

  const getPlayerAchievements = useCallback((playerId: string) => {
    return playerAchievements.find(pa => pa.playerId === playerId);
  }, [playerAchievements]);

  const getUnlockedAchievements = useCallback((playerId: string) => {
    const playerAch = getPlayerAchievements(playerId);
    return playerAch?.achievements.filter(a => a.unlocked) || [];
  }, [getPlayerAchievements]);

  const getAchievementProgress = useCallback((playerId: string) => {
    const playerAch = getPlayerAchievements(playerId);
    if (!playerAch) return { unlocked: 0, total: 0, percentage: 0 };

    const unlocked = playerAch.achievements.filter(a => a.unlocked).length;
    const total = playerAch.achievements.length;
    const percentage = Math.round((unlocked / total) * 100);

    return { unlocked, total, percentage };
  }, [getPlayerAchievements]);

  return {
    initializePlayerAchievements,
    updateGameStats,
    updateCurrentGameStat,
    incrementCurrentGameStat,
    recordGameEnd,
    getPlayerAchievements,
    getUnlockedAchievements,
    getAchievementProgress,
    checkAchievement,
    playerAchievements
  };
};