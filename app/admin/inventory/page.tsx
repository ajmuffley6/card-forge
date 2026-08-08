import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DeleteCardButton from "./DeleteCardButton";

export default async function AdminInventory() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: adminRecord } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", user.id)
    .single();

  if (!adminRecord) {
    redirect("/admin/login");
  }

  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .order("player");

  if (error) {
    return (
      <main className="min-h-screen px-8 py-12">
        <h1 className="text-4xl font-bold">
          Inventory Manager
        </h1>

        <p className="mt-4 text-red-600">
          {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-8 py-12">
      <h1 className="text-4xl font-bold">
        Inventory Manager
      </h1>

      <p className="mt-3 text-stone-600">
        Edit your inventory.
      </p>

      <div className="mt-10 space-y-4">
        {cards?.map((card) => (
          <div
            key={card.id}
            className="flex items-center justify-between rounded-xl border bg-white p-5 shadow"
          >
            <div>
              <h2 className="text-xl font-bold">
                {card.player}
              </h2>

              <p className="text-stone-600">
                {card.year} • {card.set}
              </p>

              <p className="text-sm text-stone-500">
                {card.team}
              </p>
            </div>

            <div className="text-right">
              <p className="text-xl font-bold">
                ${Number(card.price).toLocaleString()}
              </p>

              <div className="mt-2 flex items-start gap-2">
                <a
                  href={`/admin/cards/${card.id}`}
                  className="inline-block rounded-lg bg-blue-900 px-4 py-2 font-semibold text-white hover:bg-blue-800"
                >
                  Edit
                </a>

                <DeleteCardButton
                  cardId={card.id}
                  player={card.player}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}