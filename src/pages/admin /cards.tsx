import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase"; // your initialized client
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type GameCard = {
  id: string;
  text: string;
  effect: any;
};

export default function AdminCards() {
  const [chanceCards, setChanceCards] = useState<GameCard[]>([]);
  const [communityCards, setCommunityCards] = useState<GameCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCards();
  }, []);

  async function fetchCards() {
    setLoading(true);
    let { data: chance } = await supabase.from("chance_cards").select("*");
    let { data: community } = await supabase.from("community_cards").select("*");
    setChanceCards(chance || []);
    setCommunityCards(community || []);
    setLoading(false);
  }

  async function updateCard(table: string, id: string, newText: string, newEffect: string) {
    await supabase.from(table).update({
      text: newText,
      effect: newEffect ? JSON.parse(newEffect) : null
    }).eq("id", id);
    fetchCards();
  }

  async function deleteCard(table: string, id: string) {
    await supabase.from(table).delete().eq("id", id);
    fetchCards();
  }

  async function addCard(table: string) {
    await supabase.from(table).insert([
      { text: "New card text", effect: { points: 0 } }
    ]);
    fetchCards();
  }

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Chance Cards */}
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Chance Cards</h2>
        {chanceCards.map((c) => (
          <CardContent key={c.id} className="mb-4 p-3 border rounded-lg">
            <Textarea
              defaultValue={c.text}
              onBlur={(e) => updateCard("chance_cards", c.id, e.target.value, JSON.stringify(c.effect))}
              className="mb-2"
            />
            <Input
              defaultValue={JSON.stringify(c.effect)}
              onBlur={(e) => updateCard("chance_cards", c.id, c.text, e.target.value)}
              className="mb-2"
            />
            <Button variant="destructive" size="sm" onClick={() => deleteCard("chance_cards", c.id)}>
              Delete
            </Button>
          </CardContent>
        ))}
        <Button onClick={() => addCard("chance_cards")}>Add Chance Card</Button>
      </Card>

      {/* Community Cards */}
      <Card className="p-4">
        <h2 className="text-xl font-bold mb-4">Community Cards</h2>
        {communityCards.map((c) => (
          <CardContent key={c.id} className="mb-4 p-3 border rounded-lg">
            <Textarea
              defaultValue={c.text}
              onBlur={(e) => updateCard("community_cards", c.id, e.target.value, JSON.stringify(c.effect))}
              className="mb-2"
            />
            <Input
              defaultValue={JSON.stringify(c.effect)}
              onBlur={(e) => updateCard("community_cards", c.id, c.text, e.target.value)}
              className="mb-2"
            />
            <Button variant="destructive" size="sm" onClick={() => deleteCard("community_cards", c.id)}>
              Delete
            </Button>
          </CardContent>
        ))}
        <Button onClick={() => addCard("community_cards")}>Add Community Card</Button>
      </Card>
    </div>
  );
}
