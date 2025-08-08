import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Brain, Zap } from 'lucide-react';
import { AIPlayer } from '@/types/ai';

interface AIControllerProps {
  aiPlayer: AIPlayer;
  isThinking: boolean;
  lastDecision?: string;
}

export default function AIController({ aiPlayer, isThinking, lastDecision }: AIControllerProps) {
  const [thinkingDots, setThinkingDots] = useState('');

  useEffect(() => {
    if (isThinking) {
      const interval = setInterval(() => {
        setThinkingDots(prev => {
          if (prev.length >= 3) return '';
          return prev + '.';
        });
      }, 500);
      return () => clearInterval(interval);
    } else {
      setThinkingDots('');
    }
  }, [isThinking]);

  const { traits } = aiPlayer.aiPersonality;

  return (
    <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Bot className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">{aiPlayer.name}</h3>
          <Badge variant="secondary" className="text-xs">
            {aiPlayer.aiPersonality.name}
          </Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            {isThinking ? (
              <>
                <Brain className="w-4 h-4 text-blue-500 animate-pulse" />
                <span className="text-blue-700 dark:text-blue-300">
                  Thinking{thinkingDots}
                </span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-green-500" />
                <span className="text-green-700 dark:text-green-300">Ready</span>
              </>
            )}
          </div>

          {lastDecision && !isThinking && (
            <div className="text-xs text-muted-foreground bg-white/50 dark:bg-black/20 p-2 rounded">
              {lastDecision}
            </div>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
              <div className="text-muted-foreground">Aggression</div>
              <div className="font-medium">{Math.round(traits.aggression * 100)}%</div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
              <div className="text-muted-foreground">Building</div>
              <div className="font-medium">{Math.round(traits.building * 100)}%</div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
              <div className="text-muted-foreground">Risk Taking</div>
              <div className="font-medium">{Math.round(traits.riskTaking * 100)}%</div>
            </div>
            <div className="bg-white/50 dark:bg-black/20 p-2 rounded">
              <div className="text-muted-foreground">Trading</div>
              <div className="font-medium">{Math.round(traits.trading * 100)}%</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}