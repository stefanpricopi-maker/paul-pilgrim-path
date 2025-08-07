import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Settings, Target, Coins, Clock, Wrench } from 'lucide-react';

export interface GameSettings {
  winCondition: 'rounds' | 'bankruptcy' | 'churches';
  roundLimit: number;
  initialBalance: number;
  churchGoal: number;
  debugMode: boolean;
}

interface GameSettingsProps {
  settings: GameSettings;
  onSettingsChange: (settings: GameSettings) => void;
  onStartGame: () => void;
  canStart: boolean;
}

export default function GameSettingsComponent({ 
  settings, 
  onSettingsChange, 
  onStartGame,
  canStart 
}: GameSettingsProps) {
  const updateSetting = (key: keyof GameSettings, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value
    });
  };

  return (
    <Card className="bg-gradient-parchment border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 ancient-text">
          <Settings className="w-5 h-5" />
          Game Settings
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Win Condition */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold">
            <Target className="w-4 h-4" />
            Win Condition
          </Label>
          <Select 
            value={settings.winCondition} 
            onValueChange={(value: 'rounds' | 'bankruptcy' | 'churches') => 
              updateSetting('winCondition', value)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rounds">Round Limit</SelectItem>
              <SelectItem value="bankruptcy">Last Player Standing</SelectItem>
              <SelectItem value="churches">Church Building Goal</SelectItem>
            </SelectContent>
          </Select>
          
          {settings.winCondition === 'rounds' && (
            <div className="space-y-2">
              <Label htmlFor="roundLimit">Number of Rounds</Label>
              <Input
                id="roundLimit"
                type="number"
                min="1"
                max="50"
                value={settings.roundLimit}
                onChange={(e) => updateSetting('roundLimit', parseInt(e.target.value) || 10)}
              />
            </div>
          )}
          
          {settings.winCondition === 'churches' && (
            <div className="space-y-2">
              <Label htmlFor="churchGoal">Churches to Build</Label>
              <Input
                id="churchGoal"
                type="number"
                min="1"
                max="20"
                value={settings.churchGoal}
                onChange={(e) => updateSetting('churchGoal', parseInt(e.target.value) || 5)}
              />
            </div>
          )}
        </div>

        <Separator />

        {/* Initial Balance */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold">
            <Coins className="w-4 h-4" />
            Initial Balance
          </Label>
          <div className="space-y-2">
            <Input
              type="number"
              min="100"
              max="5000"
              step="50"
              value={settings.initialBalance}
              onChange={(e) => updateSetting('initialBalance', parseInt(e.target.value) || 1000)}
            />
            <p className="text-xs text-muted-foreground">
              Starting money for each player (denarii)
            </p>
          </div>
        </div>

        <Separator />

        {/* Debug Mode */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2 font-semibold">
            <Wrench className="w-4 h-4" />
            Debug Mode
          </Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={settings.debugMode}
              onCheckedChange={(checked) => updateSetting('debugMode', checked)}
            />
            <Label htmlFor="debug" className="text-sm">
              Enable manual dice control and extra game info
            </Label>
          </div>
        </div>

        <Separator />

        <Button 
          onClick={onStartGame}
          disabled={!canStart}
          className="w-full bg-accent hover:bg-accent/90"
        >
          <Clock className="w-4 h-4 mr-2" />
          Start Game with Settings
        </Button>
      </CardContent>
    </Card>
  );
}