import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import DeleteCardButton from "./DeleteCardButton";

export default async function AdminInventoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-8 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Inventory Manager
          </h1>

          <p className="mt-4 text-red-600">
            You must be logged in to manage inventory.
          </p>

          <Link
            href="/admin/login"
            className="mt-6 inline-block rounded-lg bg-blue-900 px-6 py-3 font-bold text-white hover:bg-blue-800"
          >
            Go to Admin Login
          </Link>
        </div>
      </main>
    );
  }

  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-8 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Inventory Manager
          </h1>

          <p className="mt-4 text-red-600">
            Unable to load inventory: {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-8 py-12">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold">
              Inventory Manager
            </h1>

            <p className="mt-3 text-stone-600">
              Add, edit, and remove cards from Card Forge.
            </p>
          </div>

          <Link
            href="/admin/add-card"
            className="rounded-lg bg-blue-900 px-6 py-3 text-center font-bold text-white hover:bg-blue-800"
          >
            + Add Card
          </Link>
        </div>

        <div className="mt-8 space-y-4">
          {cards?.map((card) => (
            <div
              key={card.id}
              className="flex flex-col gap-5 rounded-xl border bg-white p-5 shadow-sm md:flex-row md:items-center md:justify-between"
            >
              <div className="flex items-center gap-5">
                {card.image ? (
                  <img
                    src={card.image}
                    alt={`${card.year} ${card.player}`}
                    className="h-32 w-24 rounded-lg border bg-stone-50 object-contain p-1"
                  />
                ) : (
                  <div className="flex h-32 w-24 items-center justify-center rounded-lg border bg-stone-100 text-xs text-stone-500">
                    No Image
                  </div>
                )}

                <div>
                  <h2 className="text-xl font-bold">
                    {card.player}
                  </h2>

                  <p className="mt-1 text-stone-600">
                    {card.year} • {card.set}
                  </p>

                  <p className="mt-1 text-sm text-stone-500">
                    {card.team}
                  </p>

                  {card.parallel && (
                    <p className="mt-1 text-sm text-stone-500">
                      Parallel: {card.parallel}
                    </p>
                  )}

                  {card.grade && (
                    <p className="mt-1 text-sm text-stone-500">
                      Grade: {card.grade}
                    </p>
                  )}

                  {card.owner && (
                    <p className="mt-2 text-sm">
                      Owner:{" "}
                      <span className="font-semibold">
                        {card.owner}
                      </span>
                    </p>
                  )}

                  {card.status && (
                    <p className="mt-1 text-sm">
                      Status:{" "}
                      <span className="font-semibold">
                        {card.status}
                      </span>
                    </p>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    {card.rookie && (
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold">
                        Rookie
                      </span>
                    )}

                    {card.autograph && (
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold">
                        Autograph
                      </span>
                    )}

                    {card.vintage && (
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold">
                        Vintage
                      </span>
                    )}

                    {card.rare_insert && (
                      <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-semibold">
                        Rare Insert
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <div className="sm:min-w-28 sm:text-right">
                  <p className="text-sm text-stone-500">
                    Asking Price
                  </p>

                  <p className="text-xl font-bold">
                    $
                    {Number(
                      card.price ?? 0
                    ).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>
                </div>

                <Link
                  href={`/admin/cards/${card.id}`}
                  className="rounded-lg bg-blue-900 px-5 py-3 text-center font-bold text-white hover:bg-blue-800"
                >
                  Edit
                </Link>

                <DeleteCardButton
                  cardId={card.id}
                  player={card.player}
                />
              </div>
            </div>
          ))}
        </div>

        {cards?.length === 0 && (
          <div className="mt-10 rounded-xl border bg-white p-10 text-center">
            <h2 className="text-2xl font-bold">
              No cards in inventory
            </h2>

            <p className="mt-2 text-stone-600">
              Add your first card to get started.
            </p>

            <Link
              href="/admin/add-card"
              className="mt-6 inline-block rounded-lg bg-blue-900 px-6 py-3 font-bold text-white hover:bg-blue-800"
            >
              + Add Card
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}