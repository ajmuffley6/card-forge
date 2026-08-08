export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-8 py-6 border-b border-gray-300">
      <h1 className="text-3xl font-bold text-stone-900">
        Card <span className="text-[var(--accent)]">Forge</span>
      </h1>

      <div className="flex gap-6 text-stone-700">
        <a href="/inventory" className="hover:text-stone-900 transition">
          Inventory
        </a>
        <a href="/arrivals" className="hover:text-stone-900 transition">
          New Arrivals
        </a>
        <a href="/about" className="hover:text-stone-900 transition">
          About
        </a>
      </div>
    </nav>
  );
}