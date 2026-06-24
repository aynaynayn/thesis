import { useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { PRODUCTS, CATEGORIES, BREEDS } from "../data/products";
import type { Breed } from "../data/products";
import ProductCard from "../components/ProductCard";

export default function ShopPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("All");
  const [breed, setBreed] = useState<string>("All");
  const [filtersOpen, setFiltersOpen] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch =
      search.trim() === "" ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || p.category === category;
    const matchBreed =
      breed === "All" || p.availableBreeds.includes(breed as Breed);
    return matchSearch && matchCat && matchBreed;
  });

  const hasFilters = category !== "All" || breed !== "All" || search.trim() !== "";

  const clearFilters = () => {
    setCategory("All");
    setBreed("All");
    setSearch("");
  };

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-foreground">Shop</h1>
        <p className="text-muted-foreground mt-1">
          {filtered.length} product{filtered.length !== 1 ? "s" : ""} available
        </p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6 flex-wrap sm:flex-nowrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm font-semibold transition-colors ${
            filtersOpen || hasFilters
              ? "bg-primary border-primary text-primary-foreground"
              : "border-border bg-card text-foreground hover:bg-muted"
          }`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {hasFilters && (
            <span className="w-5 h-5 rounded-full bg-primary-foreground text-primary text-xs font-bold flex items-center justify-center">
              {(category !== "All" ? 1 : 0) + (breed !== "All" ? 1 : 0) + (search.trim() !== "" ? 1 : 0)}
            </span>
          )}
        </button>
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-border bg-card text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {filtersOpen && (
        <div className="bg-card border border-border rounded-2xl p-5 mb-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
              Category
            </p>
            <div className="flex flex-wrap gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    category === cat
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-3">
              Breed
            </p>
            <div className="flex flex-wrap gap-2">
              {["All", ...BREEDS].map((b) => (
                <button
                  key={b}
                  onClick={() => setBreed(b)}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                    breed === b
                      ? "bg-accent text-accent-foreground"
                      : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter pills */}
      {(category !== "All" || breed !== "All") && (
        <div className="flex flex-wrap gap-2 mb-5">
          {category !== "All" && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
              {category}
              <button onClick={() => setCategory("All")}>
                <X size={12} />
              </button>
            </span>
          )}
          {breed !== "All" && (
            <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/30 text-accent-foreground text-xs font-semibold">
              {breed}
              <button onClick={() => setBreed("All")}>
                <X size={12} />
              </button>
            </span>
          )}
        </div>
      )}

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-muted-foreground text-lg font-medium">
            No products match your filters.
          </p>
          <button
            onClick={clearFilters}
            className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </main>
  );
}
