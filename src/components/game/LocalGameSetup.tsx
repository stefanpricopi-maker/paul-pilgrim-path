import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, Users, Play, Bot } from 'lucide-react';
import { AI_PERSONALITIES, AI_NAMES } from '@/types/ai';
import { useIsMobile } from '@/hooks/use-mobile';

interface LocalGameSetupProps {
  onStartGame: (playerNames: string[], playerColors: string[], settings?: any) => void;
  onLoadGame?: () => boolean;
  hasExistingGame?: boolean;
  onGoBack?: () => void;
}

interface PlayerSetup {
  name: string;
  color: string;
  isAI: boolean;
  aiPersonality?: number;
}

const PLAYER_COLORS = [
  { name: 'Red', value: 'hsl(0, 70%, 50%)' },
  { name: 'Blue', value: 'hsl(220, 70%, 50%)' },
  { name: 'Green', value: 'hsl(120, 70%, 40%)' },
  { name: 'Yellow', value: 'hsl(45, 70%, 50%)' },
  { name: 'Purple', value: 'hsl(280, 70%, 50%)' },
  { name: 'Orange', value: 'hsl(30, 70%, 50%)' },
];

export default function LocalGameSetup({ onStartGame, onLoadGame, hasExistingGame, onGoBack }: LocalGameSetupProps) {
  const isMobile = useIsMobile();
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: '', color: PLAYER_COLORS[0].value, isAI: false },
    { name: '', color: PLAYER_COLORS[1].value, isAI: false },
  ]);

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, { 
        name: '', 
        color: PLAYER_COLORS[players.length].value,
        isAI: false
      }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayerName = (index: number, name: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].name = name;
    setPlayers(updatedPlayers);
  };

  const updatePlayerColor = (index: number, color: string) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].color = color;
    setPlayers(updatedPlayers);
  };

  const togglePlayerAI = (index: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].isAI = !updatedPlayers[index].isAI;
    
    // Set default AI name if turning into AI
    if (updatedPlayers[index].isAI && !updatedPlayers[index].name) {
      const aiIndex = players.filter((p, i) => i < index && p.isAI).length;
      updatedPlayers[index].name = AI_NAMES[aiIndex % AI_NAMES.length];
      updatedPlayers[index].aiPersonality = 0; // Default to first personality
    }
    
    setPlayers(updatedPlayers);
  };

  const updateAIPersonality = (index: number, personalityIndex: number) => {
    const updatedPlayers = [...players];
    updatedPlayers[index].aiPersonality = personalityIndex;
    setPlayers(updatedPlayers);
  };

  const canStartGame = players.length >= 2 && players.every(p => p.name.trim().length > 0);
  const hasUniqueNames = new Set(players.map(p => p.name.trim().toLowerCase())).size === players.length;

  const handleStartGame = () => {
    if (canStartGame && hasUniqueNames) {
      const settings = {
        winCondition: 'bankruptcy', // Default win condition
        initialBalance: 1000,
        churchGoal: 5,
        roundLimit: null,
        players: players.map(p => ({
          name: p.name.trim(),
          color: p.color,
          isAI: p.isAI,
          aiPersonality: p.aiPersonality
        }))
      };
      
      onStartGame(
        players.map(p => p.name.trim()),
        players.map(p => p.color),
        settings
      );
    }
  };

  const handleLoadGame = () => {
    if (onLoadGame && hasExistingGame) {
      onLoadGame();
    }
  };

  return (
    <div className="min-h-screen bg-background p-2 md:p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-gradient-parchment border-2 border-accent/30">
        <CardHeader className="text-center p-4 md:p-6">
          <CardTitle className="text-xl md:text-3xl font-bold text-primary ancient-text">
            Local Game Setup
          </CardTitle>
          <p className="text-sm md:text-base text-muted-foreground">
            Set up a local game for 2-6 players on this device
          </p>
        </CardHeader>
        
        <CardContent className={`space-y-4 md:space-y-6 p-4 md:p-6`}>
          {isMobile ? (
            <ScrollArea className="h-[50vh]">
              <div className="space-y-4 pr-4">
                {onGoBack && (
                  <div>
                    <Button 
                      onClick={onGoBack}
                      variant="outline"
                      size="sm"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      ← Back to Game Mode
                    </Button>
                  </div>
                )}
                
                {hasExistingGame && (
                  <Card className="p-4 bg-accent/10 border border-accent/30">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-accent">Continue Previous Game</h3>
                        <p className="text-sm text-muted-foreground">
                          You have a saved game in progress
                        </p>
                      </div>
                      <Button onClick={handleLoadGame} variant="outline">
                        <Play className="w-4 h-4 mr-2" />
                        Load Game
                      </Button>
                    </div>
                  </Card>
                )}

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-primary">Players ({players.length}/6)</h3>
                    <Button 
                      onClick={addPlayer} 
                      disabled={players.length >= 6}
                      variant="outline"
                      size="sm"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add Player
                    </Button>
                  </div>

                  <div className="space-y-3">
                    {players.map((player, index) => (
                      <Card key={index} className={`p-3 ${player.isAI ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : 'bg-card/50'}`}>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label className="text-sm font-medium flex items-center gap-2">
                              {player.isAI && <Bot className="w-4 h-4" />}
                              Player {index + 1} {player.isAI && '(AI)'}
                            </Label>
                            <div className="flex items-center space-x-2">
                              <Label htmlFor={`ai-toggle-${index}`} className="text-xs">AI</Label>
                              <Switch
                                id={`ai-toggle-${index}`}
                                checked={player.isAI}
                                onCheckedChange={() => togglePlayerAI(index)}
                              />
                            </div>
                          </div>

                          <div className="flex flex-col space-y-3">
                            <div className="flex-1">
                              <Input
                                placeholder={player.isAI ? "AI Player Name" : "Enter player name"}
                                value={player.name}
                                onChange={(e) => updatePlayerName(index, e.target.value)}
                              />
                            </div>
                            
                            <div className="flex justify-between items-center">
                              <Label className="text-sm font-medium">Color</Label>
                              <div className="flex gap-2">
                                {PLAYER_COLORS.map((color) => (
                                  <button
                                    key={color.name}
                                    onClick={() => updatePlayerColor(index, color.value)}
                                    className={`w-8 h-8 rounded-full border-2 ${
                                      player.color === color.value ? 'border-primary' : 'border-muted'
                                    }`}
                                    style={{ backgroundColor: color.value }}
                                    title={color.name}
                                  />
                                ))}
                              </div>
                            </div>

                            {players.length > 2 && (
                              <Button
                                onClick={() => removePlayer(index)}
                                variant="outline"
                                size="sm"
                                className="text-destructive self-end"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>

                          {player.isAI && (
                            <div>
                              <Label className="text-sm font-medium">AI Personality</Label>
                              <Select 
                                value={player.aiPersonality?.toString() || "0"} 
                                onValueChange={(value) => updateAIPersonality(index, parseInt(value))}
                              >
                                <SelectTrigger className="mt-1">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {AI_PERSONALITIES.map((personality, pIndex) => (
                                    <SelectItem key={pIndex} value={pIndex.toString()}>
                                      <div>
                                        <div className="font-medium">{personality.name}</div>
                                        <div className="text-xs text-muted-foreground">{personality.description}</div>
                                      </div>
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>

                  {!hasUniqueNames && (
                    <div className="text-sm text-destructive">
                      All player names must be unique
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    onClick={handleStartGame}
                    disabled={!canStartGame || !hasUniqueNames}
                    className="w-full"
                    size="lg"
                  >
                    <Users className="w-4 h-4 mr-2" />
                    Start Local Game
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-2">
                    Game will be saved automatically. You can continue later.
                  </p>
                </div>
              </div>
            </ScrollArea>
          ) : (
            /* Desktop Layout */
            <div className="space-y-6">
              {onGoBack && (
                <div>
                  <Button 
                    onClick={onGoBack}
                    variant="outline"
                    size="sm"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    ← Back to Game Mode
                  </Button>
                </div>
              )}
              
              {hasExistingGame && (
                <Card className="p-4 bg-accent/10 border border-accent/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-bold text-accent">Continue Previous Game</h3>
                      <p className="text-sm text-muted-foreground">
                        You have a saved game in progress
                      </p>
                    </div>
                    <Button onClick={handleLoadGame} variant="outline">
                      <Play className="w-4 h-4 mr-2" />
                      Load Game
                    </Button>
                  </div>
                </Card>
              )}

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-bold text-primary">Players ({players.length}/6)</h3>
                  <Button 
                    onClick={addPlayer} 
                    disabled={players.length >= 6}
                    variant="outline"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Player
                  </Button>
                </div>

                <div className="space-y-3">
                  {players.map((player, index) => (
                    <Card key={index} className={`p-4 ${player.isAI ? 'bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800' : 'bg-card/50'}`}>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm font-medium flex items-center gap-2">
                            {player.isAI && <Bot className="w-4 h-4" />}
                            Player {index + 1} {player.isAI && '(AI)'}
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Label htmlFor={`ai-toggle-${index}`} className="text-xs">AI</Label>
                            <Switch
                              id={`ai-toggle-${index}`}
                              checked={player.isAI}
                              onCheckedChange={() => togglePlayerAI(index)}
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-3">
                          <div className="flex-1">
                            <Input
                              placeholder={player.isAI ? "AI Player Name" : "Enter player name"}
                              value={player.name}
                              onChange={(e) => updatePlayerName(index, e.target.value)}
                            />
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-sm font-medium">Color</Label>
                            <div className="flex flex-wrap gap-1">
                              {PLAYER_COLORS.map((color) => (
                                <button
                                  key={color.name}
                                  onClick={() => updatePlayerColor(index, color.value)}
                                  className={`w-6 h-6 rounded-full border-2 ${
                                    player.color === color.value ? 'border-primary' : 'border-muted'
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                />
                              ))}
                            </div>
                          </div>

                          {players.length > 2 && (
                            <Button
                              onClick={() => removePlayer(index)}
                              variant="outline"
                              size="sm"
                              className="text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>

                        {player.isAI && (
                          <div>
                            <Label className="text-sm font-medium">AI Personality</Label>
                            <Select 
                              value={player.aiPersonality?.toString() || "0"} 
                              onValueChange={(value) => updateAIPersonality(index, parseInt(value))}
                            >
                              <SelectTrigger className="mt-1">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {AI_PERSONALITIES.map((personality, pIndex) => (
                                  <SelectItem key={pIndex} value={pIndex.toString()}>
                                    <div>
                                      <div className="font-medium">{personality.name}</div>
                                      <div className="text-xs text-muted-foreground">{personality.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>

                {!hasUniqueNames && (
                  <div className="text-sm text-destructive">
                    All player names must be unique
                  </div>
                )}
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleStartGame}
                  disabled={!canStartGame || !hasUniqueNames}
                  className="w-full"
                  size="lg"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Start Local Game
                </Button>
                
                <p className="text-xs text-muted-foreground text-center mt-2">
                  Game will be saved automatically. You can continue later.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}