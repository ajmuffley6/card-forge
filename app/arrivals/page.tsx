import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

export default async function NewArrivalsPage() {
  const supabase = await createClient();

  const { data: cards, error } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)]">
        <Navbar />

        <div className="mx-auto max-w-7xl px-8 py-12">
          <h1 className="text-4xl font-bold">
            New Arrivals
          </h1>

          <p className="mt-4 text-red-600">
            Unable to load new arrivals: {error.message}
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)]">
      <Navbar />

      <div className="mx-auto max-w-7xl px-8 py-12">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
              Just Added
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              New Arrivals
            </h1>

            <p className="mt-3 text-stone-600">
              Check out the newest cards added to Card Forge.
            </p>
          </div>

          <Link
            href="/inventory"
            className="font-semibold text-blue-900 hover:underline"
          >
            View Full Inventory →
          </Link>
        </div>

        <p className="mt-8 text-sm text-stone-500">
          {cards?.length ?? 0} card
          {(cards?.length ?? 0) === 1 ? "" : "s"} available
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
                <div className="relative aspect-[3/4] bg-stone-100">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={`${card.year} ${card.player}`}
                      className={`h-full w-full object-contain p-4 ${
                        isSold ? "grayscale" : ""
                      }`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">
                      No Image
                    </div>
                  )}

                  {isSold && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                      <span className="rounded-lg bg-red-700 px-6 py-3 text-xl font-bold text-white shadow-lg">
                        SOLD
                      </span>
                    </div>
                  )}

                  {isReserved && (
                    <span className="absolute right-3 top-3 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-white shadow">
                      RESERVED
                    </span>
                  )}

                  {!isSold && !isReserved && (
                    <span className="absolute right-3 top-3 rounded-full bg-green-700 px-4 py-2 text-xs font-bold text-white shadow">
                      AVAILABLE
                    </span>
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

                  <p className="mt-4 text-xl font-bold">
                    $
                    {Number(card.price ?? 0).toLocaleString(
                      undefined,
                      {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      }
                    )}
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
              No new arrivals yet
            </h2>

            <p className="mt-2 text-stone-600">
              New cards will appear here automatically when they are added.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}