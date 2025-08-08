import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DiceProps } from '@/types/game';
const Dice = ({
  dice1,
  dice2,
  isRolling,
  onRoll
}: DiceProps) => {
  const [animationKey, setAnimationKey] = useState(0);
  const handleRoll = () => {
    setAnimationKey(prev => prev + 1);
    onRoll();
  };
  const getDiceDisplay = (num: number) => {
    const dots = Array.from({
      length: num
    }, (_, i) => <div key={i} className="w-3 h-3 bg-primary rounded-full" />);
    const layouts: Record<number, string> = {
      1: 'justify-center items-center',
      2: 'justify-between items-center flex-col',
      3: 'justify-between items-center',
      4: 'justify-between items-center flex-wrap',
      5: 'justify-between items-center flex-wrap',
      6: 'justify-between items-center flex-wrap'
    };
    return <div className={`flex h-full w-full p-2 ${layouts[num] || 'justify-center items-center'}`}>
        {num === 4 ? <>
            <div className="flex justify-between w-full">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
            <div className="flex justify-between w-full">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
          </> : num === 5 ? <>
            <div className="flex justify-between w-full">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
            <div className="flex justify-center w-full">
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
            <div className="flex justify-between w-full">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
          </> : num === 6 ? <>
            <div className="flex justify-between w-full">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
            <div className="flex justify-between w-full">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
            <div className="flex justify-between w-full">
              <div className="w-3 h-3 bg-primary rounded-full" />
              <div className="w-3 h-3 bg-primary rounded-full" />
            </div>
          </> : dots}
      </div>;
  };
  return <Card className="p-6 card-elevated border-2 border-accent/20 scale-in">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-bold ancient-text text-primary">Dice</h3>
        
        <div className="flex justify-center gap-2">
          <Card key={`${animationKey}-1`} className={`dice-container w-16 h-16 border-2 border-primary shadow-elevated ${isRolling ? 'dice-roll' : ''}`}>
            {dice1 > 0 && getDiceDisplay(dice1)}
          </Card>
          <Card key={`${animationKey}-2`} className={`dice-container w-16 h-16 border-2 border-primary shadow-elevated ${isRolling ? 'dice-roll' : ''}`}>
            {dice2 > 0 && getDiceDisplay(dice2)}
          </Card>
        </div>
        
        {(dice1 > 0 && dice2 > 0) && (
          <div className="text-center">
            <p className="text-lg font-bold text-accent ancient-text">
              {dice1} + {dice2} = {dice1 + dice2}
            </p>
            {dice1 === dice2 && (
              <p className="text-sm text-primary font-bold">Doubles!</p>
            )}
          </div>
        )}
        
        <Button onClick={handleRoll} disabled={isRolling} variant="default" className="w-full font-cinzel font-bold hover:shadow-glow transition-all duration-300">
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </Button>
      </div>
    </Card>;
};
export default Dice;