import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
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
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12">
      <header className="border-b border-border pb-7"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Home / Shop</p><div className="mt-3 flex flex-wrap items-end justify-between gap-3"><div><h1 className="text-4xl text-foreground sm:text-5xl">The collection</h1><p className="mt-2 text-sm text-muted-foreground">{filtered.length} product{filtered.length === 1 ? "" : "s"} available</p></div>{(search || breed !== "All" || category !== "All") && <button onClick={clear} className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground"><X size={15} /> Reset filters</button>}</div></header>
      <section aria-label="Product filters" className="grid gap-4 border-b border-border py-5 lg:grid-cols-[minmax(15rem,1.3fr)_minmax(9rem,.7fr)_minmax(9rem,.7fr)]">
        <label className="flex items-center gap-3 border border-border bg-surface px-3"><Search size={17} className="shrink-0 text-muted-foreground" /><span className="sr-only">Search the collection</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search the collection" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /></label>
        <Filter label="Collection" values={categories} selected={category} onChange={setCategory} />
        <Filter label="Preview breed" values={breeds} selected={breed} onChange={setBreed} />
      </section>
      {error ? (
        <p className="mt-10 text-destructive">{error}</p>
      ) : loading ? (
        <p className="mt-10 text-muted-foreground">Loading products</p>
      ) : filtered.length ? (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-5">
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
  return <label className="grid gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground"><span>{label}</span><select value={selected} onChange={(event) => onChange(event.target.value)} className="h-11 border border-border bg-surface px-3 text-sm font-semibold normal-case tracking-normal text-foreground outline-none focus:border-accent">{values.map((value) => <option key={value} value={value}>{value}</option>)}</select></label>;
}
