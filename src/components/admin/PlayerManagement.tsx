import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";

interface Player {
  id: string;
  email: string;
  username: string;
  is_admin: boolean;
}

const PlayerManagement = () => {
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingPlayer, setEditingPlayer] = useState<Player | null>(null);
  const [username, setUsername] = useState("");

  const fetchPlayers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("username");

    if (error) {
      toast({ title: "Error fetching players", description: error.message, variant: "destructive" });
    } else {
      setPlayers(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPlayers();
  }, []);

  const startEdit = (player: Player) => {
    setEditingPlayer(player);
    setUsername(player.username);
  };

  const saveEdit = async () => {
    if (!editingPlayer) return;
    const { error } = await supabase
      .from("profiles")
      .update({ username })
      .eq("id", editingPlayer.id);

    if (error) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Player updated!" });
      fetchPlayers();
      setEditingPlayer(null);
    }
  };

  const deletePlayer = async (player: Player) => {
    if (!confirm(`Are you sure you want to delete ${player.username}?`)) return;

    const { error } = await supabase.from("profiles").delete().eq("id", player.id);

    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Player deleted!" });
      fetchPlayers();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Player Management</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <p>Loading players...</p>
        ) : (
          players.map((p) => (
            <div key={p.id} className="flex justify-between items-center">
              <span>{p.username} ({p.email}) {p.is_admin && "[Admin]"}</span>
              <div className="space-x-2">
                <Button size="sm" onClick={() => startEdit(p)}>Edit</Button>
                <Button size="sm" variant="destructive" onClick={() => deletePlayer(p)}>Delete</Button>
              </div>
            </div>
          ))
        )}

        {editingPlayer && (
          <div className="flex space-x-2 items-center mt-4">
            <Input value={username} onChange={(e) => setUsername(e.target.value)} />
            <Button size="sm" onClick={saveEdit}>Save</Button>
            <Button size="sm" variant="outline" onClick={() => setEditingPlayer(null)}>Cancel</Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PlayerManagement;
