import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Trophy, Award, Star, Crown } from 'lucide-react';
import { Achievement, PlayerAchievements } from '@/types/achievements';

interface AchievementPanelProps {
  playerAchievements: PlayerAchievements[];
  currentPlayerId?: string;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case 'common': return 'bg-muted text-muted-foreground';
    case 'rare': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'epic': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'legendary': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    default: return 'bg-muted text-muted-foreground';
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case 'common': return <Award className="w-4 h-4" />;
    case 'rare': return <Star className="w-4 h-4" />;
    case 'epic': return <Trophy className="w-4 h-4" />;
    case 'legendary': return <Crown className="w-4 h-4" />;
    default: return <Award className="w-4 h-4" />;
  }
};

export default function AchievementPanel({ playerAchievements, currentPlayerId }: AchievementPanelProps) {
  const [selectedPlayer, setSelectedPlayer] = useState(currentPlayerId || playerAchievements[0]?.playerId);
  
  const currentPlayerAchievements = playerAchievements.find(pa => pa.playerId === selectedPlayer);
  
  if (!currentPlayerAchievements) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No achievements data available.</p>
        </CardContent>
      </Card>
    );
  }

  const unlockedAchievements = currentPlayerAchievements.achievements.filter(a => a.unlocked);
  const inProgressAchievements = currentPlayerAchievements.achievements.filter(a => !a.unlocked && (a.progress || 0) > 0);
  const lockedAchievements = currentPlayerAchievements.achievements.filter(a => !a.unlocked && (a.progress || 0) === 0);

  const categories = ['all', 'building', 'economy', 'movement', 'milestone', 'special', 'social'];

  const filterAchievementsByCategory = (achievements: Achievement[], category: string) => {
    if (category === 'all') return achievements;
    return achievements.filter(a => a.category === category);
  };

  const overallProgress = Math.round((unlockedAchievements.length / currentPlayerAchievements.achievements.length) * 100);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Achievements
          </div>
          {playerAchievements.length > 1 && (
            <select
              value={selectedPlayer}
              onChange={(e) => setSelectedPlayer(e.target.value)}
              className="px-2 py-1 border rounded text-sm"
            >
              {playerAchievements.map(pa => (
                <option key={pa.playerId} value={pa.playerId}>
                  Player {pa.playerId}
                </option>
              ))}
            </select>
          )}
        </CardTitle>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Overall Progress</span>
            <span>{unlockedAchievements.length}/{currentPlayerAchievements.achievements.length}</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 lg:grid-cols-7 mb-4">
            {categories.map(category => (
              <TabsTrigger key={category} value={category} className="text-xs">
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </TabsTrigger>
            ))}
          </TabsList>

          {categories.map(category => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {/* Unlocked Achievements */}
                  {filterAchievementsByCategory(unlockedAchievements, category).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-primary mb-2">Unlocked ({filterAchievementsByCategory(unlockedAchievements, category).length})</h4>
                      <div className="space-y-2">
                        {filterAchievementsByCategory(unlockedAchievements, category).map(achievement => (
                          <Card key={achievement.id} className="p-3 bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{achievement.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-sm">{achievement.name}</h5>
                                  <Badge variant="secondary" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                                    {getRarityIcon(achievement.rarity)}
                                    {achievement.rarity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">{achievement.description}</p>
                                {achievement.unlockedAt && (
                                  <p className="text-xs text-green-600 dark:text-green-400 mt-1">
                                    Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* In Progress Achievements */}
                  {filterAchievementsByCategory(inProgressAchievements, category).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-accent mb-2">In Progress ({filterAchievementsByCategory(inProgressAchievements, category).length})</h4>
                      <div className="space-y-2">
                        {filterAchievementsByCategory(inProgressAchievements, category).map(achievement => (
                          <Card key={achievement.id} className="p-3 bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl opacity-70">{achievement.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-sm">{achievement.name}</h5>
                                  <Badge variant="secondary" className={`text-xs ${getRarityColor(achievement.rarity)}`}>
                                    {getRarityIcon(achievement.rarity)}
                                    {achievement.rarity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground mb-2">{achievement.description}</p>
                                <div className="space-y-1">
                                  <div className="flex items-center justify-between text-xs">
                                    <span>Progress</span>
                                    <span>{achievement.progress}/{achievement.maxProgress}</span>
                                  </div>
                                  <Progress 
                                    value={((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100} 
                                    className="h-1" 
                                  />
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Locked Achievements */}
                  {filterAchievementsByCategory(lockedAchievements, category).length > 0 && (
                    <div>
                      <h4 className="font-semibold text-sm text-muted-foreground mb-2">Locked ({filterAchievementsByCategory(lockedAchievements, category).length})</h4>
                      <div className="space-y-2">
                        {filterAchievementsByCategory(lockedAchievements, category).map(achievement => (
                          <Card key={achievement.id} className="p-3 bg-muted/30 border-muted">
                            <div className="flex items-start gap-3">
                              <div className="text-2xl opacity-30">{achievement.icon}</div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-sm opacity-60">{achievement.name}</h5>
                                  <Badge variant="secondary" className={`text-xs opacity-60 ${getRarityColor(achievement.rarity)}`}>
                                    {getRarityIcon(achievement.rarity)}
                                    {achievement.rarity}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground opacity-60">{achievement.description}</p>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {filterAchievementsByCategory([...unlockedAchievements, ...inProgressAchievements, ...lockedAchievements], category).length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-8">
                      No achievements in this category yet.
                    </p>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}