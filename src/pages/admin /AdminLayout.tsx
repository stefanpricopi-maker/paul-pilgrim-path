// src/components/admin/AdminLayout.tsx
import { Link } from "react-router-dom";
import { ReactNode } from "react";
import { Home, Square, Layers, Users } from "lucide-react";

type Props = { children: ReactNode };

export default function AdminLayout({ children }: Props) {
  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-xl flex flex-col">
        <div className="p-6 border-b">
          <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
        </div>
        <nav className="flex-1 p-4 space-y-3">
          <Link href="/admin" className="flex items-center gap-2 p-2 rounded hover:bg-gray-200">
            <Home className="w-5 h-5" /> Dashboard
          </Link>
          <Link href="/admin/tiles" className="flex items-center gap-2 p-2 rounded hover:bg-gray-200">
            <Square className="w-5 h-5" /> Tiles
          </Link>
          <Link href="/admin/cards" className="flex items-center gap-2 p-2 rounded hover:bg-gray-200">
            <Layers className="w-5 h-5" /> Cards
          </Link>
          <Link href="/admin/players" className="flex items-center gap-2 p-2 rounded hover:bg-gray-200">
            <Users className="w-5 h-5" /> Players
          </Link>
        </nav>
        <div className="p-4 border-t text-sm text-gray-500">
          © 2025 Paul Pilgrim Path
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto p-6">
        {children}
      </main>
    </div>
  );
}
