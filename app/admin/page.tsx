import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/admin/login");
  }

  return (
    <main className="min-h-screen bg-[var(--background)] px-8 py-12">
      <h1 className="text-4xl font-bold">
        Card Forge Admin
      </h1>

      <p className="mt-3 text-stone-600">
        Welcome to your admin dashboard.
      </p>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <a
          href="/admin/inventory"
          className="rounded-xl border bg-white p-6 shadow transition hover:shadow-lg"
        >
          <h2 className="text-2xl font-bold">
            Inventory
          </h2>

          <p className="mt-2">
            Manage your cards.
          </p>
        </a>

        <a
          href="/admin/add-card"
          className="rounded-xl border bg-white p-6 shadow transition hover:shadow-lg"
        >
          <h2 className="text-2xl font-bold">
            Add Card
          </h2>

          <p className="mt-2">
            Add new inventory.
          </p>
        </a>

        <div className="rounded-xl border bg-white p-6 shadow">
          <h2 className="text-2xl font-bold">
            Sales
          </h2>

          <p className="mt-2">
            Coming soon...
          </p>
        </div>
      </div>
    </main>
  );
}