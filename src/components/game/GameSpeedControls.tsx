import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Zap, Turtle, Rabbit, Gauge, Settings } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export interface GameSpeed {
  diceSpeed: number; // 0.1x to 3x
  playerMoveSpeed: number; // 0.1x to 3x
  aiThinkingSpeed: number; // 0.1x to 5x
  cardDisplayTime: number; // 0.5x to 3x
  animationsEnabled: boolean;
}

interface GameSpeedControlsProps {
  speed: GameSpeed;
  onChange: (speed: GameSpeed) => void;
  className?: string;
}

const SPEED_PRESETS = {
  turtle: {
    diceSpeed: 0.3,
    playerMoveSpeed: 0.5,
    aiThinkingSpeed: 0.2,
    cardDisplayTime: 2,
    animationsEnabled: true,
  },
  normal: {
    diceSpeed: 1,
    playerMoveSpeed: 1,
    aiThinkingSpeed: 1,
    cardDisplayTime: 1,
    animationsEnabled: true,
  },
  fast: {
    diceSpeed: 2,
    playerMoveSpeed: 2,
    aiThinkingSpeed: 3,
    cardDisplayTime: 0.7,
    animationsEnabled: true,
  },
  lightning: {
    diceSpeed: 3,
    playerMoveSpeed: 3,
    aiThinkingSpeed: 5,
    cardDisplayTime: 0.5,
    animationsEnabled: false,
  },
} as const;

export default function GameSpeedControls({ speed, onChange, className }: GameSpeedControlsProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handlePresetChange = (preset: keyof typeof SPEED_PRESETS) => {
    onChange(SPEED_PRESETS[preset]);
  };

  const handleSpeedChange = (key: keyof GameSpeed, value: number | boolean) => {
    onChange({ ...speed, [key]: value });
  };

  const getCurrentPreset = (): keyof typeof SPEED_PRESETS | 'custom' => {
    for (const [presetName, presetValue] of Object.entries(SPEED_PRESETS)) {
      if (
        Math.abs(presetValue.diceSpeed - speed.diceSpeed) < 0.1 &&
        Math.abs(presetValue.playerMoveSpeed - speed.playerMoveSpeed) < 0.1 &&
        Math.abs(presetValue.aiThinkingSpeed - speed.aiThinkingSpeed) < 0.1 &&
        Math.abs(presetValue.cardDisplayTime - speed.cardDisplayTime) < 0.1 &&
        presetValue.animationsEnabled === speed.animationsEnabled
      ) {
        return presetName as keyof typeof SPEED_PRESETS;
      }
    }
    return 'custom';
  };

  const getSpeedMultiplier = (): string => {
    const avgSpeed = (speed.diceSpeed + speed.playerMoveSpeed + speed.aiThinkingSpeed + speed.cardDisplayTime) / 4;
    return `${avgSpeed.toFixed(1)}x`;
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          <Gauge className="w-4 h-4 mr-1" />
          Speed {getSpeedMultiplier()}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-medium">Game Speed</Label>
            <Badge variant="secondary">{getCurrentPreset()}</Badge>
          </div>

          {/* Quick Presets */}
          <div className="grid grid-cols-4 gap-2">
            <Button
              variant={getCurrentPreset() === 'turtle' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetChange('turtle')}
              className="flex flex-col p-2 h-auto"
            >
              <Turtle className="w-4 h-4 mb-1" />
              <span className="text-xs">Turtle</span>
            </Button>
            <Button
              variant={getCurrentPreset() === 'normal' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetChange('normal')}
              className="flex flex-col p-2 h-auto"
            >
              <Settings className="w-4 h-4 mb-1" />
              <span className="text-xs">Normal</span>
            </Button>
            <Button
              variant={getCurrentPreset() === 'fast' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetChange('fast')}
              className="flex flex-col p-2 h-auto"
            >
              <Rabbit className="w-4 h-4 mb-1" />
              <span className="text-xs">Fast</span>
            </Button>
            <Button
              variant={getCurrentPreset() === 'lightning' ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePresetChange('lightning')}
              className="flex flex-col p-2 h-auto"
            >
              <Zap className="w-4 h-4 mb-1" />
              <span className="text-xs">Lightning</span>
            </Button>
          </div>

          {/* Custom Speed Controls */}
          <div className="space-y-4 pt-2 border-t">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Dice Roll Speed</Label>
                <span className="text-xs text-muted-foreground">{speed.diceSpeed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[speed.diceSpeed]}
                onValueChange={([value]) => handleSpeedChange('diceSpeed', value)}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Player Movement</Label>
                <span className="text-xs text-muted-foreground">{speed.playerMoveSpeed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[speed.playerMoveSpeed]}
                onValueChange={([value]) => handleSpeedChange('playerMoveSpeed', value)}
                min={0.1}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">AI Thinking Speed</Label>
                <span className="text-xs text-muted-foreground">{speed.aiThinkingSpeed.toFixed(1)}x</span>
              </div>
              <Slider
                value={[speed.aiThinkingSpeed]}
                onValueChange={([value]) => handleSpeedChange('aiThinkingSpeed', value)}
                min={0.1}
                max={5}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Card Display Time</Label>
                <span className="text-xs text-muted-foreground">{speed.cardDisplayTime.toFixed(1)}x</span>
              </div>
              <Slider
                value={[speed.cardDisplayTime]}
                onValueChange={([value]) => handleSpeedChange('cardDisplayTime', value)}
                min={0.5}
                max={3}
                step={0.1}
                className="w-full"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label className="text-xs">Enable Animations</Label>
              <Button
                variant={speed.animationsEnabled ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleSpeedChange('animationsEnabled', !speed.animationsEnabled)}
              >
                {speed.animationsEnabled ? 'ON' : 'OFF'}
              </Button>
            </div>
          </div>

          <div className="text-xs text-muted-foreground pt-2 border-t">
            Adjust game speed to your preference. Lightning mode disables animations for fastest play.
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}