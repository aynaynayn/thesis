import { useState } from "react";
import { ChevronLeft, ChevronRight, Plus } from "lucide-react";
import type { Product } from "../data/products";
import { useRouter } from "../context/RouterContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";

export default function ProductCard({ product }: { product: Product }) {
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [adding, setAdding] = useState(false);
  const [imageIndex, setImageIndex] = useState(0);
  const images = Array.from(new Set([product.image, ...product.images].filter(Boolean))).slice(0, 3);
  const sizes = [...new Set(product.inventory.map((item) => item.size))].map((size) => [size, product.inventory.filter((entry) => entry.size === size).reduce((total, entry) => total + entry.stock, 0)] as const);
  const quickAdd = async (size: string) => {
    if (!user) return navigate("auth");
    try {
      await addItem(product, size, undefined, product.colorVariants[0]?.name);
      setAdding(false);
    } catch {
      setAdding(false);
    }
  };

  return (
    <article className="group relative w-full text-left">
      <div className="relative aspect-[4/5] overflow-hidden bg-muted">
        <button onClick={() => navigate("product", product.slug)} className="h-full w-full" aria-label={`View ${product.name}`}>
          <img src={images[imageIndex] || product.image} alt={`${product.name} product view ${imageIndex + 1}`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" />
        </button>
        {images.length > 1 && <><button type="button" onClick={() => setImageIndex((current) => (current - 1 + images.length) % images.length)} className="absolute left-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center bg-surface/90 text-foreground" aria-label={`Show previous image for ${product.name}`}><ChevronLeft size={17} /></button><button type="button" onClick={() => setImageIndex((current) => (current + 1) % images.length)} className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center bg-surface/90 text-foreground" aria-label={`Show next image for ${product.name}`}><ChevronRight size={17} /></button><span className="absolute bottom-2 right-2 bg-foreground/80 px-2 py-1 text-[10px] font-bold text-background">{imageIndex + 1}/{images.length}</span></>}
        {product.stock === 0 && <span className="absolute left-3 top-3 bg-foreground px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-background">Sold out</span>}
        {product.stock > 0 && product.stock <= 10 && <span className="absolute left-3 top-3 bg-background/95 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-foreground">Last sizes</span>}
        {product.stock > 0 && <div className="absolute inset-x-3 bottom-3 hidden bg-background/95 p-3 md:block md:translate-y-2 md:opacity-0 md:transition md:group-hover:translate-y-0 md:group-hover:opacity-100">
          {adding ? <div className="flex flex-wrap gap-1.5">{sizes.map(([size, stock]) => <button key={size} disabled={!stock} onClick={() => void quickAdd(size)} className="h-8 min-w-8 border border-border px-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-35">{size}</button>)}</div> : <button onClick={() => setAdding(true)} className="flex w-full items-center justify-center gap-2 py-1.5 text-xs font-bold uppercase tracking-[0.12em]"><Plus size={15} /> Quick add</button>}
        </div>}
      </div>
      <div className="pt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-muted-foreground">{product.category}</p>
        <div className="mt-1 flex items-start justify-between gap-3"><button onClick={() => navigate("product", product.slug)} className="text-left text-base font-semibold text-foreground hover:text-primary">{product.name}</button><span className="shrink-0 text-sm font-semibold text-foreground">₱{product.price.toLocaleString()}</span></div>
        {product.colorVariants.length > 0 && <div className="mt-2 flex gap-1.5">{product.colorVariants.slice(0, 5).map((variant) => <span key={variant._id || variant.name} title={`${variant.name} ${variant.hex}`} className="h-3.5 w-3.5 rounded-full border border-black/15" style={{ backgroundColor: variant.hex }} />)}</div>}
        {product.stock > 0 && <button onClick={() => setAdding((value) => !value)} className="mt-3 flex w-full items-center justify-center gap-2 border border-foreground py-2 text-xs font-bold uppercase tracking-[0.12em] md:hidden"><Plus size={15} /> Quick add</button>}
        {adding && <div className="mt-2 flex flex-wrap gap-1.5 md:hidden">{sizes.map(([size, stock]) => <button key={size} disabled={!stock} onClick={() => void quickAdd(size)} className="h-8 min-w-8 border border-border px-2 text-xs font-bold disabled:cursor-not-allowed disabled:opacity-35">{size}</button>)}</div>}
      </div>
    </article>
  );
}
