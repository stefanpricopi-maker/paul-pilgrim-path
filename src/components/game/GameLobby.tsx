import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BIBLICAL_CHARACTERS } from '@/types/game';
import { GameState } from '@/types/database';
import { Users, Crown, Play, Copy, Loader2 } from 'lucide-react';

interface GameLobbyProps {
  gameState: GameState;
  loading: boolean;
  onCreateGame: (playerName: string, characterName: string) => Promise<string | null>;
  onJoinGame: (gameId: string, playerName: string, characterName: string) => Promise<boolean>;
  onStartGame: () => Promise<void>;
}

const GameLobby = ({ gameState, loading, onCreateGame, onJoinGame, onStartGame }: GameLobbyProps) => {
  const [activeTab, setActiveTab] = useState('create');
  const [playerName, setPlayerName] = useState('');
  const [selectedCharacter, setSelectedCharacter] = useState(BIBLICAL_CHARACTERS[0].name);
  const [gameIdToJoin, setGameIdToJoin] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);

  const handleCreateGame = async () => {
    if (!playerName.trim()) return;
    
    const newGameId = await onCreateGame(playerName.trim(), selectedCharacter);
    if (newGameId) {
      setGameId(newGameId);
    }
  };

  const handleJoinGame = async () => {
    if (!playerName.trim() || !gameIdToJoin.trim()) return;
    
    const success = await onJoinGame(gameIdToJoin.trim(), playerName.trim(), selectedCharacter);
    if (success) {
      setGameId(gameIdToJoin.trim());
    }
  };

  const copyGameId = () => {
    if (gameState.game?.id) {
      navigator.clipboard.writeText(gameState.game.id);
    }
  };

  const usedCharacters = gameState.players.map(p => p.character_name).filter(Boolean);
  const availableCharacters = BIBLICAL_CHARACTERS.filter(char => !usedCharacters.includes(char.name));

  // Show waiting room if game exists but not started
  if (gameState.game && !gameState.gameStarted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="w-full max-w-2xl p-8 bg-gradient-parchment shadow-ancient border-2 border-accent/30">
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">⛪</div>
            <h1 className="text-3xl font-bold text-primary ancient-text mb-2">
              Missionary Assembly
            </h1>
            <p className="text-muted-foreground">
              Gathering the faithful for Paul's journey
            </p>
          </div>

          <div className="space-y-6">
            {/* Game Info */}
            <Card className="p-4 bg-card/50">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-primary ancient-text flex items-center">
                  <Crown className="w-4 h-4 mr-2" />
                  Game Details
                </h3>
                <Badge variant={gameState.game.status === 'waiting' ? 'secondary' : 'default'}>
                  {gameState.game.status}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Game ID:</span>
                  <div className="flex items-center space-x-2">
                    <code className="text-xs bg-muted px-2 py-1 rounded">{gameState.game.id}</code>
                    <Button onClick={copyGameId} variant="outline" size="sm">
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Players:</span>
                  <span className="flex items-center">
                    <Users className="w-3 h-3 mr-1" />
                    {gameState.players.length}/6
                  </span>
                </div>
              </div>
            </Card>

            {/* Players List */}
            <Card className="p-4 bg-card/50">
              <h3 className="font-bold text-primary ancient-text mb-3">Assembled Missionaries</h3>
              <div className="space-y-2">
             
                {gameState.players.map((player, index) => (
                  <div key={player.id} className="flex items-center justify-between p-2 bg-background rounded">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {BIBLICAL_CHARACTERS.find(c => c.name === player.character_name)?.avatar || '👤'}
                      </div>
                      <div>
                        <p className="font-semibold">{player.name}</p>
                        <p className="text-xs text-muted-foreground">{player.character_name}</p>
                      </div>
                    </div>
                      {GameState.role === "host" && (
                      <Badge variant="outline" className="text-xs">
                        <Crown className="w-3 h-3 mr-1" />
                        Host
                      </Badge>
                    )}
                  </div>
                ))}          
              </div>
            </Card>

            {/* Start Game Button (Host Only) */}
            {gameState.isHost && (
              <Button 
                onClick={onStartGame}
                disabled={loading || gameState.players.length < 2}
                size="lg"
                className="w-full ancient-text"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Starting Journey...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Begin the Missionary Journey
                  </>
                )}
              </Button>
            )}

            {!gameState.isHost && (
              <p className="text-center text-muted-foreground text-sm">
                Waiting for the host to start the journey...
              </p>
            )}
          </div>
        </Card>
      </div>
    );
  }

  // Show create/join form if no game
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-2xl p-8 bg-gradient-parchment shadow-ancient border-2 border-accent/30">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4">✝️</div>
          <h1 className="text-3xl font-bold text-primary ancient-text mb-2">
            Paul's Missionary Journeys
          </h1>
          <p className="text-muted-foreground">
            Gather your team and spread the Gospel throughout the ancient world
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Game</TabsTrigger>
            <TabsTrigger value="join">Join Game</TabsTrigger>
          </TabsList>

          <TabsContent value="create" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="create-name">Your Name</Label>
                <Input
                  id="create-name"
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>

              <div>
                <Label>Choose Your Character</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {BIBLICAL_CHARACTERS.map((character) => (
                    <Card
                      key={character.name}
                      className={`p-3 cursor-pointer transition-all hover:scale-105 ${
                        selectedCharacter === character.name
                          ? 'ring-2 ring-accent bg-accent/20 border-accent'
                          : 'hover:bg-accent/10'
                      }`}
                      onClick={() => setSelectedCharacter(character.name)}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{character.avatar}</div>
                        <h4 className="font-bold text-sm">{character.name}</h4>
                        <p className="text-xs text-muted-foreground">{character.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {character.specialAbility}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleCreateGame}
                disabled={loading || !playerName.trim()}
                size="lg"
                className="w-full ancient-text"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Journey...
                  </>
                ) : (
                  'Create New Journey'
                )}
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="join" className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="join-id">Game ID</Label>
                <Input
                  id="join-id"
                  placeholder="Enter game ID..."
                  value={gameIdToJoin}
                  onChange={(e) => setGameIdToJoin(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="join-name">Your Name</Label>
                <Input
                  id="join-name"
                  placeholder="Enter your name..."
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                />
              </div>

              <div>
                <Label>Choose Your Character</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {availableCharacters.map((character) => (
                    <Card
                      key={character.name}
                      className={`p-3 cursor-pointer transition-all hover:scale-105 ${
                        selectedCharacter === character.name
                          ? 'ring-2 ring-accent bg-accent/20 border-accent'
                          : 'hover:bg-accent/10'
                      }`}
                      onClick={() => setSelectedCharacter(character.name)}
                    >
                      <div className="text-center space-y-2">
                        <div className="text-2xl">{character.avatar}</div>
                        <h4 className="font-bold text-sm">{character.name}</h4>
                        <p className="text-xs text-muted-foreground">{character.description}</p>
                        <Badge variant="outline" className="text-xs">
                          {character.specialAbility}
                        </Badge>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              <Button 
                onClick={handleJoinGame}
                disabled={loading || !playerName.trim() || !gameIdToJoin.trim()}
                size="lg"
                className="w-full ancient-text"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Joining Journey...
                  </>
                ) : (
                  'Join Journey'
                )}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default GameLobby;