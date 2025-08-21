// src/components/GameMenu.tsx
import Link from "next/link";

interface GameMenuProps {
  isAdmin: boolean;
}

export default function GameMenu({ isAdmin }: GameMenuProps) {
  return (
    <nav className="flex gap-4">
      <Link href="/game">Back to Game</Link>
      {isAdmin && <Link href="/admin">⚙️ Admin Dashboard</Link>}
    </nav>
  );
}
