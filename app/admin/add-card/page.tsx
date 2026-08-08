"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from "next/navigation";

export default function AddCardPage() {
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState("");
  const [year, setYear] = useState("");
  const [cardSet, setCardSet] = useState("");
  const [grade, setGrade] = useState("Raw");
  const [price, setPrice] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/admin/login");
      return;
    }

    if (!imageFile) {
      setError("Please select a card image.");
      setSaving(false);
      return;
    }

    const fileExtension =
      imageFile.name.split(".").pop()?.toLowerCase() || "jpg";

    const safePlayerName = player
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const fileName = `${Date.now()}-${safePlayerName}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("card-images")
      .upload(fileName, imageFile, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      setError(`Image upload failed: ${uploadError.message}`);
      setSaving(false);
      return;
    }

    const { data: publicUrlData } = supabase.storage
      .from("card-images")
      .getPublicUrl(fileName);

    const imageUrl = publicUrlData.publicUrl;

    const { error: insertError } = await supabase
      .from("cards")
      .insert({
        player,
        team,
        year: Number(year),
        set: cardSet,
        grade,
        price: Number(price),
        image: imageUrl,
      });

    if (insertError) {
      setError(`Card could not be added: ${insertError.message}`);
      setSaving(false);
      return;
    }

    router.push("/admin/inventory");
    router.refresh();
  }

  return (
    <main className="min-h-screen px-8 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold">
          Add Card
        </h1>

        <p className="mt-3 text-stone-600">
          Add a new card to the Card Forge inventory.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-6 rounded-xl border bg-white p-8 shadow-sm"
        >
          <div>
            <label className="block text-sm font-semibold">
              Player
            </label>

            <input
              type="text"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Team
            </label>

            <input
              type="text"
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Year
            </label>

            <input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Set
            </label>

            <input
              type="text"
              value={cardSet}
              onChange={(e) => setCardSet(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Grade
            </label>

            <input
              type="text"
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Price
            </label>

            <input
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-semibold">
              Card Image
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                setImageFile(e.target.files?.[0] ?? null)
              }
              className="mt-2 block w-full rounded-lg border px-4 py-3"
              required
            />

            <p className="mt-2 text-sm text-stone-500">
              Use a JPG, PNG, or WebP image.
            </p>
          </div>

          {error && (
            <p className="text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-900 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving ? "Uploading..." : "Add Card"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin")}
              className="rounded-lg border px-6 py-3 font-semibold"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}