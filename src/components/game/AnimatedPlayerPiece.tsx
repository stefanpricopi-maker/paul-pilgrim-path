import { useEffect, useState } from 'react';
import { Player } from '@/types/game';

interface AnimatedPlayerPieceProps {
  player: Player;
  isMoving: boolean;
  targetPosition: number;
  onAnimationComplete?: () => void;
}

const AnimatedPlayerPiece = ({ 
  player, 
  isMoving, 
  targetPosition, 
  onAnimationComplete 
}: AnimatedPlayerPieceProps) => {
  const [currentPosition, setCurrentPosition] = useState(player.position);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isMoving && targetPosition !== currentPosition) {
      setIsAnimating(true);
      
      // Animate step by step to target position
      const animateMovement = () => {
        const steps = Math.abs(targetPosition - currentPosition);
        let step = 0;
        
        const interval = setInterval(() => {
          if (step >= steps) {
            clearInterval(interval);
            setCurrentPosition(targetPosition);
            setIsAnimating(false);
            onAnimationComplete?.();
            return;
          }
          
          // Move one step at a time
          setCurrentPosition(prev => {
            const direction = targetPosition > currentPosition ? 1 : -1;
            return prev + direction;
          });
          step++;
        }, 300); // 300ms per step for smooth movement
      };
      
      // Start animation after a brief delay
      setTimeout(animateMovement, 100);
    }
  }, [isMoving, targetPosition, currentPosition, onAnimationComplete]);

  return (
    <div 
      className={`
        player-piece text-sm transform bg-white rounded-full w-5 h-5 
        flex items-center justify-center border-2 transition-all duration-300
        ${isAnimating ? 'scale-110 animate-pulse' : 'hover:scale-110'}
      `}
      style={{
        borderColor: player.color,
        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))',
        transform: isAnimating ? 'scale(1.1)' : undefined
      }}
    >


      
     {typeof player.character.avatar === 'string' && player.character.avatar.startsWith('/')
    ? (
        <img
          src={player.character.avatar}
          alt={player.character.name}
          className="w-full h-full object-cover"
        />
      )
    : (
        <span className="text-sm">{player.character.avatar}</span>
      )
  }
    
    
    
    
    </div>
  );
};

export default AnimatedPlayerPiece;