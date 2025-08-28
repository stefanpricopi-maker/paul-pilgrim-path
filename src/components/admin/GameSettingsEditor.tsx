import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useGameDatabase } from '@/hooks/useGameDatabase';

export default function GameSettingsEditor() {
  const { gameSettings, updateGameSettings, loadSettings } = useGameDatabase();

  const [maxPlayers, setMaxPlayers] = useState<number>(4);
  const [startingCoins, setStartingCoins] = useState<number>(1000);
  const [enableSpecialBuildings, setEnableSpecialBuildings] = useState<boolean>(true);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  useEffect(() => {
    if (gameSettings) {
      setMaxPlayers(gameSettings.maxPlayers);
      setStartingCoins(gameSettings.startingCoins);
      setEnableSpecialBuildings(gameSettings.enableSpecialBuildings);
    }
  }, [gameSettings]);

  const handleSave = () => {
    updateGameSettings({
      maxPlayers,
      startingCoins,
      enableSpecialBuildings,
    });
    toast.success('Settings saved!');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        <label className="w-40">Max Players</label>
        <Input 
          type="number" 
          value={maxPlayers} 
          onChange={(e) => setMaxPlayers(parseInt(e.target.value))} 
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        <label className="w-40">Starting Coins</label>
        <Input 
          type="number" 
          value={startingCoins} 
          onChange={(e) => setStartingCoins(parseInt(e.target.value))} 
        />
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:space-x-4">
        <label className="w-40">Enable Special Buildings</label>
        <input 
          type="checkbox" 
          checked={enableSpecialBuildings} 
          onChange={(e) => setEnableSpecialBuildings(e.target.checked)} 
        />
      </div>

      <Button onClick={handleSave}>Save Settings</Button>
    </div>
  );
}
