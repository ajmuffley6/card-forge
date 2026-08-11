import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import CardImageViewer from "@/components/CardImageViewer";
import MakeOfferForm from "@/components/MakeOfferForm";

export default async function CardDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const { data: card, error } = await supabase
    .from("cards")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !card) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-8 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Card Not Found
          </h1>

          <Link
            href="/inventory"
            className="mt-6 inline-block rounded-lg bg-blue-900 px-6 py-3 font-bold text-white"
          >
            Back to Inventory
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-6 py-10 md:px-8 md:py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/inventory"
          className="text-sm font-semibold text-blue-900 hover:underline"
        >
          ← Back to Inventory
        </Link>

        <div className="mt-8 grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <CardImageViewer
            frontImage={card.image}
            backImage={card.back_image}
            altText={`${card.year} ${card.player}`}
          />

          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-stone-500">
              {card.sport || "Trading Card"}
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              {card.player}
            </h1>

            <p className="mt-2 text-xl text-stone-600">
              {card.year}{" "}
              {card.manufacturer || ""}{" "}
              {card.set}
            </p>

            {card.parallel && (
              <p className="mt-2 text-stone-600">
                {card.parallel}
              </p>
            )}

            <p className="mt-8 text-4xl font-bold">
              $
              {Number(
                card.price ?? 0
              ).toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>

            <div className="mt-4">
              <span
                className={`inline-block rounded-full px-4 py-2 text-sm font-bold text-white ${
                  card.status === "Sold"
                    ? "bg-red-700"
                    : card.status === "Reserved"
                    ? "bg-amber-500"
                    : "bg-green-700"
                }`}
              >
                {card.status || "Available"}
              </span>
            </div>

            <div className="mt-8 rounded-xl border bg-white p-6 shadow-sm">
              <h2 className="text-xl font-bold">
                Card Details
              </h2>

              <div className="mt-5 grid gap-5 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-stone-500">
                    Team
                  </p>
                  <p className="font-semibold">
                    {card.team || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">
                    Card Number
                  </p>
                  <p className="font-semibold">
                    {card.card_number || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">
                    Manufacturer
                  </p>
                  <p className="font-semibold">
                    {card.manufacturer || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">
                    Parallel
                  </p>
                  <p className="font-semibold">
                    {card.parallel || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">
                    Grade
                  </p>
                  <p className="font-semibold">
                    {card.grade || "Raw"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">
                    Grading Company
                  </p>
                  <p className="font-semibold">
                    {card.grading_company || "Raw"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">
                    Serial Number
                  </p>
                  <p className="font-semibold">
                    {card.serial_number || "—"}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">
                    Status
                  </p>
                  <p className="font-semibold">
                    {card.status || "Available"}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              {card.rookie && (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold">
                  Rookie
                </span>
              )}

              {card.autograph && (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold">
                  Autograph
                </span>
              )}

              {card.vintage && (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold">
                  Vintage
                </span>
              )}

              {card.rare_insert && (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold">
                  Rare Insert
                </span>
              )}

              {card.memorabilia && (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold">
                  Memorabilia
                </span>
              )}

              {card.serial_numbered && (
                <span className="rounded-full bg-stone-200 px-3 py-1 text-sm font-semibold">
                  Serial Numbered
                </span>
              )}
            </div>

            <div className="mt-8">
              <MakeOfferForm
                cardId={card.id}
                askingPrice={Number(card.price ?? 0)}
                minimumOffer={
                  card.minimum_offer == null
                    ? null
                    : Number(card.minimum_offer)
                }
                status={card.status || "Available"}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}