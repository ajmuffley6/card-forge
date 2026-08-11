"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function OfferActions({
  offerId,
  cardId,
  currentStatus,
}: {
  offerId: number;
  cardId: number;
  currentStatus: string;
}) {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [updating, setUpdating] = useState(false);
  const [showCounter, setShowCounter] = useState(false);
  const [counterAmount, setCounterAmount] = useState("");
  const [error, setError] = useState("");

  async function acceptOffer() {
    setUpdating(true);
    setError("");

    const { error: offerError } = await supabase
      .from("offers")
      .update({
        status: "Accepted",
        counter_amount: null,
      })
      .eq("id", offerId);

    if (offerError) {
      setError(offerError.message);
      setUpdating(false);
      return;
    }

    const { error: cardError } = await supabase
      .from("cards")
      .update({
        status: "Reserved",
      })
      .eq("id", cardId);

    if (cardError) {
      setError(
        `Offer accepted, but card could not be reserved: ${cardError.message}`
      );
      setUpdating(false);
      return;
    }

    router.refresh();
    setUpdating(false);
  }

  async function declineOffer() {
    setUpdating(true);
    setError("");

    const { error: updateError } = await supabase
      .from("offers")
      .update({
        status: "Declined",
        counter_amount: null,
      })
      .eq("id", offerId);

    if (updateError) {
      setError(updateError.message);
      setUpdating(false);
      return;
    }

    router.refresh();
    setUpdating(false);
  }

  async function submitCounter() {
    const amount = Number(counterAmount);

    if (!amount || amount <= 0) {
      setError("Enter a valid counter offer amount.");
      return;
    }

    setUpdating(true);
    setError("");

    const { error: updateError } = await supabase
      .from("offers")
      .update({
        status: "Countered",
        counter_amount: amount,
      })
      .eq("id", offerId);

    if (updateError) {
      setError(updateError.message);
      setUpdating(false);
      return;
    }

    setShowCounter(false);
    router.refresh();
    setUpdating(false);
  }

  if (currentStatus !== "Pending") {
    return (
      <div>
        <p className="text-sm text-stone-500">
          Offer already reviewed.
        </p>

        {error && (
          <p className="mt-2 text-sm text-red-600">
            {error}
          </p>
        )}
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          disabled={updating}
          onClick={acceptOffer}
          className="rounded-lg bg-green-700 px-4 py-2 text-sm font-bold text-white hover:bg-green-800 disabled:opacity-50"
        >
          {updating ? "Updating..." : "Accept"}
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={() => {
            setShowCounter(true);
            setError("");
          }}
          className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
        >
          Counter
        </button>

        <button
          type="button"
          disabled={updating}
          onClick={declineOffer}
          className="rounded-lg bg-red-700 px-4 py-2 text-sm font-bold text-white hover:bg-red-800 disabled:opacity-50"
        >
          Decline
        </button>
      </div>

      {showCounter && (
        <div className="mt-4 rounded-lg border bg-stone-50 p-4">
          <label className="block text-sm font-semibold">
            Counter Offer
          </label>

          <input
            type="number"
            min="0.01"
            step="0.01"
            value={counterAmount}
            onChange={(e) =>
              setCounterAmount(e.target.value)
            }
            placeholder="0.00"
            className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
          />

          <div className="mt-3 flex gap-3">
            <button
              type="button"
              disabled={updating}
              onClick={submitCounter}
              className="rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              Send Counter
            </button>

            <button
              type="button"
              disabled={updating}
              onClick={() => {
                setShowCounter(false);
                setCounterAmount("");
                setError("");
              }}
              className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 text-sm font-semibold text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}