import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Eye, 
  Pause, 
  Square, 
  Users, 
  Clock, 
  Activity,
  AlertTriangle,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { useAuditLog } from "@/hooks/useAuditLog";

interface LiveGame {
  id: string;
  status: string;
  current_turn: number;
  created_at: string;
  host_id: string;
  language: string;
  player_count: number;
  players: Array<{
    id: string;
    name: string;
    coins: number;
    position: number;
    user_id: string;
  }>;
  duration: string;
}

export default function LiveGameMonitoring() {
  const [games, setGames] = useState<LiveGame[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChannel, setActiveChannel] = useState<any>(null);
  const { logAdminAction } = useAuditLog();

  useEffect(() => {
    fetchActiveGames();
    setupRealtime();

    return () => {
      if (activeChannel) {
        supabase.removeChannel(activeChannel);
      }
    };
  }, []);

  const fetchActiveGames = async () => {
    try {
      const { data: gamesData, error: gamesError } = await supabase
        .from("games")
        .select(`
          id, 
          status, 
          current_turn, 
          created_at, 
          host_id, 
          language
        `)
        .in("status", ["waiting", "active"]);

      if (gamesError) throw gamesError;

      if (gamesData && gamesData.length > 0) {
        // Fetch players for each game
        const gamesWithPlayers = await Promise.all(
          gamesData.map(async (game) => {
            const { data: playersData } = await supabase
              .from("players")
              .select("id, name, coins, position, user_id")
              .eq("game_id", game.id);

            const duration = calculateDuration(game.created_at);
            
            return {
              ...game,
              players: playersData || [],
              player_count: playersData?.length || 0,
              duration
            };
          })
        );

        setGames(gamesWithPlayers);
      } else {
        setGames([]);
      }
    } catch (error) {
      console.error("Error fetching active games:", error);
      toast.error("Failed to fetch active games");
    } finally {
      setLoading(false);
    }
  };

  const setupRealtime = () => {
    const channel = supabase
      .channel('admin-live-monitoring')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'games'
      }, () => {
        fetchActiveGames();
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'players'
      }, () => {
        fetchActiveGames();
      })
      .subscribe();

    setActiveChannel(channel);
  };

  const calculateDuration = (createdAt: string) => {
    const start = new Date(createdAt);
    const now = new Date();
    const diff = now.getTime() - start.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const handleForceEndGame = async (gameId: string) => {
    console.log("Force ending game:", gameId);
    
    try {
      // Add confirmation
      if (!confirm("Are you sure you want to force-end this game? This action cannot be undone.")) {
        return;
      }

      const { error } = await supabase
        .from("games")
        .update({ status: "cancelled" })
        .eq("id", gameId);

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }
      
      // Log the admin action
      await logAdminAction(
        "force_end_game",
        `Force-ended game ${gameId}`,
        "game",
        gameId,
        { reason: "admin_action", original_status: "active" }
      );
      
      toast.success("Game force-ended successfully");
      fetchActiveGames();
    } catch (error) {
      console.error("Error force-ending game:", error);
      toast.error("Failed to force-end game: " + (error as Error).message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "waiting": return "bg-yellow-500";
      case "active": return "bg-green-500";
      case "paused": return "bg-orange-500";
      default: return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading active games...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5" />
            Live Game Monitoring
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {games.length} Active Games
              </Badge>
            </div>
            <Button 
              onClick={fetchActiveGames} 
              variant="outline" 
              size="sm"
              className="ml-auto"
            >
              Refresh
            </Button>
          </div>

          {games.length === 0 ? (
            <div className="text-center py-12">
              <AlertTriangle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Active Games</h3>
              <p className="text-muted-foreground">All games are currently finished or cancelled.</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {games.map((game) => (
                <Card key={game.id} className="border-2">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge className={getStatusColor(game.status)}>
                        {game.status.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {game.language.toUpperCase()}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          Players:
                        </span>
                        <span>{game.player_count}/6</span>
                      </div>
                      
                      <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          Duration:
                        </span>
                        <span>{game.duration}</span>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span>Turn:</span>
                        <span>{game.current_turn}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">Players:</h4>
                      <div className="space-y-1 max-h-24 overflow-y-auto">
                        {game.players.map((player) => (
                          <div key={player.id} className="flex justify-between text-xs">
                            <span>{player.name}</span>
                            <span>{player.coins} coins</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="flex-1"
                        onClick={() => toast.info("Spectate mode coming soon")}
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        Spectate
                      </Button>
                      
                      <Button 
                        size="sm" 
                        variant="destructive" 
                        onClick={() => handleForceEndGame(game.id)}
                      >
                        <Square className="w-4 h-4 mr-1" />
                        End
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}