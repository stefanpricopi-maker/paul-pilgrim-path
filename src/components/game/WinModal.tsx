import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Trophy, Crown, Coins, Church } from 'lucide-react';
import { Player } from '@/types/game';

interface WinModalProps {
  isOpen: boolean;
  winner: Player;
  reason: string;
  onPlayAgain: () => void;
  onClose: () => void;
}

const WinModal = ({ isOpen, winner, reason, onPlayAgain, onClose }: WinModalProps) => {
  const getReasonIcon = (reason: string) => {
    if (reason.includes('churches')) return <Church className="w-8 h-8 text-game-church" />;
    if (reason.includes('richest')) return <Coins className="w-8 h-8 text-accent" />;
    if (reason.includes('standing')) return <Crown className="w-8 h-8 text-primary" />;
    return <Trophy className="w-8 h-8 text-accent" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gradient-parchment border-2 border-accent/50 max-w-md">
        <DialogHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center">
            <Trophy className="w-8 h-8 text-accent" />
          </div>
          <DialogTitle className="text-2xl font-bold text-primary ancient-text">
            🎉 Victory! 🎉
          </DialogTitle>
          <DialogDescription className="text-center space-y-3">
            <div className="flex items-center justify-center gap-3 p-4 bg-white/20 rounded-lg border border-accent/30">
              <div 
                className="w-8 h-8 rounded-full border-2 border-accent flex items-center justify-center text-lg"
                style={{ backgroundColor: winner.color }}
              >
                {winner.character.avatar}
              </div>
              <div className="text-left">
                <h3 className="font-bold text-primary">{winner.name}</h3>
                <p className="text-sm text-muted-foreground">{winner.character.name}</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center gap-2 text-muted-foreground">
              {getReasonIcon(reason)}
              <span className="font-medium">{reason}</span>
            </div>
            
            <div className="text-sm text-muted-foreground bg-primary/10 p-3 rounded-lg">
              Final Money: <span className="font-bold text-primary">{winner.money} denarii</span>
            </div>
          </DialogDescription>
        </DialogHeader>
        
        <DialogFooter className="flex flex-col gap-2 sm:flex-row">
          <Button onClick={onPlayAgain} className="flex-1">
            Play Again
          </Button>
          <Button onClick={onClose} variant="outline" className="flex-1">
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default WinModal;