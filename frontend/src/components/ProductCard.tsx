import type { Product } from "../data/products";
import { useRouter } from "../context/RouterContext";

export default function ProductCard({ product }: { product: Product }) {
  const { navigate } = useRouter();

  return (
    <button
      onClick={() => navigate("product", product.slug)}
      className="product-surface group w-full overflow-hidden rounded-2xl border border-border bg-card text-left transition duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <img src={product.image} alt={product.name} className="h-full w-full object-cover grayscale-[20%] transition duration-500 group-hover:scale-[1.02] group-hover:grayscale-0" />
        {product.stock <= 10 && <span className="absolute left-0 top-0 bg-background px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-foreground">{product.stock ? "Low stock" : "Out of stock"}</span>}
      </div>
      <div className="px-4 py-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{product.category}</p>
        <h3 className="mt-1 text-2xl text-foreground">{product.name}</h3>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
          <span className="font-mono text-sm text-foreground">₱{product.price.toLocaleString()}</span>
          <span className="text-xs font-bold uppercase tracking-[0.1em] text-primary">View item</span>
        </div>
      </div>
    </button>
  );
}
