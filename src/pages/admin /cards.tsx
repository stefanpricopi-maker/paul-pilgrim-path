import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import AdminLayout from "./AdminLayout";

export default function AdminCards() {
  const [cards, setCards] = useState<any[]>([]);

  useEffect(() => {
    const fetchCards = async () => {
      const { data, error } = await supabase.from("cards").select("*");
      if (!error) setCards(data || []);
    };
    fetchCards();
  }, []);

  return (
    <AdminLayout>
      <h1 className="text-2xl font-bold mb-4">Manage Cards</h1>
      <ul>
        {cards.map((card) => (
          <li key={card.id} className="border-b py-2">
            {card.text}
          </li>
        ))}
      </ul>
    </AdminLayout>
  );
}
