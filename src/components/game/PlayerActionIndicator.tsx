import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Player } from '@/types/game';
import { AIPlayer } from '@/types/ai';
import { 
  Loader2, 
  Dice6, 
  Brain, 
  Clock, 
  User,
  Bot,
  Eye,
  EyeOff
} from 'lucide-react';

interface PlayerActionIndicatorProps {
  player: Player | AIPlayer;
  action: 'rolling' | 'thinking' | 'deciding' | 'waiting' | 'moving' | null;
  isCurrentPlayer: boolean;
  className?: string;
  showPrivateMode?: boolean;
  onTogglePrivateMode?: () => void;
}

const ACTION_CONFIG = {
  rolling: {
    icon: <Dice6 className="w-3 h-3" />,
    label: 'Rolling dice...',
    color: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-800',
    animate: true,
  },
  thinking: {
    icon: <Brain className="w-3 h-3" />,
    label: 'Thinking...',
    color: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-800',
    animate: true,
  },
  deciding: {
    icon: <Clock className="w-3 h-3" />,
    label: 'Deciding...',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-200 dark:border-yellow-800',
    animate: true,
  },
  waiting: {
    icon: <Clock className="w-3 h-3" />,
    label: 'Waiting...',
    color: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
    animate: false,
  },
  moving: {
    icon: <Loader2 className="w-3 h-3" />,
    label: 'Moving...',
    color: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-800',
    animate: true,
  },
};

const isAI = (player: Player | AIPlayer): player is AIPlayer => {
  return 'aiPersonality' in player;
};

export default function PlayerActionIndicator({ 
  player, 
  action, 
  isCurrentPlayer,
  className = '',
  showPrivateMode = false,
  onTogglePrivateMode 
}: PlayerActionIndicatorProps) {
  const [pulseCount, setPulseCount] = useState(0);

  // Animate thinking dots for AI
  useEffect(() => {
    if (action && ACTION_CONFIG[action].animate) {
      const interval = setInterval(() => {
        setPulseCount(count => (count + 1) % 4);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [action]);

  if (!action && !isCurrentPlayer) return null;

  const config = action ? ACTION_CONFIG[action] : null;
  const showCurrentPlayerBadge = isCurrentPlayer && !action;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Current Player Indicator */}
      {showCurrentPlayerBadge && (
        <Badge variant="default" className="flex items-center gap-1 px-2 py-1">
          <div className="w-2 h-2 bg-current rounded-full animate-pulse" />
          <span className="text-xs">Your Turn</span>
        </Badge>
      )}

      {/* Action Status */}
      {config && (
        <Badge 
          variant="outline" 
          className={`flex items-center gap-1 px-2 py-1 ${config.color}`}
        >
          <div className={config.animate ? 'animate-spin' : ''}>
            {config.icon}
          </div>
          <span className="text-xs">
            {config.label}
            {config.animate && '.'.repeat(pulseCount)}
          </span>
        </Badge>
      )}

      {/* AI Indicator */}
      {isAI(player) && !action && (
        <Badge variant="secondary" className="flex items-center gap-1 px-2 py-1">
          <Bot className="w-3 h-3" />
          <span className="text-xs">AI</span>
        </Badge>
      )}

      {/* Private Mode Toggle (for human players only) */}
      {isCurrentPlayer && !isAI(player) && onTogglePrivateMode && (
        <Badge 
          variant="outline" 
          className="flex items-center gap-1 px-2 py-1 cursor-pointer hover:bg-accent/50 transition-colors"
          onClick={onTogglePrivateMode}
        >
          {showPrivateMode ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          <span className="text-xs">
            {showPrivateMode ? 'Hidden' : 'Visible'}
          </span>
        </Badge>
      )}
    </div>
  );
}