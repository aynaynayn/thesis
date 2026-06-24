import { ShoppingBag } from "lucide-react";
import type { Product } from "../data/products";
import { useRouter } from "../context/RouterContext";

type Props = {
  product: Product;
};

export default function ProductCard({ product }: Props) {
  const { navigate } = useRouter();

  return (
    <button
      onClick={() => navigate("product", product.id)}
      className="group text-left bg-card rounded-2xl overflow-hidden border border-border hover:shadow-lg transition-shadow duration-200"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
          {product.stock <= 10 && (
            <span className="px-2 py-0.5 rounded-full bg-background/90 text-xs font-semibold text-foreground">
              Low stock
            </span>
          )}
        </div>
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {product.category}
        </p>
        <h3 className="font-bold text-foreground mt-0.5 text-base leading-snug">
          {product.name}
        </h3>
        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
          {product.availableBreeds.map((b) => (
            <span
              key={b}
              className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-medium"
            >
              {b}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="font-bold text-lg text-foreground">
            ₱{product.price.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
            <ShoppingBag size={13} />
            View
          </span>
        </div>
      </div>
    </button>
  );
}
