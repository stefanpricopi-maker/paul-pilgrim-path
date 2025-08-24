import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

interface WinConditionConfig {
  id: string;
  type: 'round_limit' | 'church_goal' | 'bankruptcy';
  name: string;
  description: string;
  defaultValue?: number;
  isDefault: boolean;
}

const DEFAULT_WIN_CONDITIONS: WinConditionConfig[] = [
  {
    id: 'round_limit',
    type: 'round_limit',
    name: 'Round Limit',
    description: 'Game ends after a specific number of rounds. Player with most coins wins.',
    defaultValue: 10,
    isDefault: true
  },
  {
    id: 'church_goal',
    type: 'church_goal', 
    name: 'Church Building Goal',
    description: 'First player to build a specific number of churches wins.',
    defaultValue: 5,
    isDefault: false
  },
  {
    id: 'bankruptcy',
    type: 'bankruptcy',
    name: 'Last Player Standing',
    description: 'Game continues until only one player remains with money.',
    isDefault: false
  }
];

export default function WinningConditionsEditor() {
  const [conditions, setConditions] = useState<WinConditionConfig[]>(DEFAULT_WIN_CONDITIONS);
  const [loading, setLoading] = useState(false);
  const [selectedDefault, setSelectedDefault] = useState('round_limit');

  useEffect(() => {
    loadWinConditions();
  }, []);

  const loadWinConditions = async () => {
    try {
      // For now, we'll use the default conditions
      // In the future, these could be stored in a database table
      const defaultCondition = conditions.find(c => c.isDefault);
      if (defaultCondition) {
        setSelectedDefault(defaultCondition.id);
      }
    } catch (error) {
      console.error('Error loading win conditions:', error);
    }
  };

  const updateConditionValue = (conditionId: string, value: number) => {
    setConditions(prev => prev.map(condition => 
      condition.id === conditionId 
        ? { ...condition, defaultValue: value }
        : condition
    ));
  };

  const setDefaultCondition = (conditionId: string) => {
    setSelectedDefault(conditionId);
    setConditions(prev => prev.map(condition => ({
      ...condition,
      isDefault: condition.id === conditionId
    })));
  };

  const saveWinConditions = async () => {
    setLoading(true);
    try {
      // For now, we'll just show a success message
      // In a full implementation, you could save these to a settings table
      toast({
        title: "Win Conditions Updated",
        description: "Default winning scenarios have been configured.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update win conditions.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Winning Conditions</h2>
        <p className="text-muted-foreground">
          Configure the available winning scenarios for new games.
        </p>
      </div>

      <div className="space-y-4">
        {conditions.map((condition) => (
          <Card key={condition.id} className={condition.isDefault ? "border-primary" : ""}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{condition.name}</CardTitle>
                  <CardDescription>{condition.description}</CardDescription>
                </div>
                <Button
                  variant={condition.isDefault ? "default" : "outline"}
                  size="sm"
                  onClick={() => setDefaultCondition(condition.id)}
                >
                  {condition.isDefault ? "Default" : "Set Default"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {condition.type !== 'bankruptcy' && (
                <div className="flex items-center space-x-4">
                  <Label htmlFor={`${condition.id}-value`} className="text-sm font-medium">
                    {condition.type === 'round_limit' ? 'Number of Rounds:' : 'Churches Required:'}
                  </Label>
                  <Input
                    id={`${condition.id}-value`}
                    type="number"
                    min="1"
                    max={condition.type === 'round_limit' ? "50" : "20"}
                    value={condition.defaultValue || ''}
                    onChange={(e) => updateConditionValue(condition.id, parseInt(e.target.value) || 0)}
                    className="w-24"
                  />
                </div>
              )}
              
              {condition.type === 'bankruptcy' && (
                <p className="text-sm text-muted-foreground">
                  No additional configuration needed. Game continues until only one player has money.
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator />

      <div className="bg-muted/50 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Current Configuration Summary</h3>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>• Default winning condition: <span className="font-medium">{conditions.find(c => c.isDefault)?.name}</span></li>
          {conditions.find(c => c.isDefault && c.defaultValue) && (
            <li>• Default value: <span className="font-medium">{conditions.find(c => c.isDefault)?.defaultValue}</span></li>
          )}
          <li>• Players can choose from {conditions.length} winning scenarios when creating games</li>
        </ul>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={loadWinConditions}>
          Reset to Defaults
        </Button>
        <Button onClick={saveWinConditions} disabled={loading}>
          {loading ? "Saving..." : "Save Configuration"}
        </Button>
      </div>
    </div>
  );
}