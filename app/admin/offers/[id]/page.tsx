import OfferCollaboration from "./OfferCollaboration";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import OfferActions from "../OfferActions";

function money(value: number | null | undefined) {
  return Number(value ?? 0).toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

function Detail({
  label,
  value,
}: {
  label: string;
  value:
    | string
    | number
    | null
    | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-stone-400">
        {label}
      </p>

      <p className="mt-1 font-semibold">
        {value === null ||
        value === undefined ||
        value === ""
          ? "—"
          : value}
      </p>
    </div>
  );
}

export default async function OfferReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data: offer, error } = await supabase
    .from("offers")
    .select(`
      id,
      card_id,
      name,
      email,
      offer_amount,
      offer_type,
      cash_amount,
      trade_notes,
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
      ),
      trade_offer_cards (
        id,
        sport,
        player,
        team,
        year,
        manufacturer,
        set_name,
        card_number,
        parallel,
        rookie,
        autograph,
        memorabilia,
        serial_numbered,
        serial_number,
        grading_company,
        grade,
        certification_number,
        customer_estimated_value,
        admin_estimated_value,
        notes,
        front_image_path,
        back_image_path
      ),
      offer_internal_notes (
        id,
        author_email,
        note,
        created_at
      )
    `)
    .eq("id", id)
    .single();

  if (error || !offer) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-8 py-12">
        <div className="mx-auto max-w-6xl">
          <h1 className="text-4xl font-bold">
            Offer Not Found
          </h1>

          <Link
            href="/admin/offers"
            className="mt-6 inline-block font-semibold text-blue-900 hover:underline"
          >
            ← Back to Offers
          </Link>
        </div>
      </main>
    );
  }

  const card = Array.isArray(offer.cards)
    ? offer.cards[0]
    : offer.cards;

  const tradeCardsWithImages = await Promise.all(
    (offer.trade_offer_cards ?? []).map(
      async (tradeCard) => {
        let frontImageUrl: string | null = null;
        let backImageUrl: string | null = null;

        if (tradeCard.front_image_path) {
          const { data } = await supabase.storage
            .from("trade-offer-images")
            .createSignedUrl(
              tradeCard.front_image_path,
              60 * 60
            );

          frontImageUrl =
            data?.signedUrl ?? null;
        }

        if (tradeCard.back_image_path) {
          const { data } = await supabase.storage
            .from("trade-offer-images")
            .createSignedUrl(
              tradeCard.back_image_path,
              60 * 60
            );

          backImageUrl =
            data?.signedUrl ?? null;
        }

        return {
          ...tradeCard,
          frontImageUrl,
          backImageUrl,
        };
      }
    )
  );

  const tradeValue =
    tradeCardsWithImages.reduce(
      (total, tradeCard) =>
        total +
        Number(
          tradeCard.customer_estimated_value ?? 0
        ),
      0
    );

  const adminTradeValue =
    tradeCardsWithImages.reduce(
      (total, tradeCard) =>
        total +
        Number(
          tradeCard.admin_estimated_value ?? 0
        ),
      0
    );

  const offerType =
    offer.offer_type || "Cash";

  const cashAmount = Number(
    offer.cash_amount ??
      offer.offer_amount ??
      0
  );

  const proposedValue =
    offerType === "Trade"
      ? tradeValue
      : offerType === "Trade + Cash"
      ? tradeValue + cashAmount
      : cashAmount;

  const adminProposedValue =
    offerType === "Trade"
      ? adminTradeValue
      : offerType === "Trade + Cash"
      ? adminTradeValue + cashAmount
      : cashAmount;

  const askingPrice = Number(
    card?.price ?? 0
  );

  const customerDifference =
    proposedValue - askingPrice;

  const adminDifference =
    adminProposedValue - askingPrice;

  const internalNotes = [
    ...(offer.offer_internal_notes ?? []),
  ].sort(
    (a, b) =>
      new Date(a.created_at).getTime() -
      new Date(b.created_at).getTime()
  );

  return (
    <main className="min-h-screen bg-[var(--background)] px-8 py-12">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/admin/offers"
          className="font-semibold text-blue-900 hover:underline"
        >
          ← Back to Offer Center
        </Link>

        <div className="mt-8 flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-900">
              Offer #{offer.id}
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Review Offer
            </h1>

            <p className="mt-3 text-stone-500">
              Submitted{" "}
              {new Date(
                offer.created_at
              ).toLocaleString()}
            </p>
          </div>

          <span
            className={`rounded-full px-4 py-2 text-sm font-bold ${
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
        </div>

        {/* REQUESTED CARD */}
        <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
            Card Requested
          </p>

          <div className="mt-6 flex flex-col gap-6 md:flex-row">
            {card?.image && (
              <img
                src={card.image}
                alt={card.player}
                className="h-60 w-44 rounded-xl border bg-stone-50 object-contain"
              />
            )}

            <div className="flex-1">
              <h2 className="text-3xl font-bold">
                {card?.player ||
                  "Unknown Card"}
              </h2>

              <p className="mt-2 text-stone-500">
                {card?.year} • {card?.set}
              </p>

              <div className="mt-6 grid gap-6 sm:grid-cols-2">
                <div>
                  <p className="text-sm text-stone-500">
                    Asking Price
                  </p>

                  <p className="mt-1 text-2xl font-bold">
                    {money(card?.price)}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-stone-500">
                    Owner
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {card?.owner || "—"}
                  </p>
                </div>
              </div>

              {card?.id && (
                <Link
                  href={`/admin/cards/${card.id}`}
                  className="mt-6 inline-block font-semibold text-blue-900 hover:underline"
                >
                  Edit Inventory Card →
                </Link>
              )}
            </div>
          </div>
        </section>

        {/* CUSTOMER + PROPOSAL */}
        <section className="mt-8 grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
              Customer
            </p>

            <h2 className="mt-4 text-2xl font-bold">
              {offer.name}
            </h2>

            <a
              href={`mailto:${offer.email}`}
              className="mt-1 inline-block text-blue-900 hover:underline"
            >
              {offer.email}
            </a>

            {offer.message && (
              <div className="mt-6 rounded-xl bg-stone-50 p-5">
                <p className="text-sm font-semibold">
                  Message
                </p>

                <p className="mt-2 text-stone-600">
                  {offer.message}
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
              Proposal
            </p>

            <h2 className="mt-4 text-2xl font-bold">
              {offerType}
            </h2>

            {cashAmount > 0 && (
              <div className="mt-5">
                <p className="text-sm text-stone-500">
                  Cash Included
                </p>

                <p className="text-2xl font-bold">
                  {money(cashAmount)}
                </p>
              </div>
            )}

            {tradeCardsWithImages.length >
              0 && (
              <div className="mt-5">
                <p className="text-sm text-stone-500">
                  Customer-Estimated Trade Value
                </p>

                <p className="text-2xl font-bold">
                  {money(tradeValue)}
                </p>
              </div>
            )}

            <div className="mt-6 border-t pt-5">
              <p className="text-sm text-stone-500">
                Customer Proposed Total
              </p>

              <p className="mt-1 text-3xl font-bold text-blue-900">
                {money(proposedValue)}
              </p>

              <p
                className={`mt-2 text-sm font-semibold ${
                  customerDifference >= 0
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {customerDifference >= 0
                  ? "+"
                  : ""}
                {money(
                  customerDifference
                )}{" "}
                vs. asking
              </p>
            </div>

            {tradeCardsWithImages.length >
              0 && (
              <div className="mt-6 border-t pt-5">
                <p className="text-sm text-stone-500">
                  Card Forge Valuation
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {money(
                    adminProposedValue
                  )}
                </p>

                <p
                  className={`mt-2 text-sm font-semibold ${
                    adminDifference >= 0
                      ? "text-green-700"
                      : "text-red-700"
                  }`}
                >
                  {adminDifference >= 0
                    ? "+"
                    : ""}
                  {money(
                    adminDifference
                  )}{" "}
                  vs. asking
                </p>

                <p className="mt-2 text-xs text-stone-400">
                  Based on saved Admin
                  valuations plus any cash
                  included.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* TRADE NOTES */}
        {offer.trade_notes && (
          <section className="mt-8 rounded-2xl border bg-white p-6 shadow-sm">
            <h2 className="text-xl font-bold">
              Trade Notes
            </h2>

            <p className="mt-3 text-stone-600">
              {offer.trade_notes}
            </p>
          </section>
        )}

        {/* TRADE CARDS */}
        {tradeCardsWithImages.length >
          0 && (
          <section className="mt-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
              Trade Package
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Cards Offered
            </h2>

            <div className="mt-6 space-y-8">
              {tradeCardsWithImages.map(
                (tradeCard, index) => (
                  <article
                    key={tradeCard.id}
                    className="rounded-2xl border bg-white p-6 shadow-sm"
                  >
                    <p className="text-sm font-bold uppercase tracking-wide text-blue-900">
                      Trade Card {index + 1}
                    </p>

                    <h3 className="mt-2 text-3xl font-bold">
                      {tradeCard.player}
                    </h3>

                    <p className="mt-2 text-stone-500">
                      {[
                        tradeCard.year,
                        tradeCard.manufacturer,
                        tradeCard.set_name,
                      ]
                        .filter(Boolean)
                        .join(" • ")}
                    </p>

                    <div className="mt-8 grid gap-6 md:grid-cols-2">
                      <div>
                        <p className="mb-3 font-semibold">
                          Front
                        </p>

                        {tradeCard.frontImageUrl ? (
                          <a
                            href={
                              tradeCard.frontImageUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={
                                tradeCard.frontImageUrl
                              }
                              alt={`${tradeCard.player} front`}
                              className="h-[420px] w-full rounded-xl border bg-stone-50 object-contain"
                            />
                          </a>
                        ) : (
                          <div className="flex h-[420px] items-center justify-center rounded-xl border bg-stone-50 text-stone-400">
                            No front image
                          </div>
                        )}
                      </div>

                      <div>
                        <p className="mb-3 font-semibold">
                          Back
                        </p>

                        {tradeCard.backImageUrl ? (
                          <a
                            href={
                              tradeCard.backImageUrl
                            }
                            target="_blank"
                            rel="noreferrer"
                          >
                            <img
                              src={
                                tradeCard.backImageUrl
                              }
                              alt={`${tradeCard.player} back`}
                              className="h-[420px] w-full rounded-xl border bg-stone-50 object-contain"
                            />
                          </a>
                        ) : (
                          <div className="flex h-[420px] items-center justify-center rounded-xl border bg-stone-50 text-stone-400">
                            No back image
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                      <Detail
                        label="Sport"
                        value={
                          tradeCard.sport
                        }
                      />

                      <Detail
                        label="Team"
                        value={
                          tradeCard.team
                        }
                      />

                      <Detail
                        label="Card Number"
                        value={
                          tradeCard.card_number
                        }
                      />

                      <Detail
                        label="Parallel"
                        value={
                          tradeCard.parallel
                        }
                      />

                      <Detail
                        label="Grading Company"
                        value={
                          tradeCard.grading_company ||
                          "Raw"
                        }
                      />

                      <Detail
                        label="Grade"
                        value={
                          tradeCard.grade ||
                          "Raw"
                        }
                      />

                      <Detail
                        label="Certification #"
                        value={
                          tradeCard.certification_number
                        }
                      />

                      <Detail
                        label="Serial Number"
                        value={
                          tradeCard.serial_number
                        }
                      />

                      <Detail
                        label="Customer Value"
                        value={
                          tradeCard.customer_estimated_value ==
                          null
                            ? null
                            : money(
                                Number(
                                  tradeCard.customer_estimated_value
                                )
                              )
                        }
                      />

                      <Detail
                        label="Card Forge Value"
                        value={
                          tradeCard.admin_estimated_value ==
                          null
                            ? "Not valued yet"
                            : money(
                                Number(
                                  tradeCard.admin_estimated_value
                                )
                              )
                        }
                      />
                    </div>

                    <div className="mt-6 flex flex-wrap gap-2">
                      {tradeCard.rookie && (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold">
                          Rookie
                        </span>
                      )}

                      {tradeCard.autograph && (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold">
                          Autograph
                        </span>
                      )}

                      {tradeCard.memorabilia && (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold">
                          Memorabilia
                        </span>
                      )}

                      {tradeCard.serial_numbered && (
                        <span className="rounded-full bg-stone-100 px-3 py-1 text-sm font-semibold">
                          Serial Numbered
                        </span>
                      )}
                    </div>

                    {tradeCard.notes && (
                      <div className="mt-6 rounded-xl bg-stone-50 p-5">
                        <p className="font-semibold">
                          Customer Notes
                        </p>

                        <p className="mt-2 text-stone-600">
                          {tradeCard.notes}
                        </p>
                      </div>
                    )}
                  </article>
                )
              )}
            </div>
          </section>
        )}

        {/* INTERNAL ADMIN REVIEW */}
        <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
            Card Forge Team
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Internal Review
          </h2>

          <p className="mt-2 text-stone-500">
            Admin valuations and notes are
            private and are never shown to
            customers.
          </p>

          <div className="mt-6">
            <OfferCollaboration
              offerId={offer.id}
              userEmail={
                user.email ??
                "Unknown Admin"
              }
              tradeCards={tradeCardsWithImages.map(
                (tradeCard) => ({
                  id: tradeCard.id,
                  player:
                    tradeCard.player,
                  adminEstimatedValue:
                    tradeCard.admin_estimated_value ==
                    null
                      ? null
                      : Number(
                          tradeCard.admin_estimated_value
                        ),
                })
              )}
            />
          </div>

          <div className="mt-8 border-t pt-8">
            <h3 className="text-xl font-bold">
              Team Notes
            </h3>

            <p className="mt-2 text-sm text-stone-500">
              Discussion between Card Forge
              admins about this offer.
            </p>

            <div className="mt-5 space-y-4">
              {internalNotes.map(
                (note) => (
                  <div
                    key={note.id}
                    className="rounded-xl bg-stone-50 p-5"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className="font-semibold">
                        {
                          note.author_email
                        }
                      </p>

                      <p className="text-xs text-stone-400">
                        {new Date(
                          note.created_at
                        ).toLocaleString()}
                      </p>
                    </div>

                    <p className="mt-3 text-stone-600">
                      {note.note}
                    </p>
                  </div>
                )
              )}

              {internalNotes.length ===
                0 && (
                <p className="rounded-xl bg-stone-50 p-5 text-sm text-stone-500">
                  No internal notes yet.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* DECISION */}
        <section className="mt-10 rounded-2xl border bg-white p-6 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
            Decision
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            Respond to Offer
          </h2>

          <div className="mt-6">
            <OfferActions
              offerId={offer.id}
              cardId={offer.card_id}
              currentStatus={
                offer.status
              }
            />
          </div>
        </section>
      </div>
    </main>
  );
}