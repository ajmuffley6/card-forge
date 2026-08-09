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

  const [sport, setSport] = useState("");
  const [player, setPlayer] = useState("");
  const [team, setTeam] = useState("");
  const [year, setYear] = useState("");
  const [manufacturer, setManufacturer] = useState("");
  const [cardSet, setCardSet] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [parallel, setParallel] = useState("");

  const [rookie, setRookie] = useState(false);
  const [autograph, setAutograph] = useState(false);
  const [vintage, setVintage] = useState(false);
  const [rareInsert, setRareInsert] = useState(false);
  const [memorabilia, setMemorabilia] = useState(false);
  const [serialNumbered, setSerialNumbered] = useState(false);

  const [serialNumber, setSerialNumber] = useState("");

  const [gradingCompany, setGradingCompany] = useState("Raw");
  const [grade, setGrade] = useState("Raw");
  const [certificationNumber, setCertificationNumber] = useState("");

  const [purchasePrice, setPurchasePrice] = useState("");
  const [price, setPrice] = useState("");
  const [minimumOffer, setMinimumOffer] = useState("");

  const [owner, setOwner] = useState("");
  const [status, setStatus] = useState("Available");

  const [frontImageFile, setFrontImageFile] = useState<File | null>(null);
  const [backImageFile, setBackImageFile] = useState<File | null>(null);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  async function uploadImage(
    file: File,
    label: "front" | "back"
  ) {
    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const safePlayerName = player
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const fileName = `${Date.now()}-${safePlayerName}-${label}.${fileExtension}`;

    const { error: uploadError } = await supabase.storage
      .from("card-images")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    const { data } = supabase.storage
      .from("card-images")
      .getPublicUrl(fileName);

    return data.publicUrl;
  }

  async function handleSubmit(
    e: React.FormEvent<HTMLFormElement>
  ) {
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

    if (!frontImageFile) {
      setError("Please select a front image.");
      setSaving(false);
      return;
    }

    try {
      const frontImageUrl = await uploadImage(
        frontImageFile,
        "front"
      );

      let backImageUrl: string | null = null;

      if (backImageFile) {
        backImageUrl = await uploadImage(
          backImageFile,
          "back"
        );
      }

      const { error: insertError } = await supabase
        .from("cards")
        .insert({
          sport: sport || null,
          player,
          team,
          year: Number(year),
          manufacturer: manufacturer || null,
          set: cardSet,
          card_number: cardNumber || null,
          parallel: parallel || null,

          rookie,
          autograph,
          vintage,
          rare_insert: rareInsert,
          memorabilia,
          serial_numbered: serialNumbered,
          serial_number: serialNumber || null,

          grading_company:
            gradingCompany === "Raw"
              ? null
              : gradingCompany,

          grade,

          certification_number:
            certificationNumber || null,

          purchase_price:
            purchasePrice === ""
              ? null
              : Number(purchasePrice),

          price: Number(price),

          minimum_offer:
            minimumOffer === ""
              ? null
              : Number(minimumOffer),

          owner: owner || null,
          status,

          image: frontImageUrl,
          back_image: backImageUrl,
        });

      if (insertError) {
        setError(
          `Card could not be added: ${insertError.message}`
        );
        setSaving(false);
        return;
      }

      router.push("/admin/inventory");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred.";

      setError(message);
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen px-8 py-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-bold">
          Add Card
        </h1>

        <p className="mt-3 text-stone-600">
          Add a new card to the Card Forge inventory.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-10 space-y-10 rounded-xl border bg-white p-8 shadow-sm"
        >
          <section>
            <h2 className="text-xl font-bold">
              Basic Information
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold">
                  Sport
                </label>

                <select
                  value={sport}
                  onChange={(e) =>
                    setSport(e.target.value)
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
                  value={player}
                  onChange={(e) =>
                    setPlayer(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Team
                </label>

                <input
                  value={team}
                  onChange={(e) =>
                    setTeam(e.target.value)
                  }
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
                  onChange={(e) =>
                    setYear(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Manufacturer
                </label>

                <input
                  value={manufacturer}
                  onChange={(e) =>
                    setManufacturer(e.target.value)
                  }
                  placeholder="Topps, Panini, Upper Deck..."
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Set
                </label>

                <input
                  value={cardSet}
                  onChange={(e) =>
                    setCardSet(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Card Number
                </label>

                <input
                  value={cardNumber}
                  onChange={(e) =>
                    setCardNumber(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Parallel
                </label>

                <input
                  value={parallel}
                  onChange={(e) =>
                    setParallel(e.target.value)
                  }
                  placeholder="Silver, Gold, Blue Ice..."
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              Card Attributes
            </h2>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                ["Rookie Card", rookie, setRookie],
                ["Autograph", autograph, setAutograph],
                ["Vintage", vintage, setVintage],
                ["Rare Insert", rareInsert, setRareInsert],
                ["Memorabilia / Patch", memorabilia, setMemorabilia],
                ["Serial Numbered", serialNumbered, setSerialNumbered],
              ].map(([label, value, setter]) => {
                const typedSetter = setter as React.Dispatch<
                  React.SetStateAction<boolean>
                >;

                return (
                  <label
                    key={String(label)}
                    className="flex items-center gap-3"
                  >
                    <input
                      type="checkbox"
                      checked={Boolean(value)}
                      onChange={(e) =>
                        typedSetter(e.target.checked)
                      }
                    />
                    {String(label)}
                  </label>
                );
              })}
            </div>

            {serialNumbered && (
              <div className="mt-5">
                <label className="block text-sm font-semibold">
                  Serial Number
                </label>

                <input
                  value={serialNumber}
                  onChange={(e) =>
                    setSerialNumber(e.target.value)
                  }
                  placeholder="12/25"
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>
            )}
          </section>

          <section>
            <h2 className="text-xl font-bold">
              Grading
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold">
                  Grading Company
                </label>

                <select
                  value={gradingCompany}
                  onChange={(e) =>
                    setGradingCompany(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                >
                  <option value="Raw">Raw</option>
                  <option value="PSA">PSA</option>
                  <option value="BGS">BGS</option>
                  <option value="SGC">SGC</option>
                  <option value="CGC">CGC</option>
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
                  value={grade}
                  onChange={(e) =>
                    setGrade(e.target.value)
                  }
                  placeholder="Raw, 10, 9.5..."
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Certification Number
                </label>

                <input
                  value={certificationNumber}
                  onChange={(e) =>
                    setCertificationNumber(
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              Pricing
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-3">
              <div>
                <label className="block text-sm font-semibold">
                  Purchase Price
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={purchasePrice}
                  onChange={(e) =>
                    setPurchasePrice(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Asking Price
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={price}
                  onChange={(e) =>
                    setPrice(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Minimum Offer
                </label>

                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={minimumOffer}
                  onChange={(e) =>
                    setMinimumOffer(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              Ownership & Status
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold">
                  Owner
                </label>

                <select
                  value={owner}
                  onChange={(e) =>
                    setOwner(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                >
                  <option value="">
                    Select owner
                  </option>
                  <option value="AJ">AJ</option>
                  <option value="Casey">
                    Casey
                  </option>
                  <option value="Bogar">
                    Bogar
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(e) =>
                    setStatus(e.target.value)
                  }
                  className="mt-2 w-full rounded-lg border bg-white px-4 py-3"
                >
                  <option value="Available">
                    Available
                  </option>
                  <option value="Reserved">
                    Reserved
                  </option>
                  <option value="Sold">
                    Sold
                  </option>
                </select>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-bold">
              Images
            </h2>

            <div className="mt-5 grid gap-5 md:grid-cols-2">
              <div>
                <label className="block text-sm font-semibold">
                  Front Image
                </label>

                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    setFrontImageFile(
                      e.target.files?.[0] ?? null
                    )
                  }
                  className="mt-2 block w-full rounded-lg border px-4 py-3"
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
                    setBackImageFile(
                      e.target.files?.[0] ?? null
                    )
                  }
                  className="mt-2 block w-full rounded-lg border px-4 py-3"
                />
              </div>
            </div>
          </section>

          {error && (
            <p className="font-semibold text-red-600">
              {error}
            </p>
          )}

          <div className="flex gap-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-blue-900 px-6 py-3 font-bold text-white hover:bg-blue-800 disabled:opacity-50"
            >
              {saving
                ? "Uploading Card..."
                : "Add Card"}
            </button>

            <button
              type="button"
              onClick={() =>
                router.push("/admin")
              }
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