import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useGameDatabase } from '@/hooks/useGameDatabase';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import GameBoard from './GameBoard';
import WinModal from './WinModal';
import { toast } from 'sonner';
import { GAME_LOCATIONS } from '@/data/locations';

interface OnlineGameBoardProps {
  gameId: string;
}

export default function OnlineGameBoard({ gameId }: OnlineGameBoardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    gameState,
    loading,
    rollDice,
    endTurn,
    loadGame
  } = useGameDatabase();

  const [showWinModal, setShowWinModal] = useState(false);
  const [winner, setWinner] = useState<any>(null);
  const [winReason, setWinReason] = useState('');

  useEffect(() => {
    if (gameId && user) {
      loadGame(gameId);
    }
  }, [gameId, user, loadGame]);

  // Check for win condition
  useEffect(() => {
    if (gameState && gameState.players.length > 0) {
      // Simple win condition check - can be expanded based on game settings
      const richestPlayer = gameState.players.reduce((prev, current) => 
        (prev.coins > current.coins) ? prev : current
      );
      
      // Example win condition: first to 5000 coins
      if (richestPlayer.coins >= 5000 && !showWinModal) {
        setWinner(richestPlayer);
        setWinReason(`${richestPlayer.name} won by reaching 5000 coins!`);
        setShowWinModal(true);
      }
    }
  }, [gameState, showWinModal]);

  const handleLocationClick = (location: any) => {
    // Handle location click logic here
    console.log('Location clicked:', location);
  };

  const handlePlayAgain = () => {
    setShowWinModal(false);
    navigate('/');
  };

  const handleClose = () => {
    setShowWinModal(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⛪</div>
          <h1 className="text-xl font-bold text-primary mb-2">Loading game...</h1>
        </div>
      </div>
    );
  }

  if (!gameState || !gameState.game) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="p-6 text-center">
          <h1 className="text-xl font-bold text-destructive mb-4">Game not found</h1>
          <p className="text-muted-foreground mb-4">The game you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => navigate('/')}>Return to Menu</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-bold text-primary">Online Game</h1>
          <Button variant="outline" onClick={() => navigate('/')}>
            Leave Game
          </Button>
        </div>

        <GameBoard
          locations={GAME_LOCATIONS}
          players={gameState.players.map(p => ({
            id: p.id,
            name: p.name,
            position: p.position,
            money: p.coins,
            character: { name: p.character_name || 'Unknown', description: '', specialAbility: '', avatar: '' },
            properties: [],
            propertyVisits: {},
            color: '#3B82F6',
            inJail: p.in_jail,
            jailTurns: p.jail_turns,
            hasGetOutOfJailCard: p.has_get_out_of_jail_card,
            immunityUntil: p.immunity_until,
            skipNextTurn: p.skip_next_turn || false,
            consecutiveDoubles: p.consecutive_doubles || 0,
            hasRolled: false
          }))}
          onLocationClick={handleLocationClick}
          gameLog={gameState.gameLog.map(log => log.description || 'Game event')}
        />

        {showWinModal && winner && (
          <WinModal
            isOpen={showWinModal}
            winner={winner}
            reason={winReason}
            onPlayAgain={handlePlayAgain}
            onClose={handleClose}
          />
        )}
      </div>
    </div>
  );
}