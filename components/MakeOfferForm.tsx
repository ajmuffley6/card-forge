"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

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
  const [offerAmount, setOfferAmount] = useState("");
  const [message, setMessage] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const unavailable =
    status === "Sold" || status === "Reserved";

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    setSubmitting(true);
    setError("");

    const numericOffer = Number(offerAmount);

    if (!numericOffer || numericOffer <= 0) {
      setError("Please enter a valid offer amount.");
      setSubmitting(false);
      return;
    }

    if (
      minimumOffer !== null &&
      numericOffer < minimumOffer
    ) {
      setError(
        `The minimum offer for this card is $${minimumOffer.toLocaleString(
          undefined,
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )}.`
      );

      setSubmitting(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("offers")
      .insert({
        card_id: cardId,
        name: name.trim(),
        email: email.trim(),
        offer_amount: numericOffer,
        message: message.trim() || null,
        status: "Pending",
      });

    if (insertError) {
      setError(
        `Your offer could not be submitted: ${insertError.message}`
      );

      setSubmitting(false);
      return;
    }

    setSuccess(true);
    setSubmitting(false);

    setName("");
    setEmail("");
    setOfferAmount("");
    setMessage("");
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
          {askingPrice.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
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
            Card Forge has received your offer.
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
          className="mt-6 space-y-5"
        >
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

          <div>
            <label className="block text-sm font-semibold">
              Offer Amount
            </label>

            <input
              type="number"
              min="0.01"
              step="0.01"
              value={offerAmount}
              onChange={(e) =>
                setOfferAmount(e.target.value)
              }
              placeholder="0.00"
              className="mt-2 w-full rounded-lg border px-4 py-3"
              required
            />

            {minimumOffer !== null && (
              <p className="mt-2 text-xs text-stone-500">
                Minimum offer: $
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

          <div>
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
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-900 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {submitting
                ? "Submitting..."
                : "Submit Offer"}
            </button>

            <button
              type="button"
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