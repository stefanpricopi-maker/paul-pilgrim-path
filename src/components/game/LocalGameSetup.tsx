import { useState, useEffect } from 'react';
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
import { BiblicalCharacter } from '@/types/game';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';

interface LocalGameSetupProps {
  onStartGame: (playerNames: string[], playerColors: string[], settings?: any) => void;
  onLoadGame?: () => boolean;
  hasExistingGame?: boolean;
  onGoBack?: () => void;
}

interface PlayerSetup {
  name: string;
  color: string;
  character?: BiblicalCharacter;
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
  const [characters, setCharacters] = useState<BiblicalCharacter[]>([]);
  const [players, setPlayers] = useState<PlayerSetup[]>([
    { name: '', color: PLAYER_COLORS[0].value, character: undefined, isAI: false },
    { name: '', color: PLAYER_COLORS[1].value, character: undefined, isAI: false },
  ]);

  useEffect(() => {
    const fetchCharacters = async () => {
      const { data, error } = await supabase
        .from('characters')
        .select('*');
      
      if (error) {
        console.error('Error fetching characters:', error);
        return;
      }

      // Convert database characters to BiblicalCharacter format
      const convertedCharacters: BiblicalCharacter[] = data.map(char => ({
        name: char.name,
        description: char.description_en || '',
        specialAbility: char.ability_type || '',
        avatar: char.full_image_url || '',
        avatar_face: char.face_image_url || ''
      }));

      setCharacters(convertedCharacters);
    };

    fetchCharacters();
  }, []);

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, { 
        name: '', 
        color: PLAYER_COLORS[players.length].value,
        character: undefined, // Start without character
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

  const selectCharacter = (playerIndex: number, character: BiblicalCharacter) => {
    const updatedPlayers = [...players];
    updatedPlayers[playerIndex].character = character;
    setPlayers(updatedPlayers);
  };

  const isCharacterTaken = (character: BiblicalCharacter, currentPlayerIndex: number) => {
    return players.some((player, index) => 
      index !== currentPlayerIndex && player.character?.name === character.name
    );
  };

  const getCharacterOwner = (character: BiblicalCharacter) => {
    const playerIndex = players.findIndex(player => player.character?.name === character.name);
    return playerIndex >= 0 ? playerIndex : null;
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
          character: p.character,
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

                             {/* Selected Character Display */}
                             {player.character && (
                               <div className="flex items-center gap-3 p-2 bg-accent/10 rounded-md">
                                 <div className="text-lg">
                                   {player.character.avatar_face?.startsWith('/') ? (
                                     <img 
                                       src={player.character.avatar_face} 
                                       alt={player.character.name}
                                       className="w-8 h-8 rounded-full object-cover"
                                     />
                                   ) : (
                                     <span>{player.character.avatar_face}</span>
                                   )}
                                 </div>
                                 <div className="flex-1">
                                   <p className="font-medium text-sm">{player.character.name}</p>
                                   <p className="text-xs text-muted-foreground">{player.character.description}</p>
                                 </div>
                               </div>
                             )}

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

                {/* Character Selection Section */}
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-primary">Choose Characters</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {characters.map((character) => {
                      const ownerIndex = getCharacterOwner(character);
                      const isSelected = ownerIndex !== null;
                      
                      return (
                        <Card
                          key={character.name}
                          className={`p-3 cursor-pointer transition-all hover:scale-105 ${
                            isSelected 
                              ? `ring-2 border-accent` 
                              : 'hover:bg-accent/10 border-border'
                          }`}
                          style={isSelected ? { borderColor: players[ownerIndex].color, backgroundColor: `${players[ownerIndex].color}15` } : {}}
                        onClick={() => {
                          if (isSelected) {
                            // If character is already selected, unselect it
                            const updatedPlayers = [...players];
                            updatedPlayers[ownerIndex].character = undefined;
                            setPlayers(updatedPlayers);
                          } else {
                            // Find first player without character
                            const availablePlayerIndex = players.findIndex(p => !p.character);
                            if (availablePlayerIndex >= 0) {
                              selectCharacter(availablePlayerIndex, character);
                            }
                          }
                        }}
                        >
                          <div className="text-center space-y-2">
                            <div className="text-2xl">
                              {character.avatar_face?.startsWith('/') ? (
                                <img 
                                  src={character.avatar_face} 
                                  alt={character.name}
                                  className="w-12 h-12 mx-auto rounded-full object-cover"
                                />
                              ) : (
                                <span>{character.avatar_face}</span>
                              )}
                            </div>
                            <div>
                              <h4 className="font-bold text-sm ancient-text">{character.name}</h4>
                              <p className="text-xs text-muted-foreground line-clamp-2">{character.description}</p>
                              <Badge variant="outline" className="text-xs mt-1">
                                {character.specialAbility}
                              </Badge>
                              {isSelected && (
                                <div className="flex items-center justify-center gap-1 mt-2">
                                  <div 
                                    className="w-3 h-3 rounded-full" 
                                    style={{ backgroundColor: players[ownerIndex].color }}
                                  />
                                  <span className="text-xs font-medium">Player {ownerIndex + 1}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Click on any character to assign it to the next available player. Click on a selected character to unselect it.
                  </p>
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

                          {/* Selected Character Display - Desktop */}
                          {player.character && (
                            <div className="flex items-center gap-3 p-3 bg-accent/10 rounded-md">
                              <div className="text-xl">
                                {player.character.avatar_face?.startsWith('/') ? (
                                  <img 
                                    src={player.character.avatar_face} 
                                    alt={player.character.name}
                                    className="w-10 h-10 rounded-full object-cover"
                                  />
                                ) : (
                                  <span>{player.character.avatar_face}</span>
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{player.character.name}</p>
                                <p className="text-sm text-muted-foreground">{player.character.description}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {player.character.specialAbility}
                                </Badge>
                              </div>
                            </div>
                          )}

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

              {/* Character Selection Section - Desktop */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-primary">Choose Characters</h3>
                <div className="grid grid-cols-3 gap-4">
                  {characters.map((character) => {
                    const ownerIndex = getCharacterOwner(character);
                    const isSelected = ownerIndex !== null;
                    
                    return (
                      <Card
                        key={character.name}
                        className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                          isSelected 
                            ? `ring-2 border-accent` 
                            : 'hover:bg-accent/10 border-border'
                        }`}
                        style={isSelected ? { borderColor: players[ownerIndex].color, backgroundColor: `${players[ownerIndex].color}15` } : {}}
                        onClick={() => {
                          if (isSelected) {
                            // If character is already selected, unselect it
                            const updatedPlayers = [...players];
                            updatedPlayers[ownerIndex].character = undefined;
                            setPlayers(updatedPlayers);
                          } else {
                            // Find first player without character
                            const availablePlayerIndex = players.findIndex(p => !p.character);
                            if (availablePlayerIndex >= 0) {
                              selectCharacter(availablePlayerIndex, character);
                            }
                          }
                        }}
                      >
                        <div className="text-center space-y-3">
                          <div className="text-3xl">
                            {character.avatar_face?.startsWith('/') ? (
                              <img 
                                src={character.avatar_face} 
                                alt={character.name}
                                className="w-16 h-16 mx-auto rounded-full object-cover"
                              />
                            ) : (
                              <span>{character.avatar_face}</span>
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-lg ancient-text">{character.name}</h4>
                            <p className="text-sm text-muted-foreground line-clamp-2">{character.description}</p>
                            <Badge variant="outline" className="text-sm mt-2">
                              {character.specialAbility}
                            </Badge>
                            {isSelected && (
                              <div className="flex items-center justify-center gap-2 mt-3">
                                <div 
                                  className="w-4 h-4 rounded-full" 
                                  style={{ backgroundColor: players[ownerIndex].color }}
                                />
                                <span className="text-sm font-medium">Player {ownerIndex + 1}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground">
                  Click on any character to assign it to the next available player. Click on a selected character to unselect it.
                </p>
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