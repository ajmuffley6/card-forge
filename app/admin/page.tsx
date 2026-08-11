import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type Card = {
  id: number;
  owner: string | null;
  status: string | null;
  price: number | null;
  purchase_price: number | null;
  featured: boolean | null;
};

function money(value: number) {
  return value.toLocaleString(undefined, {
    style: "currency",
    currency: "USD",
  });
}

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  const { data, error } = await supabase
    .from("cards")
    .select(
      "id, owner, status, price, purchase_price, featured"
    );

  if (error) {
    return (
      <main className="min-h-screen bg-[var(--background)] px-8 py-12">
        <div className="mx-auto max-w-7xl">
          <h1 className="text-4xl font-bold">
            Card Forge Admin
          </h1>

          <p className="mt-4 text-red-600">
            Unable to load dashboard: {error.message}
          </p>
        </div>
      </main>
    );
  }

  const cards = (data ?? []) as Card[];

  const totalCards = cards.length;

  const availableCards = cards.filter(
    (card) => card.status === "Available"
  );

  const reservedCards = cards.filter(
    (card) => card.status === "Reserved"
  );

  const soldCards = cards.filter(
    (card) => card.status === "Sold"
  );

  const featuredCards = cards.filter(
    (card) => card.featured === true
  );

  const totalInventoryValue = availableCards.reduce(
    (sum, card) => sum + Number(card.price ?? 0),
    0
  );

  const totalPurchaseCost = cards.reduce(
    (sum, card) => sum + Number(card.purchase_price ?? 0),
    0
  );

  const potentialProfit =
    totalInventoryValue - totalPurchaseCost;

  const averagePrice =
    availableCards.length > 0
      ? totalInventoryValue / availableCards.length
      : 0;

  const owners = ["AJ", "Casey", "Bogar"];

  const ownerStats = owners.map((owner) => {
    const ownerCards = cards.filter(
      (card) => card.owner === owner
    );

    const available = ownerCards.filter(
      (card) => card.status === "Available"
    );

    const reserved = ownerCards.filter(
      (card) => card.status === "Reserved"
    );

    const sold = ownerCards.filter(
      (card) => card.status === "Sold"
    );

    const inventoryValue = available.reduce(
      (sum, card) => sum + Number(card.price ?? 0),
      0
    );

    const purchaseCost = ownerCards.reduce(
      (sum, card) =>
        sum + Number(card.purchase_price ?? 0),
      0
    );

    return {
      owner,
      total: ownerCards.length,
      available: available.length,
      reserved: reserved.length,
      sold: sold.length,
      inventoryValue,
      purchaseCost,
      potentialProfit:
        inventoryValue - purchaseCost,
    };
  });

  return (
    <main className="min-h-screen bg-[var(--background)] px-8 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-900">
              Business Overview
            </p>

            <h1 className="mt-2 text-4xl font-bold">
              Card Forge Admin
            </h1>

            <p className="mt-3 text-stone-600">
              Inventory, ownership, and business performance.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/inventory"
              className="rounded-lg border bg-white px-5 py-3 font-semibold shadow-sm hover:bg-stone-50"
            >
              Inventory Manager
            </Link>

            <Link
              href="/admin/add-card"
              className="rounded-lg bg-blue-900 px-5 py-3 font-bold text-white hover:bg-blue-800"
            >
              + Add Card
            </Link>
          </div>
        </div>

        <section className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Inventory Value
            </p>

            <p className="mt-2 text-3xl font-bold">
              {money(totalInventoryValue)}
            </p>

            <p className="mt-2 text-sm text-stone-500">
              Available cards only
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Total Cards
            </p>

            <p className="mt-2 text-3xl font-bold">
              {totalCards}
            </p>

            <p className="mt-2 text-sm text-stone-500">
              Across all owners
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Featured Cards
            </p>

            <p className="mt-2 text-3xl font-bold">
              {featuredCards.length}
            </p>

            <p className="mt-2 text-sm text-stone-500">
              Currently on homepage
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Average Asking Price
            </p>

            <p className="mt-2 text-3xl font-bold">
              {money(averagePrice)}
            </p>

            <p className="mt-2 text-sm text-stone-500">
              Available inventory
            </p>
          </div>
        </section>

        <section className="mt-6 grid gap-5 sm:grid-cols-3">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Available
            </p>

            <p className="mt-2 text-3xl font-bold">
              {availableCards.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Reserved
            </p>

            <p className="mt-2 text-3xl font-bold">
              {reservedCards.length}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <p className="text-sm font-semibold text-stone-500">
              Sold
            </p>

            <p className="mt-2 text-3xl font-bold">
              {soldCards.length}
            </p>
          </div>
        </section>

        <section className="mt-10">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
              Ownership
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Inventory by Owner
            </h2>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {ownerStats.map((stats) => (
              <div
                key={stats.owner}
                className="rounded-xl border bg-white p-6 shadow-sm"
              >
                <h3 className="text-2xl font-bold">
                  {stats.owner}
                </h3>

                <div className="mt-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">
                      Total Cards
                    </span>

                    <span className="font-bold">
                      {stats.total}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">
                      Available
                    </span>

                    <span className="font-bold">
                      {stats.available}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">
                      Reserved
                    </span>

                    <span className="font-bold">
                      {stats.reserved}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-stone-500">
                      Sold
                    </span>

                    <span className="font-bold">
                      {stats.sold}
                    </span>
                  </div>

                  <div className="border-t pt-4">
                    <p className="text-sm text-stone-500">
                      Available Inventory Value
                    </p>

                    <p className="mt-1 text-2xl font-bold">
                      {money(stats.inventoryValue)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-stone-500">
                      Purchase Cost
                    </p>

                    <p className="mt-1 font-bold">
                      {money(stats.purchaseCost)}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-stone-500">
                      Potential Margin
                    </p>

                    <p className="mt-1 font-bold">
                      {money(stats.potentialProfit)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-xl border bg-white p-8 shadow-sm">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
            Financial Snapshot
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Inventory Economics
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-sm text-stone-500">
                Total Purchase Cost
              </p>

              <p className="mt-2 text-2xl font-bold">
                {money(totalPurchaseCost)}
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">
                Available Inventory Value
              </p>

              <p className="mt-2 text-2xl font-bold">
                {money(totalInventoryValue)}
              </p>
            </div>

            <div>
              <p className="text-sm text-stone-500">
                Potential Margin
              </p>

              <p className="mt-2 text-2xl font-bold">
                {money(potentialProfit)}
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}