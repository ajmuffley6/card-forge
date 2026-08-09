"use client";

import { useState } from "react";

export default function CardImageViewer({
  frontImage,
  backImage,
  altText,
}: {
  frontImage: string | null;
  backImage: string | null;
  altText: string;
}) {
  const [side, setSide] = useState<"front" | "back">("front");

  const activeImage =
    side === "front"
      ? frontImage
      : backImage || frontImage;

  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex justify-center gap-3">
        <button
          type="button"
          onClick={() => setSide("front")}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            side === "front"
              ? "bg-blue-900 text-white"
              : "border bg-white text-stone-800"
          }`}
        >
          Front
        </button>

        <button
          type="button"
          onClick={() => setSide("back")}
          disabled={!backImage}
          className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
            side === "back"
              ? "bg-blue-900 text-white"
              : "border bg-white text-stone-800"
          } ${
            !backImage
              ? "cursor-not-allowed opacity-40"
              : ""
          }`}
        >
          Back
        </button>
      </div>

      <div className="mt-5 flex min-h-[500px] items-center justify-center rounded-xl bg-stone-100 p-5">
        {activeImage ? (
          <img
            src={activeImage}
            alt={`${altText} ${side}`}
            className="max-h-[650px] w-full object-contain"
          />
        ) : (
          <p className="text-stone-500">
            No image available.
          </p>
        )}
      </div>

      <p className="mt-4 text-center text-sm text-stone-500">
        Viewing {side === "front" ? "front" : "back"} of card
      </p>
    </div>
  );
}