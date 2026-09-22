import { useEffect, useState } from "react";
import type { Product } from "../data/products";
import { productsApi } from "../lib/api";
import ProductCard from "../components/ProductCard";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState("");
  const [breed, setBreed] = useState("All");
  const [category, setCategory] = useState("All");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void productsApi
      .list()
      .then(setProducts)
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);
  const categories = [
    "All",
    ...new Set(products.map((product) => product.category)),
  ];
  const breeds = [
    "All",
    ...new Set(products.flatMap((product) => product.models.map((model) => model.breed))),
  ];
  const filtered = products.filter(
    (product) =>
      (breed === "All" || product.models.some((model) => model.breed === breed)) &&
      (category === "All" || product.category === category) &&
      (!search ||
        `${product.name} ${product.category}`
          .toLowerCase()
          .includes(search.toLowerCase())),
  );
  const clear = () => {
    setSearch("");
    setBreed("All");
    setCategory("All");
  };
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">The PawFit catalogue</p>
      <h1 className="mt-2 text-5xl text-foreground">Shop</h1>
      <p className="text-muted-foreground mt-1">
        {filtered.length} product{filtered.length === 1 ? "" : "s"} available
      </p>
      <div className="mt-7 flex flex-col gap-4">
        <div className="border-b border-border">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search the collection"
            className="w-full bg-transparent py-3 text-sm outline-none"
            aria-label="Search products"
          />
        </div>
        <Filter
          label="Category"
          values={categories}
          selected={category}
          onChange={setCategory}
        />
        <Filter
          label="Breed"
          values={breeds}
          selected={breed}
          onChange={setBreed}
        />
        {(search || breed !== "All" || category !== "All") && (
          <button
            onClick={clear}
            className="self-start border-b border-muted-foreground pb-0.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground"
          >
            Clear filters
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-10 text-destructive">{error}</p>
      ) : loading ? (
        <p className="mt-10 text-muted-foreground">Loading products</p>
      ) : filtered.length ? (
        <div className="mt-10 grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-10 text-muted-foreground">
          No products match your selection.
        </p>
      )}
    </main>
  );
}

function Filter({
  label,
  values,
  selected,
  onChange,
}: {
  label: string;
  values: readonly string[];
  selected: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
        {label}
      </p>
      <div className="flex flex-wrap gap-2">
        {values.map((value) => (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={`border-b px-1 py-1 text-xs font-bold uppercase tracking-[0.08em] ${selected === value ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:border-border"}`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
