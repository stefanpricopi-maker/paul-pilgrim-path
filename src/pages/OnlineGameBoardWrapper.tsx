import { useParams } from "react-router-dom";
import OnlineGameBoard from "@/components/game/OnlineGameBoard";

export default function OnlineGameBoardWrapper() {
  const { gameId } = useParams<{ gameId: string }>();
  if (!gameId) return <div>Game ID missing</div>;
  return <OnlineGameBoard gameId={gameId} />;
}
