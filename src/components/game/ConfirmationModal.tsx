import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { GameLocation } from '@/types/game';
import { Coins, Church, Building2, ShoppingCart } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  action: 'buy' | 'church' | 'synagogue' | 'pay';
  location: GameLocation;
  playerMoney: number;
}

const ConfirmationModal = ({
  isOpen,
  onConfirm,
  onCancel,
  action,
  location,
  playerMoney
}: ConfirmationModalProps) => {
  const getActionDetails = () => {
    switch (action) {
      case 'buy':
        return {
          title: 'Purchase Property',
          description: `Do you want to purchase ${location.name} for ${location.price} denarii?`,
          cost: location.price,
          icon: <ShoppingCart className="w-5 h-5" />,
          confirmText: 'Purchase'
        };
      case 'church':
        return {
          title: 'Build Church',
          description: `Do you want to build a church in ${location.name} for ${location.churchCost} denarii?`,
          cost: location.churchCost,
          icon: <Church className="w-5 h-5" />,
          confirmText: 'Build Church'
        };
      case 'synagogue':
        return {
          title: 'Build Synagogue',
          description: `Do you want to build a synagogue in ${location.name} for ${location.synagogueCost} denarii?`,
          cost: location.synagogueCost,
          icon: <Building2 className="w-5 h-5" />,
          confirmText: 'Build Synagogue'
        };
      case 'pay':
        return {
          title: 'Pay Rent',
          description: `You must pay ${location.rent} denarii rent for landing on ${location.name}`,
          cost: location.rent,
          icon: <Coins className="w-5 h-5" />,
          confirmText: 'Pay Rent'
        };
      default:
        return {
          title: 'Confirm Action',
          description: 'Are you sure?',
          cost: 0,
          icon: <Coins className="w-5 h-5" />,
          confirmText: 'Confirm'
        };
    }
  };

  const actionDetails = getActionDetails();
  const canAfford = playerMoney >= actionDetails.cost;

  return (
    <AlertDialog open={isOpen} onOpenChange={onCancel}>
      <AlertDialogContent className="bg-gradient-parchment border-2 border-primary/30">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-primary ancient-text">
            {actionDetails.icon}
            {actionDetails.title}
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>{actionDetails.description}</p>
            
            <div className="bg-card/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Cost:</span>
                <span className="font-bold text-accent">{actionDetails.cost} denarii</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Your Money:</span>
                <span className={`font-bold ${canAfford ? 'text-game-church' : 'text-destructive'}`}>
                  {playerMoney} denarii
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">After Action:</span>
                <span className={`font-bold ${playerMoney - actionDetails.cost >= 0 ? 'text-game-church' : 'text-destructive'}`}>
                  {playerMoney - actionDetails.cost} denarii
                </span>
              </div>
            </div>

            {!canAfford && (
              <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-2">
                <p className="text-destructive text-sm font-semibold">
                  Insufficient funds! You need {actionDetails.cost - playerMoney} more denarii.
                </p>
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="ancient-text">Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            disabled={!canAfford}
            className="ancient-text bg-accent hover:bg-accent/90"
          >
            {actionDetails.confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ConfirmationModal;