import Navbar from "@/components/Navbar";

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

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="px-8 py-28">
        <h2 className="max-w-4xl text-6xl font-bold">
          Premium trading cards for serious collectors.
        </h2>

        <p className="mt-6 max-w-2xl text-xl text-stone-500">
          Discover rare cards, rookie investments, and collectible treasures
          curated by Card Forge.
        </p>

        <div className="mt-10 flex gap-4">
          <a
            href="/inventory"
            className="rounded-lg bg-blue-800 px-6 py-3 font-bold text-white shadow hover:bg-blue-900"
          >
            Browse Inventory
          </a>

          <a
            href="/about"
            className="rounded-lg border border-stone-300 bg-white px-6 py-3 font-semibold text-stone-800 hover:bg-stone-50"
          >
            Learn More
          </a>
        </div>
      </section>

      <section className="px-8 pb-16">
        <h2 className="text-3xl font-bold">
          Featured Collections
        </h2>

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <a
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
            </a>
          ))}
        </div>
      </section>
    </main>
  );
}