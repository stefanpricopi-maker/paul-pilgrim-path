// src/pages/admin/index.tsx
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useRouter } from 'next/router';

export default function AdminPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push('/login');
      else setUser(data.user);
    });
  }, [router]);

  if (!user) return <p>Loading...</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <ul className="space-y-2">
        <li><a href="/admin/tiles" className="text-blue-600">Manage Tiles</a></li>
        <li><a href="/admin/cards" className="text-blue-600">Manage Cards</a></li>
        <li><a href="/admin/players" className="text-blue-600">Manage Players</a></li>
      </ul>
    </div>
  );
}
