import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { DiceProps } from '@/types/game';
const Dice = ({
  value,
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
  return <Card className="p-6 bg-gradient-parchment border-2 border-accent/30">
      <div className="text-center space-y-4">
        <h3 className="text-lg font-bold ancient-text text-primary">Dice</h3>
        
        <div className="flex justify-center">
          <Card key={animationKey} className={`w-20 h-20 border-2 border-primary bg-card ${isRolling ? 'dice-roll' : ''}`}>
            {value > 0 && getDiceDisplay(value)}
          </Card>
        </div>
        
        {value > 0 && <p className="text-2xl font-bold text-accent ancient-text">
            {value}
          </p>}
        
        <Button onClick={handleRoll} disabled={isRolling} variant="default" className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold ancient-text">
          {isRolling ? 'Rolling...' : 'Roll Dice'}
        </Button>
      </div>
    </Card>;
};
export default Dice;