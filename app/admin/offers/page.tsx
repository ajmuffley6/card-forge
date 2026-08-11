import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function money(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export default async function AdminOffersPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: offers, error } = await supabase
    .from("offers")
    .select(`
      id,
      card_id,
      name,
      email,
      offer_amount,
      offer_type,
      cash_amount,
      status,
      created_at,
      cards (
        id,
        player,
        year,
        set,
        image,
        price,
        owner
      ),
      trade_offer_cards (
        id,
        customer_estimated_value
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold">
            Offers
          </h1>

          <p className="mt-4 text-red-600">
            Unable to load offers: {error.message}
          </p>
        </div>
      </main>
    );
  }

  const allOffers = offers ?? [];

  const pendingCount = allOffers.filter(
    (offer) => offer.status === "Pending"
  ).length;

  const acceptedCount = allOffers.filter(
    (offer) => offer.status === "Accepted"
  ).length;

  const counteredCount = allOffers.filter(
    (offer) => offer.status === "Countered"
  ).length;

  const declinedCount = allOffers.filter(
    (offer) => offer.status === "Declined"
  ).length;

  return (
    <main className="min-h-screen bg-[var(--background)] px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-900">
              Marketplace
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Offer Center
            </h1>

            <p className="mt-3 text-stone-600">
              Review cash offers, trades, and trade-plus-cash proposals.
            </p>
          </div>

          <Link
            href="/admin"
            className="font-semibold text-blue-900 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Pending
            </p>

            <p className="mt-2 text-3xl font-bold">
              {pendingCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Accepted
            </p>

            <p className="mt-2 text-3xl font-bold">
              {acceptedCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Countered
            </p>

            <p className="mt-2 text-3xl font-bold">
              {counteredCount}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Declined
            </p>

            <p className="mt-2 text-3xl font-bold">
              {declinedCount}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
                Inbox
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                All Offers
              </h2>
            </div>

            <p className="text-sm text-stone-500">
              {allOffers.length} total
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {allOffers.map((offer) => {
              const card = Array.isArray(offer.cards)
                ? offer.cards[0]
                : offer.cards;

              const tradeCards =
                offer.trade_offer_cards ?? [];

              const tradeValue = tradeCards.reduce(
                (total, tradeCard) =>
                  total +
                  Number(
                    tradeCard.customer_estimated_value ?? 0
                  ),
                0
              );

              const cashAmount = Number(
                offer.cash_amount ??
                  offer.offer_amount ??
                  0
              );

              const offerType =
                offer.offer_type || "Cash";

              const proposedValue =
                offerType === "Trade"
                  ? tradeValue
                  : offerType === "Trade + Cash"
                  ? tradeValue + cashAmount
                  : cashAmount;

              return (
                <div
                  key={offer.id}
                  className="rounded-xl border bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="grid gap-6 lg:grid-cols-[1fr_180px_180px_auto] lg:items-center">
                    <div className="flex items-center gap-5">
                      {card?.image ? (
                        <img
                          src={card.image}
                          alt={card.player || "Card"}
                          className="h-28 w-20 rounded-lg border bg-stone-50 object-contain"
                        />
                      ) : (
                        <div className="flex h-28 w-20 items-center justify-center rounded-lg border bg-stone-100 text-xs text-stone-400">
                          No Image
                        </div>
                      )}

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-blue-900">
                          {offerType}
                        </p>

                        <h3 className="mt-1 text-xl font-bold">
                          {card?.player || "Unknown Card"}
                        </h3>

                        <p className="mt-1 text-sm text-stone-500">
                          {card?.year} • {card?.set}
                        </p>

                        <p className="mt-2 text-sm">
                          From{" "}
                          <span className="font-semibold">
                            {offer.name}
                          </span>
                        </p>

                        {card?.owner && (
                          <p className="mt-1 text-xs text-stone-500">
                            Owner: {card.owner}
                          </p>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Asking
                      </p>

                      <p className="mt-1 font-bold">
                        {money(card?.price)}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
                        Proposed Value
                      </p>

                      <p className="mt-1 text-xl font-bold">
                        {money(proposedValue)}
                      </p>

                      {tradeCards.length > 0 && (
                        <p className="mt-1 text-xs text-stone-500">
                          {tradeCards.length} trade card
                          {tradeCards.length === 1
                            ? ""
                            : "s"}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col gap-3 lg:items-end">
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-xs font-bold ${
                          offer.status === "Accepted"
                            ? "bg-green-100 text-green-800"
                            : offer.status === "Declined"
                            ? "bg-red-100 text-red-800"
                            : offer.status === "Countered"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {offer.status}
                      </span>

                      <Link
                        href={`/admin/offers/${offer.id}`}
                        className="rounded-lg bg-blue-900 px-5 py-2 text-center text-sm font-bold text-white hover:bg-blue-800"
                      >
                        Review
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {allOffers.length === 0 && (
            <div className="mt-8 rounded-xl border bg-white p-10 text-center">
              <h3 className="text-2xl font-bold">
                No offers yet
              </h3>

              <p className="mt-2 text-stone-600">
                Customer offers will appear here automatically.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}