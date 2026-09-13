import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { BREEDS, type Product } from "../data/products";
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
  const filtered = products.filter(
    (product) =>
      (breed === "All" || product.availableBreeds.includes(breed as never)) &&
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
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-foreground">Shop</h1>
      <p className="text-muted-foreground mt-1">
        {filtered.length} product{filtered.length === 1 ? "" : "s"} available
      </p>
      <div className="mt-7 flex flex-col gap-4">
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-border bg-card text-sm"
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
          values={["All", ...BREEDS]}
          selected={breed}
          onChange={setBreed}
        />
        {(search || breed !== "All" || category !== "All") && (
          <button
            onClick={clear}
            className="self-start flex items-center gap-1 text-sm font-semibold text-muted-foreground"
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>
      {error ? (
        <p className="mt-10 text-destructive">{error}</p>
      ) : loading ? (
        <p className="mt-10 text-muted-foreground">Loading products</p>
      ) : filtered.length ? (
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
            className={`px-3 py-1.5 rounded-full text-sm font-semibold ${selected === value ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          >
            {value}
          </button>
        ))}
      </div>
    </div>
  );
}
