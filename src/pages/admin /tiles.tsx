// src/pages/admin/tiles.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';

export default function TilesAdmin() {
  const [tiles, setTiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTiles();
  }, []);

  async function fetchTiles() {
    setLoading(true);
    const { data, error } = await supabase.from('game_locations').select('*');
    if (!error) setTiles(data || []);
    setLoading(false);
  }

  async function updateTile(id: string, field: string, value: any) {
    await supabase.from('game_locations').update({ [field]: value }).eq('id', id);
    fetchTiles();
  }

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Manage Tiles</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <table className="min-w-full border">
          <thead>
            <tr>
              <th className="border p-2">ID</th>
              <th className="border p-2">Name</th>
              <th className="border p-2">Type</th>
              <th className="border p-2">Price</th>
              <th className="border p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tiles.map(tile => (
              <tr key={tile.id}>
                <td className="border p-2">{tile.id}</td>
                <td className="border p-2">
                  <input
                    value={tile.name}
                    onChange={(e) => updateTile(tile.id, 'name', e.target.value)}
                    className="border px-2"
                  />
                </td>
                <td className="border p-2">
                  <input
                    value={tile.type}
                    onChange={(e) => updateTile(tile.id, 'type', e.target.value)}
                    className="border px-2"
                  />
                </td>
                <td className="border p-2">
                  <input
                    type="number"
                    value={tile.price}
                    onChange={(e) => updateTile(tile.id, 'price', +e.target.value)}
                    className="border px-2"
                  />
                </td>
                <td className="border p-2">
                  <button
                    onClick={() => supabase.from('game_locations').delete().eq('id', tile.id).then(fetchTiles)}
                    className="bg-red-500 text-white px-3 py-1 rounded"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
