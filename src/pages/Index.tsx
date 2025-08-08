import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LanguageSelector } from '@/components/ui/language-selector';
import GameLobby from '@/components/game/GameLobby';
import GameBoard from '@/components/game/GameBoard';
import PlayerCard from '@/components/game/PlayerCard';
import Dice from '@/components/game/Dice';
import GameModeSelector from '@/components/game/GameModeSelector';
import LocalGameSetup from '@/components/game/LocalGameSetup';
import LocalGameBoard from '@/components/game/LocalGameBoard';
import WinModal from '@/components/game/WinModal';
import { useGameDatabase } from '@/hooks/useGameDatabase';
import { useLocalGame } from '@/hooks/useLocalGame';
import { useAuth } from '@/hooks/useAuth';
import { GameLocation } from '@/types/game';
import { BIBLICAL_CHARACTERS } from '@/types/game';
import { Church, Building2, Coins, MapPin, LogOut, User } from 'lucide-react';

const Index = () => {
  const { t } = useTranslation();
  const [gameMode, setGameMode] = useState<'online' | 'local' | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<GameLocation | null>(null);
  const [gameSettings, setGameSettings] = useState<any>(null);
  const [winner, setWinner] = useState<{ player: any; reason: string } | null>(null);

  // Online game state
  const { 
    gameState: onlineGameState,
    loading,
    createGame,
    joinGame,
    startGame,
    rollDice: onlineRollDice,
    endTurn: onlineEndTurn
  } = useGameDatabase();
  
  // Local game state
  const {
    gameState: localGameState,
    currentPlayerPrivate,
    createLocalGame,
    loadLocalGame,
    rollDice: localRollDice,
    endTurn: localEndTurn,
    resetGame,
    showCurrentPlayer,
    hideCurrentPlayer,
    buyLand,
    buildChurch,
    buildSynagogue,
    payRent,
    handleCardAction,
    checkWinCondition,
  } = useLocalGame();
  
  const { user, signOut } = useAuth();

  // Check if we have a saved local game
  const hasExistingLocalGame = localStorage.getItem('localGameState') !== null;

  // Check for win condition after each turn
  useEffect(() => {
    if (localGameState.gameStarted && localGameState.players.length > 1) {
      const winResult = checkWinCondition(localGameState, gameSettings);
      if (winResult.hasWinner && winResult.winner) {
        setWinner({ player: winResult.winner, reason: winResult.reason || 'Game completed' });
      }
    }
  }, [localGameState, gameSettings, checkWinCondition]);

  // Show game mode selector if no mode selected
  if (!gameMode) {
    return <GameModeSelector onSelectMode={setGameMode} />;
  }

  // Local game flow
  if (gameMode === 'local') {
    if (!localGameState.gameStarted) {
      return (
        <LocalGameSetup
          onStartGame={(playerNames, colors, settings) => {
            setGameSettings(settings);
            createLocalGame(playerNames, colors, settings);
          }}
          onLoadGame={loadLocalGame}
          hasExistingGame={hasExistingLocalGame}
        />
      );
    }

    return (
      <>
        <LocalGameBoard
          gameState={localGameState}
          currentPlayerPrivate={currentPlayerPrivate}
          onRollDice={localRollDice}
          onEndTurn={localEndTurn}
          onResetGame={() => {
            resetGame();
            setWinner(null);
            setGameSettings(null);
          }}
          onShowCurrentPlayer={showCurrentPlayer}
          onHideCurrentPlayer={hideCurrentPlayer}
          onBuyLand={buyLand}
          onBuildChurch={buildChurch}
          onBuildSynagogue={buildSynagogue}
          onPayRent={payRent}
          onCardAction={handleCardAction}
        />
        
        {winner && (
          <WinModal
            isOpen={true}
            winner={winner.player}
            reason={winner.reason}
            onPlayAgain={() => {
              resetGame();
              setWinner(null);
              setGameSettings(null);
              setGameMode(null);
            }}
            onClose={() => {
              setWinner(null);
            }}
          />
        )}
      </>
    );
  }

  // Online game flow
  if (!onlineGameState.game || !onlineGameState.gameStarted) {
    return (
      <GameLobby
        gameState={onlineGameState}
        loading={loading}
        onCreateGame={createGame}
        onJoinGame={joinGame}
        onStartGame={startGame}
      />
    );
  }

  const currentPlayer = onlineGameState.players[onlineGameState.currentPlayerIndex];
  const currentTile = onlineGameState.tiles[currentPlayer?.position] || null;
  
  // Convert database player to game player format for compatibility
  const gamePlayersForDisplay = onlineGameState.players.map(player => ({
    id: player.id,
    name: player.name,
    character: BIBLICAL_CHARACTERS.find(c => c.name === player.character_name) || BIBLICAL_CHARACTERS[0],
    position: player.position,
    money: player.coins,
    properties: [], // TODO: Load from tiles ownership
    color: `hsl(var(--player-${(onlineGameState.players.indexOf(player) % 6) + 1}))`,
    inJail: player.in_jail,
    jailTurns: player.jail_turns,
    hasGetOutOfJailCard: player.has_get_out_of_jail_card,
    immunityUntil: player.immunity_until,
    skipNextTurn: false, // TODO: Add to database
    consecutiveDoubles: 0, // TODO: Add to database
  }));

  // Convert tiles to locations format for compatibility
  const gameLocationsForDisplay: GameLocation[] = onlineGameState.tiles.map(tile => ({
    id: tile.id.toString(),
    name: tile.name,
    type: (tile.type as any) || 'city',
    journey: 1,
    price: 100, // TODO: Load from buildings table
    rent: 50,
    churchCost: 200,
    synagogueCost: 300,
    owner: tile.owner_id || undefined,
    buildings: {
      churches: 0, // TODO: Load from separate buildings relationship
      synagogues: 0
    },
    description: `Visit ${tile.name}`,
    color: tile.type === 'city' ? '#8B4513' : '#4A90E2'
  }));

  const canBuyLand = false; // TODO: Implement land buying logic
  const canBuildOnCurrentLocation = false; // TODO: Implement building logic

  const handleLocationClick = (location: GameLocation) => {
    setSelectedLocation(location);
  };

  const handleBuyLand = () => {
    // TODO: Implement Supabase land buying
  };

  const handleBuildChurch = () => {
    // TODO: Implement Supabase church building
  };

  const handleBuildSynagogue = () => {
    // TODO: Implement Supabase synagogue building
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Game Header */}
        <Card className="p-6 bg-gradient-parchment border-2 border-accent/30">
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <h1 className="text-3xl font-bold text-primary ancient-text mb-2">
                {t('game.title')}
              </h1>
              {currentPlayer && (
                 <p className="text-muted-foreground">
                   Current Player: <span className="font-bold text-accent">{currentPlayer.name}</span> 
                   ({currentPlayer.character_name})
                   {onlineGameState.isMyTurn && <span className="ml-2 text-green-600">(Your Turn)</span>}
                 </p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <LanguageSelector />
              <div className="flex items-center text-sm text-muted-foreground">
                <User className="w-4 h-4 mr-1" />
                {user?.email}
              </div>
              <Button onClick={signOut} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-1" />
                {t('auth.signOut')}
              </Button>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Game Board - Large Center Area */}
          <div className="lg:col-span-3">
            <GameBoard 
              locations={gameLocationsForDisplay}
              players={gamePlayersForDisplay}
              onLocationClick={handleLocationClick}
            />
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            
            {/* Dice */}
            <Dice 
              value={onlineGameState.diceValue}
              isRolling={onlineGameState.isRolling}
              onRoll={onlineGameState.isMyTurn ? onlineRollDice : () => {}}
            />

            {/* Current Location Info */}
            <Card className="p-4 bg-gradient-parchment border-2 border-primary/30">
              <h3 className="font-bold text-primary ancient-text mb-3 flex items-center">
                <MapPin className="w-4 h-4 mr-2" />
                Current Location
              </h3>
              <div className="space-y-3">
                {currentTile ? (
                  <div>
                    <h4 className="font-bold text-accent">{currentTile.name}</h4>
                    <p className="text-xs text-muted-foreground">Current location on the board</p>
                  </div>
                ) : (
                  <div>
                    <h4 className="font-bold text-accent">Unknown Location</h4>
                    <p className="text-xs text-muted-foreground">Position data not available</p>
                  </div>
                )}
                
                 {currentTile?.owner_id && (
                   <div className="text-xs text-muted-foreground">
                     Owned by: {onlineGameState.players.find(p => p.id === currentTile.owner_id)?.name}
                   </div>
                 )}
                
                 {/* Action Buttons */}
                <div className="space-y-2">
                  {canBuyLand && (
                    <Button 
                      onClick={handleBuyLand}
                      className="w-full text-sm"
                      variant="default"
                      disabled
                    >
                      <Coins className="w-3 h-3 mr-1" />
                      Buy Land (Coming Soon)
                    </Button>
                  )}
                  
                  {canBuildOnCurrentLocation && (
                    <>
                      <Button 
                        onClick={handleBuildChurch}
                        className="w-full text-sm"
                        variant="outline"
                        disabled
                      >
                        <Church className="w-3 h-3 mr-1" />
                        Build Church (Coming Soon)
                      </Button>
                      <Button 
                        onClick={handleBuildSynagogue}
                        className="w-full text-sm"
                        variant="outline"
                        disabled
                      >
                        <Building2 className="w-3 h-3 mr-1" />
                        Build Synagogue (Coming Soon)
                      </Button>
                    </>
                  )}
                  
                   {onlineGameState.diceValue > 0 && onlineGameState.isMyTurn && (
                     <Button 
                       onClick={onlineEndTurn}
                       className="w-full"
                       variant="secondary"
                     >
                       End Turn
                     </Button>
                   )}
                </div>
              </div>
            </Card>

            {/* Game Log */}
            <Card className="p-4 bg-gradient-parchment border-2 border-muted/30">
              <h3 className="font-bold text-primary ancient-text mb-3">Journey Log</h3>
              <ScrollArea className="h-32">
                 <div className="space-y-1">
                   {onlineGameState.gameLog.map((entry, index) => (
                     <p key={index} className="text-xs text-muted-foreground">
                       {entry.description}
                     </p>
                   ))}
                 </div>
              </ScrollArea>
            </Card>
          </div>
        </div>

        {/* Players Panel - Bottom */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {gamePlayersForDisplay.map((player, index) => (
            <PlayerCard
              key={player.id}
              player={player}
              isCurrentPlayer={index === onlineGameState.currentPlayerIndex}
              onBuildChurch={handleBuildChurch}
              onBuildSynagogue={handleBuildSynagogue}
              canBuild={canBuildOnCurrentLocation && index === onlineGameState.currentPlayerIndex}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
