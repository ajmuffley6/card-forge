import { createClient } from "@/lib/supabase/server";

export default async function Inventory() {
  const supabase = await createClient();

  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen px-8 py-12">
        <h1 className="text-4xl font-bold">Inventory</h1>
        <p className="mt-4 text-red-600">
          Unable to load inventory: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-8 py-12">
      <h1 className="text-4xl font-bold">Inventory</h1>

      <p className="mt-4 text-stone-700">
        Browse the Card Forge collection.
      </p>

      <section className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {cards?.map((card) => (
          <div
            key={card.id}
            className="overflow-hidden rounded-xl border bg-white shadow-sm"
          >
            <div className="aspect-[3/4] w-full bg-stone-100">
              <img
                src={card.image}
                alt={`${card.year} ${card.player}`}
                className="h-full w-full object-contain p-4"
              />
            </div>

            <div className="p-5">
              <p className="text-sm text-stone-500">
                {card.year} • {card.set}
              </p>

              <h2 className="mt-1 text-xl font-bold">
                {card.player}
              </h2>

              <p className="mt-1 text-stone-600">
                {card.team}
              </p>

              <p className="mt-3 text-sm font-semibold">
                {card.grade}
              </p>

              <p className="mt-4 text-xl font-bold">
                ${Number(card.price).toLocaleString()}
              </p>
            </div>
          </div>
        ))}
      </section>
    </main>
  );
}