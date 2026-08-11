import Link from "next/link";
import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server";

const categories = [
  {
    name: "Rookie Cards",
    description: "Explore rookie cards in the Card Forge inventory.",
    href: "/inventory?category=rookies",
  },
  {
    name: "Autographs",
    description: "Browse signed cards and autograph collectibles.",
    href: "/inventory?category=autographs",
  },
  {
    name: "Vintage Cards",
    description: "Explore vintage cards from past eras.",
    href: "/inventory?category=vintage",
  },
  {
    name: "Rare Inserts",
    description: "Discover rare inserts, parallels, and short prints.",
    href: "/inventory?category=inserts",
  },
];

const sports = [
  {
    name: "Football",
    href: "/inventory?sport=Football",
  },
  {
    name: "Baseball",
    href: "/inventory?sport=Baseball",
  },
  {
    name: "Basketball",
    href: "/inventory?sport=Basketball",
  },
  {
    name: "Hockey",
    href: "/inventory?sport=Hockey",
  },
  {
    name: "Soccer",
    href: "/inventory?sport=Soccer",
  },
  {
    name: "Golf",
    href: "/inventory?sport=Golf",
  },
];

export default async function Home() {
  const supabase = await createClient();

  const { data: featuredCards } = await supabase
    .from("cards")
    .select("*")
    .eq("featured", true)
    .order("created_at", { ascending: false })
    .limit(4);

  const { data: recentCards } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="px-8 py-24 md:py-28">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-blue-900">
            The Collector&apos;s Marketplace
          </p>

          <h1 className="mt-5 max-w-4xl text-5xl font-bold leading-tight md:text-6xl">
            Premium trading cards for serious collectors.
          </h1>

          <p className="mt-6 max-w-2xl text-xl text-stone-500">
            Discover rookies, autographs, vintage cards, rare inserts,
            and collectible treasures curated by Card Forge.
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              href="/inventory"
              className="rounded-lg bg-blue-900 px-6 py-3 font-bold text-white shadow hover:bg-blue-800"
            >
              Browse Inventory
            </Link>

            <Link
              href="/arrivals"
              className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-800 hover:bg-stone-50"
            >
              New Arrivals
            </Link>

            <Link
              href="/about"
              className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-800 hover:bg-stone-50"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
                Handpicked
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                Featured Cards
              </h2>
            </div>

            <Link
              href="/inventory"
              className="font-semibold text-blue-900 hover:underline"
            >
              View All →
            </Link>
          </div>

          {featuredCards && featuredCards.length > 0 ? (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredCards.map((card) => (
                <Link
                  key={card.id}
                  href={`/inventory/${card.id}`}
                  className="overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="relative aspect-[3/4] bg-stone-100">
                    {card.image ? (
                      <img
                        src={card.image}
                        alt={`${card.year} ${card.player}`}
                        className="h-full w-full object-contain p-4"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-stone-400">
                        No Image
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-full bg-blue-900 px-3 py-1 text-xs font-bold text-white shadow">
                      FEATURED
                    </span>
                  </div>

                  <div className="p-5">
                    <p className="text-sm text-stone-500">
                      {card.year} • {card.set}
                    </p>

                    <h3 className="mt-1 text-lg font-bold">
                      {card.player}
                    </h3>

                    <p className="mt-1 text-sm text-stone-600">
                      {card.team}
                    </p>

                    <p className="mt-4 text-xl font-bold">
                      $
                      {Number(card.price ?? 0).toLocaleString(
                        undefined,
                        {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        }
                      )}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-8 rounded-xl border bg-white p-8 text-stone-500">
              No featured cards have been selected yet.
            </div>
          )}
        </div>
      </section>

      <section className="px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
            Explore
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Shop by Sport
          </h2>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {sports.map((sport) => (
              <Link
                key={sport.name}
                href={sport.href}
                className="rounded-xl border bg-white p-6 text-center font-bold shadow-sm transition hover:-translate-y-1 hover:border-blue-900 hover:shadow-md"
              >
                {sport.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
            Collections
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Shop by Category
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="rounded-xl border bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <h3 className="text-xl font-bold">
                  {category.name}
                </h3>

                <div className="mt-3 h-1 w-12 rounded-full bg-[var(--accent)]" />

                <p className="mt-4 text-stone-500">
                  {category.description}
                </p>

                <p className="mt-5 text-sm font-bold text-blue-900">
                  Browse Collection →
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
                Just Added
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                New Arrivals
              </h2>
            </div>

            <Link
              href="/arrivals"
              className="font-semibold text-blue-900 hover:underline"
            >
              See Everything →
            </Link>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {recentCards?.map((card) => (
              <Link
                key={card.id}
                href={`/inventory/${card.id}`}
                className="rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="aspect-[3/4] rounded-lg bg-stone-100">
                  {card.image ? (
                    <img
                      src={card.image}
                      alt={`${card.year} ${card.player}`}
                      className="h-full w-full object-contain p-3"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-stone-400">
                      No Image
                    </div>
                  )}
                </div>

                <p className="mt-4 text-sm text-stone-500">
                  {card.year} • {card.set}
                </p>

                <h3 className="mt-1 font-bold">
                  {card.player}
                </h3>

                <p className="mt-3 font-bold">
                  $
                  {Number(card.price ?? 0).toLocaleString(
                    undefined,
                    {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    }
                  )}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="px-8 py-20">
        <div className="mx-auto max-w-7xl rounded-2xl bg-white p-8 shadow-sm md:p-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-stone-400">
            Card Forge
          </p>

          <h2 className="mt-3 text-3xl font-bold">
            Built for collectors.
          </h2>

          <div className="mt-8 grid gap-6 md:grid-cols-3">
            <div>
              <h3 className="text-lg font-bold">
                Detailed Listings
              </h3>

              <p className="mt-2 text-stone-500">
                Front and back images, grading information, parallels,
                serial numbers, and detailed card attributes.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold">
                Curated Inventory
              </h3>

              <p className="mt-2 text-stone-500">
                Browse cards selected and managed by collectors who
                understand the hobby.
              </p>
            </div>

            <div>
              <h3 className="text-lg font-bold">
                More Coming Soon
              </h3>

              <p className="mt-2 text-stone-500">
                Offers, secure checkout, favorites, market pricing,
                and other collector-focused tools are on the way.
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}