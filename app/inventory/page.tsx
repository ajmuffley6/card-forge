import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function Inventory({
  searchParams,
}: {
  searchParams: Promise<{
    search?: string;
    sort?: string;
    category?: string;
    sport?: string;
    status?: string;
  }>;
}) {
  const {
    search = "",
    sort = "newest",
    category = "",
    sport = "",
    status = "",
  } = await searchParams;

  const supabase = await createClient();

  let query = supabase.from("cards").select("*");

  if (search.trim()) {
    query = query.or(
      `player.ilike.%${search}%,team.ilike.%${search}%,set.ilike.%${search}%`
    );
  }

  if (category === "rookies") {
    query = query.eq("rookie", true);
  } else if (category === "autographs") {
    query = query.eq("autograph", true);
  } else if (category === "vintage") {
    query = query.eq("vintage", true);
  } else if (category === "inserts") {
    query = query.eq("rare_insert", true);
  }

  if (sport) {
    query = query.eq("sport", sport);
  }

  if (status) {
    query = query.eq("status", status);
  }

  if (sort === "price-low") {
    query = query.order("price", { ascending: true });
  } else if (sort === "price-high") {
    query = query.order("price", { ascending: false });
  } else if (sort === "player") {
    query = query.order("player", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data: cards, error } = await query;

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
    <main className="min-h-screen bg-[var(--background)] px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold">
          Inventory
        </h1>

        <p className="mt-3 text-stone-600">
          Browse the Card Forge collection.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/inventory"
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              !category
                ? "bg-blue-900 text-white"
                : "bg-white text-stone-800"
            }`}
          >
            All Cards
          </Link>

          <Link
            href="/inventory?category=rookies"
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              category === "rookies"
                ? "bg-blue-900 text-white"
                : "bg-white text-stone-800"
            }`}
          >
            Rookie Cards
          </Link>

          <Link
            href="/inventory?category=autographs"
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              category === "autographs"
                ? "bg-blue-900 text-white"
                : "bg-white text-stone-800"
            }`}
          >
            Autographs
          </Link>

          <Link
            href="/inventory?category=vintage"
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              category === "vintage"
                ? "bg-blue-900 text-white"
                : "bg-white text-stone-800"
            }`}
          >
            Vintage
          </Link>

          <Link
            href="/inventory?category=inserts"
            className={`rounded-full border px-4 py-2 text-sm font-semibold ${
              category === "inserts"
                ? "bg-blue-900 text-white"
                : "bg-white text-stone-800"
            }`}
          >
            Rare Inserts
          </Link>
        </div>

        <form
          method="GET"
          className="mt-8 grid gap-4 rounded-xl border bg-white p-5 shadow-sm lg:grid-cols-[1fr_160px_160px_180px_auto_auto]"
        >
          {category && (
            <input
              type="hidden"
              name="category"
              value={category}
            />
          )}

          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search player, team, or set..."
            className="rounded-lg border px-4 py-3"
          />

          <select
            name="sport"
            defaultValue={sport}
            className="rounded-lg border bg-white px-4 py-3"
          >
            <option value="">All Sports</option>
            <option value="Football">Football</option>
            <option value="Baseball">Baseball</option>
            <option value="Basketball">Basketball</option>
            <option value="Hockey">Hockey</option>
            <option value="Soccer">Soccer</option>
            <option value="Golf">Golf</option>
            <option value="Racing">Racing</option>
            <option value="UFC">UFC</option>
            <option value="Pokemon">Pokémon</option>
            <option value="Other">Other</option>
          </select>

          <select
            name="status"
            defaultValue={status}
            className="rounded-lg border bg-white px-4 py-3"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Reserved">Reserved</option>
            <option value="Sold">Sold</option>
          </select>

          <select
            name="sort"
            defaultValue={sort}
            className="rounded-lg border bg-white px-4 py-3"
          >
            <option value="newest">
              Newest
            </option>

            <option value="price-low">
              Price: Low to High
            </option>

            <option value="price-high">
              Price: High to Low
            </option>

            <option value="player">
              Player A-Z
            </option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-blue-900 px-6 py-3 font-bold text-white hover:bg-blue-800"
          >
            Apply
          </button>

          <Link
            href={
              category
                ? `/inventory?category=${category}`
                : "/inventory"
            }
            className="rounded-lg border px-6 py-3 text-center font-semibold"
          >
            Clear
          </Link>
        </form>

        <p className="mt-6 text-sm text-stone-500">
          {cards?.length ?? 0} card
          {(cards?.length ?? 0) === 1 ? "" : "s"} found
        </p>

        <section className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {cards?.map((card) => {
            const isSold = card.status === "Sold";
            const isReserved = card.status === "Reserved";

            return (
              <Link
                key={card.id}
                href={`/inventory/${card.id}`}
                className={`relative block overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg ${
                  isSold ? "opacity-75" : ""
                }`}
              >
                <div className="relative aspect-[3/4] w-full bg-stone-100">
                  <img
                    src={card.image}
                    alt={`${card.year} ${card.player}`}
                    className={`h-full w-full object-contain p-4 ${
                      isSold ? "grayscale" : ""
                    }`}
                  />

                  {isSold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="rounded-lg bg-red-700 px-6 py-3 text-xl font-bold text-white shadow-lg">
                        SOLD
                      </span>
                    </div>
                  )}

                  {isReserved && (
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow">
                        RESERVED
                      </span>
                    </div>
                  )}

                  {!isSold && !isReserved && (
                    <div className="absolute right-3 top-3">
                      <span className="rounded-full bg-green-700 px-4 py-2 text-xs font-bold text-white shadow">
                        AVAILABLE
                      </span>
                    </div>
                  )}
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

                  {card.sport && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-stone-400">
                      {card.sport}
                    </p>
                  )}

                  <p className="mt-3 text-sm font-semibold">
                    {card.grade}
                  </p>

                  <p className="mt-4 text-xl font-bold">
                    $
                    {Number(card.price).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </p>

                  <p className="mt-4 text-sm font-semibold text-blue-900">
                    View Card →
                  </p>
                </div>
              </Link>
            );
          })}
        </section>

        {cards?.length === 0 && (
          <div className="mt-12 rounded-xl border bg-white p-10 text-center">
            <h2 className="text-2xl font-bold">
              No cards found
            </h2>

            <p className="mt-2 text-stone-600">
              Try a different sport, status, category, or search term.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}