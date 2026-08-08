import Navbar from "@/components/Navbar";

const categories = [
  "Rookie Cards",
  "Autographs",
  "Vintage Cards",
  "Rare Inserts",
];

export default function Home() {
  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <Navbar />

      <section className="px-10 py-28">
        <h2 className="text-6xl font-bold max-w-4xl">
          Premium trading cards for serious collectors.
        </h2>

        <p className="mt-6 max-w-2xl text-xl text-[var(--muted)] leading-8">
          Discover rare cards, rookie investments, and collectible
          treasures curated by Card Forge.
        </p>

        <div className="mt-8 flex gap-4">
          <button className=" bg-[var(--primary)]
    text-white
    px-6
    py-3
    rounded-xl
    font-semibold
    shadow-md
    hover:brightness-110
    transition">
            Browse Inventory
          </button>

          <button className="border
    border-[var(--border)]
    bg-white
    px-6
    py-3
    rounded-xl
    font-medium
    hover:border-[var(--primary)]
    hover:text-[var(--primary)]
    transition
">
            Learn More
          </button>
        </div>
      </section>

      <section className="px-8 py-12">
        <h3 className="text-3xl font-bold mb-8">
          Featured Collections
        </h3>

        <div className="grid md:grid-cols-4 gap-6">
          {categories.map((category) => (
            <div
              key={category}
              className="bg-[var(--surface)]
border border-[var(--border)] rounded-2xl p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <h4 className="text-xl font-semibold text-[var(--foreground)]">
                {category}
              </h4>
               <div className="mt-3 mb-4 h-1 w-12 rounded-full bg-[var(--accent)]" />
               
              <p className="mt-3 text-[var(--muted)]">
                Explore premium collectibles.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}