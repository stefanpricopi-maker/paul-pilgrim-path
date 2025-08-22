// src/pages/admin/tiles.tsx
import AdminLayout from "@/components/admin/AdminLayout";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TilesAdmin() {
  const [tiles, setTiles] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("game_locations").select("*").then(({ data }) => {
      if (data) setTiles(data);
    });
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-4">Manage Tiles</h2>
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg bg-white shadow">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Type</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {tiles.map((tile) => (
              <tr key={tile.id}>
                <td className="p-2 border">
                  <Input defaultValue={tile.name} />
                </td>
                <td className="p-2 border">
                  <Input defaultValue={tile.type} />
                </td>
                <td className="p-2 border">
                  <Input type="number" defaultValue={tile.price} />
                </td>
                <td className="p-2 border text-center">
                  <Button size="sm" variant="destructive">Delete</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminLayout>
  );
}
