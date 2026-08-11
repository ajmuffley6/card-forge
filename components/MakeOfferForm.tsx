"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

type OfferType =
  | "Cash"
  | "Trade"
  | "Trade + Cash"
  | "Other";

type TradeCard = {
  sport: string;
  player: string;
  team: string;
  year: string;
  manufacturer: string;
  setName: string;
  cardNumber: string;
  parallel: string;

  rookie: boolean;
  autograph: boolean;
  memorabilia: boolean;

  serialNumbered: boolean;
  serialNumber: string;

  gradingCompany: string;
  grade: string;
  certificationNumber: string;

  estimatedValue: string;
  notes: string;

  frontImage: File | null;
  backImage: File | null;
};

function createEmptyTradeCard(): TradeCard {
  return {
    sport: "",
    player: "",
    team: "",
    year: "",
    manufacturer: "",
    setName: "",
    cardNumber: "",
    parallel: "",

    rookie: false,
    autograph: false,
    memorabilia: false,

    serialNumbered: false,
    serialNumber: "",

    gradingCompany: "Raw",
    grade: "Raw",
    certificationNumber: "",

    estimatedValue: "",
    notes: "",

    frontImage: null,
    backImage: null,
  };
}

export default function MakeOfferForm({
  cardId,
  askingPrice,
  minimumOffer,
  status,
}: {
  cardId: number;
  askingPrice: number;
  minimumOffer: number | null;
  status: string;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [open, setOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [offerType, setOfferType] =
    useState<OfferType>("Cash");

  const [cashAmount, setCashAmount] = useState("");
  const [message, setMessage] = useState("");
  const [tradeNotes, setTradeNotes] = useState("");

  const [tradeCards, setTradeCards] = useState<TradeCard[]>([]);

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const unavailable =
    status === "Sold" || status === "Reserved";

  const includesTrade =
    offerType === "Trade" ||
    offerType === "Trade + Cash";

  const includesCash =
    offerType === "Cash" ||
    offerType === "Trade + Cash";

  function updateTradeCard(
    index: number,
    updates: Partial<TradeCard>
  ) {
    setTradeCards((current) =>
      current.map((card, cardIndex) =>
        cardIndex === index
          ? {
              ...card,
              ...updates,
            }
          : card
      )
    );
  }

  function addTradeCard() {
    setTradeCards((current) => [
      ...current,
      createEmptyTradeCard(),
    ]);
  }

  function removeTradeCard(index: number) {
    setTradeCards((current) =>
      current.filter(
        (_, cardIndex) => cardIndex !== index
      )
    );
  }

  async function uploadTradeImage(
    file: File,
    offerId: number,
    cardIndex: number,
    side: "front" | "back"
  ) {
    const extension =
      file.name.split(".").pop()?.toLowerCase() ||
      "jpg";

    const path =
      `${offerId}/card-${cardIndex + 1}/` +
      `${Date.now()}-${side}.${extension}`;

    const { error: uploadError } =
      await supabase.storage
        .from("trade-offer-images")
        .upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });

    if (uploadError) {
      throw new Error(
        `Unable to upload ${side} image: ${uploadError.message}`
      );
    }

    return path;
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    try {
      if (!name.trim()) {
        throw new Error("Please enter your name.");
      }

      if (!email.trim()) {
        throw new Error("Please enter your email.");
      }

      const numericCashAmount =
        cashAmount === ""
          ? null
          : Number(cashAmount);

      if (
        includesCash &&
        (!numericCashAmount ||
          numericCashAmount <= 0)
      ) {
        throw new Error(
          "Please enter a valid cash offer amount."
        );
      }

      if (
        offerType === "Cash" &&
        minimumOffer !== null &&
        numericCashAmount !== null &&
        numericCashAmount < minimumOffer
      ) {
        throw new Error(
          `The minimum cash offer for this card is $${minimumOffer.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}.`
        );
      }

      if (
        includesTrade &&
        tradeCards.length === 0
      ) {
        throw new Error(
          "Please add at least one trade card."
        );
      }

      for (
        let index = 0;
        index < tradeCards.length;
        index++
      ) {
        const tradeCard = tradeCards[index];

        if (!tradeCard.player.trim()) {
          throw new Error(
            `Trade Card ${index + 1}: Player is required.`
          );
        }

        if (!tradeCard.frontImage) {
          throw new Error(
            `Trade Card ${index + 1}: Please upload a front image.`
          );
        }
      }

      const primaryOfferAmount =
        offerType === "Cash"
          ? numericCashAmount
          : offerType === "Trade + Cash"
          ? numericCashAmount
          : 0;

      const { data: offer, error: offerError } =
        await supabase
          .from("offers")
          .insert({
            card_id: cardId,
            name: name.trim(),
            email: email.trim(),

            offer_amount:
              primaryOfferAmount ?? 0,

            offer_type: offerType,

            cash_amount:
              includesCash
                ? numericCashAmount
                : null,

            trade_notes:
              tradeNotes.trim() || null,

            message:
              message.trim() || null,

            status: "Pending",
          })
          .select("id")
          .single();

      if (offerError || !offer) {
        throw new Error(
          offerError?.message ||
            "The offer could not be created."
        );
      }

      const offerId = Number(offer.id);

      for (
        let index = 0;
        index < tradeCards.length;
        index++
      ) {
        const tradeCard = tradeCards[index];

        let frontImagePath: string | null = null;
        let backImagePath: string | null = null;

        if (tradeCard.frontImage) {
          frontImagePath =
            await uploadTradeImage(
              tradeCard.frontImage,
              offerId,
              index,
              "front"
            );
        }

        if (tradeCard.backImage) {
          backImagePath =
            await uploadTradeImage(
              tradeCard.backImage,
              offerId,
              index,
              "back"
            );
        }

        const {
          error: tradeCardInsertError,
        } = await supabase
          .from("trade_offer_cards")
          .insert({
            offer_id: offerId,

            sport:
              tradeCard.sport || null,

            player:
              tradeCard.player.trim(),

            team:
              tradeCard.team.trim() || null,

            year:
              tradeCard.year === ""
                ? null
                : Number(tradeCard.year),

            manufacturer:
              tradeCard.manufacturer.trim() ||
              null,

            set_name:
              tradeCard.setName.trim() || null,

            card_number:
              tradeCard.cardNumber.trim() ||
              null,

            parallel:
              tradeCard.parallel.trim() || null,

            rookie:
              tradeCard.rookie,

            autograph:
              tradeCard.autograph,

            memorabilia:
              tradeCard.memorabilia,

            serial_numbered:
              tradeCard.serialNumbered,

            serial_number:
              tradeCard.serialNumber.trim() ||
              null,

            grading_company:
              tradeCard.gradingCompany ===
              "Raw"
                ? null
                : tradeCard.gradingCompany,

            grade:
              tradeCard.grade || "Raw",

            certification_number:
              tradeCard.certificationNumber.trim() ||
              null,

            customer_estimated_value:
              tradeCard.estimatedValue === ""
                ? null
                : Number(
                    tradeCard.estimatedValue
                  ),

            notes:
              tradeCard.notes.trim() || null,

            front_image_path:
              frontImagePath,

            back_image_path:
              backImagePath,
          });

        if (tradeCardInsertError) {
          throw new Error(
            `Trade Card ${
              index + 1
            } could not be saved: ${
              tradeCardInsertError.message
            }`
          );
        }
      }

      setSuccess(true);

      setName("");
      setEmail("");
      setOfferType("Cash");
      setCashAmount("");
      setMessage("");
      setTradeNotes("");
      setTradeCards([]);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "An unexpected error occurred."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (unavailable) {
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">
          {status === "Sold"
            ? "This card has been sold."
            : "This card is currently reserved."}
        </h2>

        <p className="mt-2 text-stone-600">
          Offers are not currently being accepted for this card.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold">
        Interested in this card?
      </h2>

      <p className="mt-2 text-stone-600">
        Asking price:{" "}
        <span className="font-semibold">
          $
          {askingPrice.toLocaleString(
            undefined,
            {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            }
          )}
        </span>
      </p>

      {!open && !success && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="mt-5 w-full rounded-lg bg-blue-900 px-6 py-3 font-bold text-white hover:bg-blue-800"
        >
          Make an Offer
        </button>
      )}

      {success && (
        <div className="mt-5 rounded-lg border bg-stone-50 p-5">
          <p className="font-bold">
            Offer submitted!
          </p>

          <p className="mt-2 text-sm text-stone-600">
            Card Forge has received your offer
            and trade information.
          </p>

          <button
            type="button"
            onClick={() => {
              setSuccess(false);
              setOpen(false);
            }}
            className="mt-4 text-sm font-semibold text-blue-900 hover:underline"
          >
            Close
          </button>
        </div>
      )}

      {open && !success && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-8"
        >
          <section>
            <h3 className="text-lg font-bold">
              Your Information
            </h3>

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold">
                  Name
                </label>

                <input
                  type="text"
                  value={name}
                  onChange={(e) =>
                    setName(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Email
                </label>

                <input
                  type="email"
                  value={email}
                  onChange={(e) =>
                    setEmail(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                  required
                />
              </div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold">
              Offer Type
            </h3>

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                "Cash",
                "Trade",
                "Trade + Cash",
                "Other",
              ].map((type) => (
                <label
                  key={type}
                  className={`cursor-pointer rounded-lg border p-4 ${
                    offerType === type
                      ? "border-blue-900 bg-blue-50"
                      : "bg-white"
                  }`}
                >
                  <input
                    type="radio"
                    name="offerType"
                    value={type}
                    checked={
                      offerType === type
                    }
                    onChange={() => {
                      setOfferType(
                        type as OfferType
                      );

                      if (
                        type === "Trade" ||
                        type ===
                          "Trade + Cash"
                      ) {
                        if (
                          tradeCards.length ===
                          0
                        ) {
                          setTradeCards([
                            createEmptyTradeCard(),
                          ]);
                        }
                      }
                    }}
                    className="mr-3"
                  />

                  <span className="font-semibold">
                    {type}
                  </span>
                </label>
              ))}
            </div>
          </section>

          {includesCash && (
            <section>
              <h3 className="text-lg font-bold">
                Cash
              </h3>

              <div className="mt-4">
                <label className="block text-sm font-semibold">
                  Cash Amount
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={cashAmount}
                  onChange={(e) =>
                    setCashAmount(
                      e.target.value
                    )
                  }
                  placeholder="0.00"
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />

                {offerType === "Cash" &&
                  minimumOffer !== null && (
                    <p className="mt-2 text-xs text-stone-500">
                      Minimum cash offer: $
                      {minimumOffer.toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  )}
              </div>
            </section>
          )}

          {includesTrade && (
            <section>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h3 className="text-lg font-bold">
                    Trade Cards
                  </h3>

                  <p className="mt-1 text-sm text-stone-500">
                    Add each card you are
                    offering in the trade.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={addTradeCard}
                  className="rounded-lg border px-4 py-2 text-sm font-bold"
                >
                  + Add Another Card
                </button>
              </div>

              <div className="mt-6 space-y-8">
                {tradeCards.map(
                  (tradeCard, index) => (
                    <div
                      key={index}
                      className="rounded-xl border bg-stone-50 p-5"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-bold">
                          Trade Card{" "}
                          {index + 1}
                        </h4>

                        {tradeCards.length >
                          1 && (
                          <button
                            type="button"
                            onClick={() =>
                              removeTradeCard(
                                index
                              )
                            }
                            className="text-sm font-semibold text-red-700"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-semibold">
                            Sport
                          </label>

                          <select
                            value={
                              tradeCard.sport
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  sport:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          >
                            <option value="">
                              Select sport
                            </option>
                            <option value="Football">
                              Football
                            </option>
                            <option value="Baseball">
                              Baseball
                            </option>
                            <option value="Basketball">
                              Basketball
                            </option>
                            <option value="Hockey">
                              Hockey
                            </option>
                            <option value="Soccer">
                              Soccer
                            </option>
                            <option value="Golf">
                              Golf
                            </option>
                            <option value="Racing">
                              Racing
                            </option>
                            <option value="UFC">
                              UFC
                            </option>
                            <option value="Pokemon">
                              Pokémon
                            </option>
                            <option value="Other">
                              Other
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Player
                          </label>

                          <input
                            value={
                              tradeCard.player
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  player:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Team
                          </label>

                          <input
                            value={
                              tradeCard.team
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  team:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Year
                          </label>

                          <input
                            type="number"
                            value={
                              tradeCard.year
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  year:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Manufacturer
                          </label>

                          <input
                            value={
                              tradeCard.manufacturer
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  manufacturer:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Set
                          </label>

                          <input
                            value={
                              tradeCard.setName
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  setName:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Card Number
                          </label>

                          <input
                            value={
                              tradeCard.cardNumber
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  cardNumber:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Parallel
                          </label>

                          <input
                            value={
                              tradeCard.parallel
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  parallel:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-2">
                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={
                              tradeCard.rookie
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  rookie:
                                    e.target
                                      .checked,
                                }
                              )
                            }
                          />
                          Rookie Card
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={
                              tradeCard.autograph
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  autograph:
                                    e.target
                                      .checked,
                                }
                              )
                            }
                          />
                          Autograph
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={
                              tradeCard.memorabilia
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  memorabilia:
                                    e.target
                                      .checked,
                                }
                              )
                            }
                          />
                          Memorabilia / Patch
                        </label>

                        <label className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={
                              tradeCard.serialNumbered
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  serialNumbered:
                                    e.target
                                      .checked,
                                }
                              )
                            }
                          />
                          Serial Numbered
                        </label>
                      </div>

                      {tradeCard.serialNumbered && (
                        <div className="mt-5">
                          <label className="block text-sm font-semibold">
                            Serial Number
                          </label>

                          <input
                            value={
                              tradeCard.serialNumber
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  serialNumber:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            placeholder="12/25"
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>
                      )}

                      <div className="mt-5 grid gap-4 md:grid-cols-3">
                        <div>
                          <label className="block text-sm font-semibold">
                            Grading Company
                          </label>

                          <select
                            value={
                              tradeCard.gradingCompany
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  gradingCompany:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          >
                            <option value="Raw">
                              Raw
                            </option>
                            <option value="PSA">
                              PSA
                            </option>
                            <option value="BGS">
                              BGS
                            </option>
                            <option value="SGC">
                              SGC
                            </option>
                            <option value="CGC">
                              CGC
                            </option>
                            <option value="Other">
                              Other
                            </option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Grade
                          </label>

                          <input
                            value={
                              tradeCard.grade
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  grade:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Certification Number
                          </label>

                          <input
                            value={
                              tradeCard.certificationNumber
                            }
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  certificationNumber:
                                    e.target
                                      .value,
                                }
                              )
                            }
                            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>
                      </div>

                      <div className="mt-5">
                        <label className="block text-sm font-semibold">
                          Your Estimated Value
                        </label>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={
                            tradeCard.estimatedValue
                          }
                          onChange={(e) =>
                            updateTradeCard(
                              index,
                              {
                                estimatedValue:
                                  e.target.value,
                              }
                            )
                          }
                          placeholder="0.00"
                          className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                        />
                      </div>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div>
                          <label className="block text-sm font-semibold">
                            Front Image
                          </label>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  frontImage:
                                    e.target
                                      .files?.[0] ??
                                    null,
                                }
                              )
                            }
                            className="mt-2 block w-full rounded-lg border bg-white px-4 py-3"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold">
                            Back Image
                          </label>

                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) =>
                              updateTradeCard(
                                index,
                                {
                                  backImage:
                                    e.target
                                      .files?.[0] ??
                                    null,
                                }
                              )
                            }
                            className="mt-2 block w-full rounded-lg border bg-white px-4 py-3"
                          />
                        </div>
                      </div>

                      <div className="mt-5">
                        <label className="block text-sm font-semibold">
                          Notes About This Card
                        </label>

                        <textarea
                          rows={3}
                          value={
                            tradeCard.notes
                          }
                          onChange={(e) =>
                            updateTradeCard(
                              index,
                              {
                                notes:
                                  e.target.value,
                              }
                            )
                          }
                          placeholder="Condition notes, slab damage, provenance, etc."
                          className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                        />
                      </div>
                    </div>
                  )
                )}
              </div>

              <div className="mt-6">
                <label className="block text-sm font-semibold">
                  General Trade Notes
                </label>

                <textarea
                  rows={3}
                  value={tradeNotes}
                  onChange={(e) =>
                    setTradeNotes(
                      e.target.value
                    )
                  }
                  placeholder="Anything else we should know about the trade?"
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>
            </section>
          )}

          {offerType === "Other" && (
            <section>
              <h3 className="text-lg font-bold">
                Describe Your Offer
              </h3>

              <p className="mt-2 text-sm text-stone-500">
                Tell us what you have in mind.
              </p>
            </section>
          )}

          <section>
            <label className="block text-sm font-semibold">
              Message
            </label>

            <textarea
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
              rows={4}
              placeholder="Optional message..."
              className="mt-2 w-full rounded-lg border px-4 py-3"
            />
          </section>

          {error && (
            <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-900 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {submitting
                ? "Submitting Offer..."
                : "Submit Offer"}
            </button>

            <button
              type="button"
              disabled={submitting}
              onClick={() => {
                setOpen(false);
                setError("");
              }}
              className="rounded-lg border px-6 py-3 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}