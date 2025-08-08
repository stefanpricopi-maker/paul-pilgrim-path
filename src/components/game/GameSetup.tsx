import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { BIBLICAL_CHARACTERS, BiblicalCharacter, Player } from '@/types/game';
import { Trash2, Plus } from 'lucide-react';

interface GameSetupProps {
  onStartGame: (players: Player[]) => void;
}

const GameSetup = ({ onStartGame }: GameSetupProps) => {
  const [players, setPlayers] = useState<Partial<Player>[]>([
    { name: '', character: BIBLICAL_CHARACTERS[0] },
    { name: '', character: BIBLICAL_CHARACTERS[1] }
  ]);

  const playerColors = [
    'hsl(var(--player-1))',
    'hsl(var(--player-2))',
    'hsl(var(--player-3))',
    'hsl(var(--player-4))',
    'hsl(var(--player-5))',
    'hsl(var(--player-6))'
  ];

  const addPlayer = () => {
    if (players.length < 6) {
      const usedCharacters = players.map(p => p.character?.name).filter(Boolean);
      const availableCharacter = BIBLICAL_CHARACTERS.find(
        char => !usedCharacters.includes(char.name)
      );
      
      setPlayers([...players, { 
        name: '', 
        character: availableCharacter || BIBLICAL_CHARACTERS[0] 
      }]);
    }
  };

  const removePlayer = (index: number) => {
    if (players.length > 2) {
      setPlayers(players.filter((_, i) => i !== index));
    }
  };

  const updatePlayer = (index: number, field: keyof Partial<Player>, value: any) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
  };

  const selectCharacter = (index: number, character: BiblicalCharacter) => {
    updatePlayer(index, 'character', character);
  };

  const isCharacterTaken = (character: BiblicalCharacter, currentIndex: number) => {
    return players.some((player, index) => 
      index !== currentIndex && player.character?.name === character.name
    );
  };

  const canStartGame = () => {
    return players.length >= 2 && 
           players.every(player => player.name?.trim() && player.character) &&
           new Set(players.map(p => p.character?.name)).size === players.length;
  };

  const handleStartGame = () => {
    if (canStartGame()) {
      const completePlayers: Player[] = players.map((player, index) => ({
        id: `player-${index + 1}`,
        name: player.name!.trim(),
        character: player.character!,
        position: 0,
        money: 500,
        properties: [],
        propertyVisits: {},
        hasRolled: false,
        color: playerColors[index],
        inJail: false,
        jailTurns: 0,
        hasGetOutOfJailCard: false,
        immunityUntil: 0,
        skipNextTurn: false,
        consecutiveDoubles: 0,
      }));
      
      onStartGame(completePlayers);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <Card className="w-full max-w-4xl p-8 bg-gradient-parchment shadow-ancient border-2 border-accent/30">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary ancient-text mb-4">
            Paul's Missionary Journeys
          </h1>
          <p className="text-lg text-muted-foreground">
            Gather your missionary team to spread the Gospel throughout the ancient world
          </p>
        </div>

        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-primary ancient-text mb-4">Choose Your Characters</h2>
            <p className="text-muted-foreground">
              Select 2-6 biblical characters for your missionary journey
            </p>
          </div>

          {/* Players Setup */}
          <div className="grid gap-6">
            {players.map((player, index) => (
              <Card key={index} className="p-6 border-2 border-border bg-card/50">
                <div className="space-y-4">
                  {/* Player Header */}
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-primary ancient-text">
                      Player {index + 1}
                    </h3>
                    {players.length > 2 && (
                      <Button
                        onClick={() => removePlayer(index)}
                        variant="destructive"
                        size="sm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>

                  {/* Player Name */}
                  <div className="space-y-2">
                    <Label htmlFor={`player-${index}-name`}>Player Name</Label>
                    <Input
                      id={`player-${index}-name`}
                      placeholder="Enter player name..."
                      value={player.name || ''}
                      onChange={(e) => updatePlayer(index, 'name', e.target.value)}
                      className="bg-background"
                    />
                  </div>

                  {/* Character Selection */}
                  <div className="space-y-3">
                    <Label>Choose Character</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {BIBLICAL_CHARACTERS.map((character) => {
                        const isSelected = player.character?.name === character.name;
                        const isTaken = isCharacterTaken(character, index);
                        
                        return (
                          <Card
                            key={character.name}
                            className={`p-4 cursor-pointer transition-all hover:scale-105 ${
                              isSelected 
                                ? 'ring-2 ring-accent bg-accent/20 border-accent' 
                                : isTaken 
                                  ? 'opacity-50 cursor-not-allowed bg-muted' 
                                  : 'hover:bg-accent/10 border-border'
                            }`}
                            onClick={() => !isTaken && selectCharacter(index, character)}
                          >
                            <div className="text-center space-y-2">
                              <div className="text-3xl">{character.avatar}</div>
                              <h4 className="font-bold text-sm ancient-text">{character.name}</h4>
                              <p className="text-xs text-muted-foreground">{character.description}</p>
                              <Badge variant="outline" className="text-xs">
                                {character.specialAbility}
                              </Badge>
                              {isTaken && (
                                <Badge variant="destructive" className="text-xs">
                                  Taken
                                </Badge>
                              )}
                            </div>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Add Player Button */}
          {players.length < 6 && (
            <div className="text-center">
              <Button onClick={addPlayer} variant="outline" size="lg">
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </div>
          )}

          {/* Start Game Button */}
          <div className="text-center pt-6">
            <Button
              onClick={handleStartGame}
              disabled={!canStartGame()}
              size="lg"
              className="px-12 py-3 text-lg font-bold ancient-text bg-primary hover:bg-primary/90"
            >
              Begin the Journey
            </Button>
            {!canStartGame() && (
              <p className="text-sm text-destructive mt-2">
                Please enter names for all players and ensure each has a unique character
              </p>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameSetup;