// src/components/admin/CurrentGamesOverview.tsx
import { useGames } from '@/hooks/useGames';
import { Button } from '@/components/ui/button';

export default function CurrentGamesOverview() {
  const { games, loading, refresh } = useGames();

  if (loading) return <p>Loading games...</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Current Games</h2>
      <Button onClick={refresh}>Refresh</Button>
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
          {games.map((game) => (
            <tr key={game.id} className="hover:bg-gray-100">
              <td className="p-2 border">{game.id}</td>
              <td className="p-2 border">{game.status}</td>
              <td className="p-2 border">—</td>
              <td className="p-2 border">{new Date(game.created_at).toLocaleString()}</td>
              <td className="p-2 border space-x-2">
                <Button size="sm" onClick={() => console.log('Force start', game.id)}>Force Start</Button>
                <Button size="sm" variant="destructive" onClick={() => console.log('End game', game.id)}>End Game</Button>
                <Button size="sm" variant="outline" onClick={() => console.log('View details', game.id)}>View</Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
