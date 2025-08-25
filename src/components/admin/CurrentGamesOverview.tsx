// src/components/admin/CurrentGamesOverview.tsx
import { useState } from 'react';
import { useGames } from '@/hooks/useGames';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function CurrentGamesOverview() {
  const { games, loading, refresh } = useGames();
  const [selectedGame, setSelectedGame] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [showFinished, setShowFinished] = useState(false);

  // Filter games based on showFinished toggle
  const filteredGames = games.filter(game => 
    showFinished ? true : game.status !== 'finished'
  );

  const handleForceStart = async (gameId) => {
    setActionLoading(`start-${gameId}`);
    try {
      const { error } = await supabase
        .from('games')
        .update({ status: 'active' })
        .eq('id', gameId);
      
      if (error) throw error;
      
      toast.success('Game started successfully');
      refresh();
    } catch (error) {
      toast.error('Failed to start game: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleEndGame = async (gameId) => {
    setActionLoading(`end-${gameId}`);
    try {
      const { error } = await supabase
        .from('games')
        .update({ status: 'finished' })
        .eq('id', gameId);
      
      if (error) throw error;
      
      toast.success('Game ended successfully');
      refresh();
    } catch (error) {
      toast.error('Failed to end game: ' + error.message);
    } finally {
      setActionLoading(null);
    }
  };

  const handleViewDetails = async (game) => {
    try {
      // Fetch additional game details including players
      const { data: players, error: playersError } = await supabase
        .from('players')
        .select('name, character_name, coins, position')
        .eq('game_id', game.id);
      
      if (playersError) throw playersError;
      
      setSelectedGame({ ...game, players: players || [] });
    } catch (error) {
      toast.error('Failed to load game details: ' + error.message);
    }
  };

  if (loading) return <p>Loading games...</p>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Current Games</h2>
        <div className="flex gap-2">
          <Button 
            variant={showFinished ? "default" : "outline"} 
            size="sm"
            onClick={() => setShowFinished(!showFinished)}
          >
            {showFinished ? "Hide Finished" : "Show Finished"}
          </Button>
          <Button onClick={refresh}>Refresh</Button>
        </div>
      </div>
      <table className="w-full border">
        <thead>
          <tr className="text-left">
            <th className="p-2 border">Game ID</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Players</th>
            <th className="p-2 border">Created At</th>
            <th className="p-2 border">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredGames.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-4 text-center text-muted-foreground">
                {games.length === 0 ? "No games found" : "No games match the current filter"}
              </td>
            </tr>
          ) : (
            filteredGames.map((game) => (
            <tr key={game.id} className="hover:bg-gray-100">
              <td className="p-2 border">{game.id}</td>
              <td className="p-2 border">{game.status}</td>
              <td className="p-2 border">—</td>
              <td className="p-2 border">{new Date(game.created_at).toLocaleString()}</td>
              <td className="p-2 border space-x-2">
                <Button 
                  size="sm" 
                  onClick={() => handleForceStart(game.id)}
                  disabled={game.status !== 'waiting' || actionLoading === `start-${game.id}`}
                >
                  {actionLoading === `start-${game.id}` ? 'Starting...' : 'Force Start'}
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive" 
                  onClick={() => handleEndGame(game.id)}
                  disabled={game.status === 'finished' || actionLoading === `end-${game.id}`}
                >
                  {actionLoading === `end-${game.id}` ? 'Ending...' : 'End Game'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  onClick={() => handleViewDetails(game)}
                >
                  View
                </Button>
              </td>
            </tr>
          ))
          )}
        </tbody>
      </table>

      {/* Game Details Modal */}
      <Dialog open={!!selectedGame} onOpenChange={() => setSelectedGame(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Game Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected game
            </DialogDescription>
          </DialogHeader>
          
          {selectedGame && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold">Game Information</h3>
                  <p><strong>ID:</strong> {selectedGame.id}</p>
                  <p><strong>Status:</strong> {selectedGame.status}</p>
                  <p><strong>Language:</strong> {selectedGame.language}</p>
                  <p><strong>Initial Balance:</strong> {selectedGame.initial_balance}</p>
                  <p><strong>Current Turn:</strong> {selectedGame.current_turn}</p>
                  <p><strong>Created:</strong> {new Date(selectedGame.created_at).toLocaleString()}</p>
                </div>
                <div>
                  <h3 className="font-semibold">Game Settings</h3>
                  <p><strong>Win Condition:</strong> {selectedGame.win_condition || 'None set'}</p>
                  <p><strong>Round Limit:</strong> {selectedGame.round_limit || 'No limit'}</p>
                  <p><strong>Church Goal:</strong> {selectedGame.church_goal || 'No goal'}</p>
                </div>
              </div>
              
              <div>
                <h3 className="font-semibold">Players ({selectedGame.players?.length || 0})</h3>
                {selectedGame.players?.length > 0 ? (
                  <div className="mt-2 space-y-2">
                    {selectedGame.players.map((player, index) => (
                      <div key={index} className="p-2 bg-muted rounded">
                        <p><strong>Name:</strong> {player.name}</p>
                        <p><strong>Character:</strong> {player.character_name || 'Not selected'}</p>
                        <p><strong>Coins:</strong> {player.coins}</p>
                        <p><strong>Position:</strong> {player.position}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No players have joined yet</p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
