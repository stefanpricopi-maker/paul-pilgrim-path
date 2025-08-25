// src/components/admin/PlayerManagement.tsx
import { usePlayers } from "@/hooks/usePlayers";
import { Loader2, Shield, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PlayerManagement() {
  const { players, loading } = usePlayers();

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card className="p-4 shadow-md">
      <h2 className="text-xl font-bold mb-4">Player Management</h2>
      <div className="space-y-2">
        {players.map((player) => (
          <Card key={player.id} className="p-3 flex items-center justify-between">
            <div>
              <p className="font-semibold">{player.username}</p>
              <p className="text-sm text-muted-foreground">
                {player.is_admin ? "Admin" : "Player"} • Joined:{" "}
                {new Date(player.created_at).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                {player.is_admin ? <Shield className="w-4 h-4 mr-1" /> : "Promote"}
              </Button>
              <Button size="sm" variant="destructive">
                <UserX className="w-4 h-4 mr-1" /> Ban
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </Card>
  );
}
