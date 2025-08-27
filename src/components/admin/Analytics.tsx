// src/components/admin/Analytics.tsx
import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Users, Gamepad2, MapPin, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface GameStats {
  game_id: string;
  total_turns: number;
  total_dice_rolls: number;
  winner_name: string;
  created_at: string;
}

interface PlayerStats {
  player_id: string;
  username: string;
  wins: number;
  total_games: number;
  average_coins: number;
}

export default function Analytics() {
  const [gameStats, setGameStats] = useState<GameStats[]>([]);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);

      // Fetch game statistics
      const { data: games } = await supabase
        .from("game_statistics")
        .select("game_id,total_turns,total_dice_rolls,winner_id,created_at")
        .order("created_at", { ascending: false })
        .limit(20);

      setGameStats(
        (games || []).map(g => ({
          game_id: g.game_id,
          total_turns: g.total_turns,
          total_dice_rolls: g.total_dice_rolls,
          winner_name: "Player", // Simplified for now
          created_at: g.created_at,
        }))
      );

      // Fetch player statistics
      const { data: players } = await supabase
        .from("player_statistics")
        .select("player_id,username,wins,total_games,average_coins")
        .order("wins", { ascending: false })
        .limit(10);

      setPlayerStats(players || []);
      setLoading(false);
    };

    fetchAnalytics();
  }, []);

  if (loading) return <p className="text-center mt-6">Loading analytics...</p>;

  return (
    <Tabs defaultValue="games" className="space-y-4">
      <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-2">
        <TabsTrigger value="games" className="flex items-center space-x-2">
          <Gamepad2 className="w-4 h-4" /> Games
        </TabsTrigger>
        <TabsTrigger value="players" className="flex items-center space-x-2">
          <Users className="w-4 h-4" /> Players
        </TabsTrigger>
      </TabsList>

      {/* Games Overview */}
      <TabsContent value="games">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Gamepad2 className="w-5 h-5" />
              <span>Recent Games</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={gameStats}>
                <XAxis dataKey="game_id" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="total_turns" stroke="#8884d8" />
                <Line type="monotone" dataKey="total_dice_rolls" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>

            <div className="mt-4">
              <h3 className="font-bold text-lg mb-2">Game Winners</h3>
              <ul className="space-y-1">
                {gameStats.map(g => (
                  <li key={g.game_id} className="flex justify-between">
                    <span>Game {g.game_id.substring(0, 6)}...</span>
                    <span className="font-semibold">{g.winner_name}</span>
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Player Leaderboard */}
      <TabsContent value="players">
        <Card className="mt-4">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Users className="w-5 h-5" /> Top Players
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {playerStats.map((p, i) => (
                <li key={p.player_id} className="flex justify-between bg-background/50 p-2 rounded">
                  <span>{i + 1}. {p.username}</span>
                  <span>
                    Wins: {p.wins} | Games: {p.total_games} | Avg Coins: {p.average_coins.toFixed(0)}
                  </span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
