import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Coins, 
  Church, 
  Building2, 
  MapPin, 
  TrendingUp, 
  TrendingDown,
  Zap,
  CheckCircle,
  XCircle,
  AlertCircle,
  Dice6
} from 'lucide-react';

export interface ActionFeedbackData {
  type: 'success' | 'error' | 'info' | 'warning';
  action: 'buy_land' | 'build_church' | 'build_synagogue' | 'pay_rent' | 'roll_dice' | 'card_action' | 'end_turn';
  title: string;
  description: string;
  amount?: number;
  location?: string;
  player?: string;
  icon?: React.ReactNode;
}

interface ActionFeedbackProps {
  feedback: ActionFeedbackData | null;
  onComplete: () => void;
  speed?: number;
}

const ACTION_ICONS = {
  buy_land: <MapPin className="w-5 h-5" />,
  build_church: <Church className="w-5 h-5" />,
  build_synagogue: <Building2 className="w-5 h-5" />,
  pay_rent: <Coins className="w-5 h-5" />,
  roll_dice: <Dice6 className="w-5 h-5" />,
  card_action: <Zap className="w-5 h-5" />,
  end_turn: <CheckCircle className="w-5 h-5" />,
};

const TYPE_ICONS = {
  success: <CheckCircle className="w-4 h-4" />,
  error: <XCircle className="w-4 h-4" />,
  info: <AlertCircle className="w-4 h-4" />,
  warning: <AlertCircle className="w-4 h-4" />,
};

const TYPE_COLORS = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-green-950 dark:border-green-800 dark:text-green-200',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-950 dark:border-red-800 dark:text-red-200',
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-950 dark:border-blue-800 dark:text-blue-200',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800 dark:bg-yellow-950 dark:border-yellow-800 dark:text-yellow-200',
};

export default function ActionFeedback({ feedback, onComplete, speed = 1 }: ActionFeedbackProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [stage, setStage] = useState<'entering' | 'showing' | 'exiting'>('entering');

  useEffect(() => {
    if (!feedback) {
      setIsVisible(false);
      setStage('entering');
      return;
    }

    setIsVisible(true);
    const timeouts: NodeJS.Timeout[] = [];

    // Show feedback
    timeouts.push(setTimeout(() => {
      setStage('showing');
    }, 50 / speed));

    // Start exit
    timeouts.push(setTimeout(() => {
      setStage('exiting');
    }, (2000 / speed)));

    // Complete
    timeouts.push(setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, (2300 / speed)));

    return () => {
      timeouts.forEach(clearTimeout);
    };
  }, [feedback, onComplete, speed]);

  if (!isVisible || !feedback) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <Card 
        className={`p-4 border-2 shadow-lg transition-all duration-300 max-w-sm ${
          TYPE_COLORS[feedback.type]
        } ${
          stage === 'entering' ? 'transform translate-x-full opacity-0' : 
          stage === 'showing' ? 'transform translate-x-0 opacity-100' :
          'transform -translate-x-2 opacity-0 scale-95'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            {feedback.icon || ACTION_ICONS[feedback.action]}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-bold text-sm truncate">
                {feedback.title}
              </h4>
              {TYPE_ICONS[feedback.type]}
            </div>
            
            <p className="text-xs opacity-90 line-clamp-2">
              {feedback.description}
            </p>
            
            {feedback.amount !== undefined && (
              <div className="mt-2 flex items-center gap-1">
                {feedback.amount > 0 ? (
                  <TrendingUp className="w-3 h-3 text-green-600" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-red-600" />
                )}
                <span className="text-xs font-medium">
                  {feedback.amount > 0 ? '+' : ''}{feedback.amount} denarii
                </span>
              </div>
            )}
            
            {feedback.location && (
              <Badge variant="outline" className="mt-1 text-xs">
                {feedback.location}
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}