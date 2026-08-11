import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

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
      message,
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
      )
    `)
    .order("created_at", {
      ascending: false,
    });

  if (error) {
    return (
      <main className="min-h-screen px-8 py-12">
        <h1 className="text-4xl font-bold">
          Offers
        </h1>

        <p className="mt-4 text-red-600">
          Unable to load offers: {error.message}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-900">
              Marketplace
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Offers
            </h1>

            <p className="mt-3 text-stone-600">
              Review incoming offers from Card Forge buyers.
            </p>
          </div>

          <Link
            href="/admin"
            className="font-semibold text-blue-900 hover:underline"
          >
            ← Back to Dashboard
          </Link>
        </div>

        <p className="mt-8 text-sm text-stone-500">
          {offers?.length ?? 0} offer
          {(offers?.length ?? 0) === 1
            ? ""
            : "s"}{" "}
          received
        </p>

        <div className="mt-8 space-y-5">
          {offers?.map((offer) => {
            const card = Array.isArray(
              offer.cards
            )
              ? offer.cards[0]
              : offer.cards;

            return (
              <div
                key={offer.id}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="flex gap-5">
                    {card?.image && (
                      <img
                        src={card.image}
                        alt={card.player}
                        className="h-32 w-24 rounded-lg border object-contain"
                      />
                    )}

                    <div>
                      <p className="text-sm text-stone-500">
                        {card?.year} •{" "}
                        {card?.set}
                      </p>

                      <h2 className="mt-1 text-xl font-bold">
                        {card?.player ||
                          "Unknown Card"}
                      </h2>

                      <p className="mt-3 text-sm text-stone-500">
                        Asking Price
                      </p>

                      <p className="font-bold">
                        $
                        {Number(
                          card?.price ?? 0
                        ).toLocaleString(
                          undefined,
                          {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          }
                        )}
                      </p>

                      {card?.owner && (
                        <p className="mt-2 text-sm text-stone-500">
                          Owner:{" "}
                          <span className="font-semibold text-stone-800">
                            {card.owner}
                          </span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="min-w-64">
                    <p className="text-sm text-stone-500">
                      Offer
                    </p>

                    <p className="text-3xl font-bold">
                      $
                      {Number(
                        offer.offer_amount
                      ).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>

                    <p className="mt-4 font-semibold">
                      {offer.name}
                    </p>

                    <a
                      href={`mailto:${offer.email}`}
                      className="text-sm text-blue-900 hover:underline"
                    >
                      {offer.email}
                    </a>

                    {offer.message && (
                      <div className="mt-4 rounded-lg bg-stone-50 p-4">
                        <p className="text-sm text-stone-600">
                          {offer.message}
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="min-w-40">
                    <span
                      className={`inline-block rounded-full px-4 py-2 text-sm font-bold ${
                        offer.status ===
                        "Accepted"
                          ? "bg-green-100 text-green-800"
                          : offer.status ===
                            "Declined"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {offer.status}
                    </span>

                    <p className="mt-3 text-xs text-stone-500">
                      {new Date(
                        offer.created_at
                      ).toLocaleString()}
                    </p>

                    {card?.id && (
                      <Link
                        href={`/admin/cards/${card.id}`}
                        className="mt-4 block text-sm font-semibold text-blue-900 hover:underline"
                      >
                        Edit Card →
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {offers?.length === 0 && (
          <div className="mt-10 rounded-xl border bg-white p-10 text-center">
            <h2 className="text-2xl font-bold">
              No offers yet
            </h2>

            <p className="mt-2 text-stone-600">
              Customer offers will appear here automatically.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}