"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import { useParams, useRouter } from "next/navigation";

export default function EditCardPage() {
  const params = useParams();
  const router = useRouter();

  const id = params.id as string;

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );

  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState("");
  const [year, setYear] = useState("");
  const [cardSet, setCardSet] = useState("");
  const [grade, setGrade] = useState("");
  const [price, setPrice] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadCard() {
      const { data, error } = await supabase
        .from("cards")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setPlayer(data.player ?? "");
      setTeam(data.team ?? "");
      setYear(String(data.year ?? ""));
      setCardSet(data.set ?? "");
      setGrade(data.grade ?? "");
      setPrice(String(data.price ?? ""));

      setLoading(false);
    }

    loadCard();
  }, [id]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setSaving(true);
    setError("");

    const { error } = await supabase
      .from("cards")
      .update({
        player,
        team,
        year: Number(year),
        set: cardSet,
        grade,
        price: Number(price),
      })
      .eq("id", id);

    if (error) {
      setError(error.message);
      setSaving(false);
      return;
    }

    router.push("/admin/inventory");
    router.refresh();
  }

  if (loading) {
    return (
      <main className="min-h-screen px-8 py-12">
        <p>Loading card...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-8 py-12">
      <div className="mx-auto max-w-2xl">
        <h1 className="text-4xl font-bold">
          Edit Card
        </h1>

        <p className="mt-3 text-stone-600">
          Update this card&apos;s inventory information.
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
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="mt-2 w-full rounded-lg border px-4 py-3"
              required
            />
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
              {saving ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/admin/inventory")}
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