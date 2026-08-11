"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

type TradeCardValue = {
  id: number;
  player: string;
  adminEstimatedValue: number | null;
};

export default function OfferCollaboration({
  offerId,
  userEmail,
  tradeCards,
}: {
  offerId: number;
  userEmail: string;
  tradeCards: TradeCardValue[];
}) {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [note, setNote] = useState("");
  const [savingNote, setSavingNote] =
    useState(false);

  const [values, setValues] = useState<
    Record<number, string>
  >(
    Object.fromEntries(
      tradeCards.map((card) => [
        card.id,
        card.adminEstimatedValue == null
          ? ""
          : String(card.adminEstimatedValue),
      ])
    )
  );

  const [savingValueId, setSavingValueId] =
    useState<number | null>(null);

  const [error, setError] = useState("");

  async function saveValue(cardId: number) {
    setSavingValueId(cardId);
    setError("");

    const value = values[cardId];

    const numericValue =
      value === "" ? null : Number(value);

    if (
      numericValue !== null &&
      (Number.isNaN(numericValue) ||
        numericValue < 0)
    ) {
      setError(
        "Enter a valid admin valuation."
      );
      setSavingValueId(null);
      return;
    }

    const { error: updateError } =
      await supabase
        .from("trade_offer_cards")
        .update({
          admin_estimated_value:
            numericValue,
        })
        .eq("id", cardId);

    if (updateError) {
      setError(updateError.message);
      setSavingValueId(null);
      return;
    }

    router.refresh();
    setSavingValueId(null);
  }

  async function addNote() {
    if (!note.trim()) {
      setError(
        "Enter a note before saving."
      );
      return;
    }

    setSavingNote(true);
    setError("");

    const { error: insertError } =
      await supabase
        .from("offer_internal_notes")
        .insert({
          offer_id: offerId,
          author_email: userEmail,
          note: note.trim(),
        });

    if (insertError) {
      setError(insertError.message);
      setSavingNote(false);
      return;
    }

    setNote("");
    router.refresh();
    setSavingNote(false);
  }

  return (
    <div className="space-y-8">
      {tradeCards.length > 0 && (
        <section>
          <h3 className="text-xl font-bold">
            Admin Valuation
          </h3>

          <p className="mt-2 text-sm text-stone-500">
            Enter Card Forge&apos;s value for each trade card.
          </p>

          <div className="mt-5 space-y-4">
            {tradeCards.map((card) => (
              <div
                key={card.id}
                className="rounded-xl border bg-stone-50 p-4"
              >
                <p className="font-semibold">
                  {card.player}
                </p>

                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={
                      values[card.id] ?? ""
                    }
                    onChange={(e) =>
                      setValues((current) => ({
                        ...current,
                        [card.id]:
                          e.target.value,
                      }))
                    }
                    placeholder="Admin value"
                    className="flex-1 rounded-lg border bg-white px-4 py-3"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      saveValue(card.id)
                    }
                    disabled={
                      savingValueId === card.id
                    }
                    className="rounded-lg bg-blue-900 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
                  >
                    {savingValueId === card.id
                      ? "Saving..."
                      : "Save Value"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="border-t pt-8">
        <h3 className="text-xl font-bold">
          Internal Notes
        </h3>

        <p className="mt-2 text-sm text-stone-500">
          Only Card Forge admins can see these notes.
        </p>

        <textarea
          rows={4}
          value={note}
          onChange={(e) =>
            setNote(e.target.value)
          }
          placeholder="Add your thoughts on this offer..."
          className="mt-5 w-full rounded-lg border px-4 py-3"
        />

        <button
          type="button"
          onClick={addNote}
          disabled={savingNote}
          className="mt-3 rounded-lg bg-blue-900 px-5 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          {savingNote
            ? "Saving..."
            : "Add Internal Note"}
        </button>
      </section>

      {error && (
        <p className="rounded-lg bg-red-50 p-4 text-sm font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}