import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, Users, Play } from 'lucide-react';

interface LocalGameSetupProps {
  onStartGame: (playerNames: string[], playerColors: string[], settings?: any) => void;
  onLoadGame?: () => boolean;
  hasExistingGame?: boolean;
}

const PLAYER_COLORS = [
  { name: 'Red', value: 'hsl(0, 70%, 50%)' },
  { name: 'Blue', value: 'hsl(220, 70%, 50%)' },
  { name: 'Green', value: 'hsl(120, 70%, 40%)' },
  { name: 'Yellow', value: 'hsl(45, 70%, 50%)' },
  { name: 'Purple', value: 'hsl(280, 70%, 50%)' },
  { name: 'Orange', value: 'hsl(30, 70%, 50%)' },
];

export default function LocalGameSetup({ onStartGame, onLoadGame, hasExistingGame }: LocalGameSetupProps) {
  const [players, setPlayers] = useState([
    { name: '', color: PLAYER_COLORS[0].value },
    { name: '', color: PLAYER_COLORS[1].value },
  ]);

  const addPlayer = () => {
    if (players.length < 6) {
      setPlayers([...players, { 
        name: '', 
        color: PLAYER_COLORS[players.length].value 
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

  const canStartGame = players.length >= 2 && players.every(p => p.name.trim().length > 0);
  const hasUniqueNames = new Set(players.map(p => p.name.trim().toLowerCase())).size === players.length;

  const handleStartGame = () => {
    if (canStartGame && hasUniqueNames) {
      const settings = {
        winCondition: 'bankruptcy', // Default win condition
        initialBalance: 1000,
        churchGoal: 5,
        roundLimit: null
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
    <div className="min-h-screen bg-background p-4 flex items-center justify-center">
      <Card className="w-full max-w-2xl bg-gradient-parchment border-2 border-accent/30">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary ancient-text">
            Local Game Setup
          </CardTitle>
          <p className="text-muted-foreground">
            Set up a local game for 2-6 players on this device
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
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
                <Card key={index} className="p-4 bg-card/50">
                  <div className="flex items-center space-x-3">
                    <div className="flex-1">
                      <Label htmlFor={`player-${index}`} className="text-sm font-medium">
                        Player {index + 1}
                      </Label>
                      <Input
                        id={`player-${index}`}
                        placeholder="Enter player name"
                        value={player.name}
                        onChange={(e) => updatePlayerName(index, e.target.value)}
                        className="mt-1"
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
        </CardContent>
      </Card>
    </div>
  );
}