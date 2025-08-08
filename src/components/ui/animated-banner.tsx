import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Crown, Sparkles, Star, Trophy } from 'lucide-react';

interface AnimatedBannerProps {
  title: string;
  subtitle?: string;
  type?: 'victory' | 'turn' | 'action' | 'info';
  icon?: React.ReactNode;
  duration?: number;
  onClose?: () => void;
}

const AnimatedBanner = ({ 
  title, 
  subtitle, 
  type = 'info', 
  icon, 
  duration = 4000,
  onClose 
}: AnimatedBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldShow, setShouldShow] = useState(true);

  useEffect(() => {
    // Entrance animation
    const entranceTimer = setTimeout(() => setIsVisible(true), 100);
    
    // Auto-dismiss
    const dismissTimer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setShouldShow(false);
        onClose?.();
      }, 300);
    }, duration);

    return () => {
      clearTimeout(entranceTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration, onClose]);

  if (!shouldShow) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'victory':
        return 'card-royal border-accent/50 text-primary-foreground';
      case 'turn':
        return 'card-elevated border-primary/30 text-foreground';
      case 'action':
        return 'glass-light border-accent/20 text-foreground';
      default:
        return 'card-ancient border-muted/30 text-foreground';
    }
  };

  const getDefaultIcon = () => {
    switch (type) {
      case 'victory':
        return <Trophy className="w-6 h-6" />;
      case 'turn':
        return <Crown className="w-6 h-6" />;
      case 'action':
        return <Sparkles className="w-6 h-6" />;
      default:
        return <Star className="w-6 h-6" />;
    }
  };

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md px-4">
      <Card 
        className={`
          p-4 ${getTypeStyles()} 
          transition-all duration-300 ease-out transform
          ${isVisible ? 'translate-y-0 opacity-100 scale-100' : '-translate-y-8 opacity-0 scale-95'}
          shadow-deep backdrop-blur-ancient
        `}
      >
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            {icon || getDefaultIcon()}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-cinzel font-bold text-lg leading-tight">
              {title}
            </h3>
            {subtitle && (
              <p className="text-sm opacity-80 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {onClose && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => {
                setIsVisible(false);
                setTimeout(() => {
                  setShouldShow(false);
                  onClose();
                }, 300);
              }}
              className="flex-shrink-0 h-8 w-8 p-0"
            >
              ×
            </Button>
          )}
        </div>
        
        {/* Animated sparkles for victory */}
        {type === 'victory' && (
          <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-lg">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="absolute animate-ping"
                style={{
                  left: `${20 + (i * 10)}%`,
                  top: `${10 + ((i % 3) * 20)}%`,
                  animationDelay: `${i * 0.2}s`,
                  animationDuration: '2s'
                }}
              >
                <Sparkles className="w-3 h-3 text-accent opacity-60" />
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default AnimatedBanner;