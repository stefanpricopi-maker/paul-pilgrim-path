import React from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Card } from '@/types/cards';
import { Card as UICard } from '@/components/ui/card';
import { Coins, Navigation, Users, Scroll } from 'lucide-react';

interface CardModalProps {
  isOpen: boolean;
  onClose: () => void;
  card: Card | null;
  cardType: 'community' | 'chance';
  language: 'en' | 'ro';
}

const CardModal = ({ isOpen, onClose, card, cardType, language }: CardModalProps) => {
  if (!card) return null;

  const getCardIcon = () => {
    switch (card.category) {
      case 'reward':
        return <Coins className="w-8 h-8 text-game-church" />;
      case 'movement':
        return <Navigation className="w-8 h-8 text-accent" />;
      case 'penalty':
        return <Coins className="w-8 h-8 text-destructive" />;
      default:
        return <Scroll className="w-8 h-8 text-primary" />;
    }
  };

  const getCardTitle = () => {
    return cardType === 'community' ? 'Community Chest' : 'Chance';
  };

  const getCardText = () => {
    return language === 'ro' ? card.text_ro : card.text_en;
  };

  const getCardColor = () => {
    return cardType === 'community' ? 'bg-blue-50 border-blue-200' : 'bg-orange-50 border-orange-200';
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-gradient-parchment border-2 border-primary/30 max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3 text-primary ancient-text text-xl">
            {cardType === 'community' ? <Users className="w-6 h-6" /> : <Scroll className="w-6 h-6" />}
            {getCardTitle()}
          </AlertDialogTitle>
        </AlertDialogHeader>
        
        <div className="my-6">
          <UICard className={`p-6 ${getCardColor()} border-2`}>
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                {getCardIcon()}
              </div>
              
              <AlertDialogDescription className="text-base text-foreground font-medium leading-relaxed">
                {getCardText()}
              </AlertDialogDescription>
              
              {card.action_type === 'add_money' && (
                <div className="bg-game-church/20 rounded-lg p-3 border border-game-church/30">
                  <p className="text-sm text-game-church font-semibold">
                    💰 Money Reward
                  </p>
                </div>
              )}
              
              {card.action_type.includes('go_to') && (
                <div className="bg-accent/20 rounded-lg p-3 border border-accent/30">
                  <p className="text-sm text-accent font-semibold">
                    🧭 Movement Card
                  </p>
                </div>
              )}
            </div>
          </UICard>
        </div>

        <AlertDialogFooter>
          <AlertDialogAction 
            onClick={onClose}
            className="w-full ancient-text bg-accent hover:bg-accent/90"
          >
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CardModal;