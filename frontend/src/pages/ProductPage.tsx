import { useState } from "react";
import { ArrowLeft, ShoppingBag, Box, ChevronDown, ChevronUp } from "lucide-react";
import { PRODUCTS } from "../data/products";
import type { Breed, SizeChart } from "../data/products";
import { useCart } from "../context/CartContext";
import { useRouter } from "../context/RouterContext";

type Props = { productId: string };

export default function ProductPage({ productId }: Props) {
  const { navigate } = useRouter();
  const { addItem } = useCart();
  const product = PRODUCTS.find((p) => p.id === productId);

  const [selectedBreed, setSelectedBreed] = useState<Breed | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [view3D, setView3D] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground">Product not found.</p>
        <button
          onClick={() => navigate("shop")}
          className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm"
        >
          Back to Shop
        </button>
      </main>
    );
  }

  const breedChart: SizeChart | undefined = selectedBreed
    ? product.sizeCharts.find((sc) => sc.breed === selectedBreed)
    : undefined;

  const handleAddToCart = () => {
    if (!selectedBreed || !selectedSize) return;
    addItem(product, selectedSize, selectedBreed);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const canAdd = selectedBreed !== null && selectedSize !== null;

  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate("shop")}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Shop
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">
        {/* Left: Image / 3D Viewer */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-square rounded-3xl overflow-hidden bg-muted">
            {view3D ? (
              <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-gradient-to-br from-secondary to-accent/30">
                <div className="relative">
                  <div className="w-48 h-48 rounded-full bg-accent/20 flex items-center justify-center animate-pulse">
                    <Box size={64} className="text-accent-foreground/40" />
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground text-xs font-bold">3D</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-bold text-foreground text-sm">
                    {selectedBreed ? `${selectedBreed} Model` : "Select a breed to preview"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Powered by Three.js — rotate to inspect fit
                  </p>
                </div>
                {selectedBreed && (
                  <div className="flex gap-2 mt-2">
                    {["Front", "Side", "Top"].map((view) => (
                      <button
                        key={view}
                        className="px-3 py-1 rounded-full bg-card text-foreground text-xs font-semibold border border-border hover:bg-muted transition-colors"
                      >
                        {view}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <img
                src={product.image}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>

          <button
            onClick={() => setView3D(!view3D)}
            className={`flex items-center justify-center gap-2 py-3 rounded-2xl border text-sm font-semibold transition-colors ${
              view3D
                ? "bg-accent text-accent-foreground border-accent"
                : "border-border bg-card text-foreground hover:bg-muted"
            }`}
          >
            <Box size={16} />
            {view3D ? "View Photo" : "View in 3D"}
          </button>
        </div>

        {/* Right: Info */}
        <div className="flex flex-col gap-6">
          <div>
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              {product.category}
            </span>
            <h1 className="text-3xl font-extrabold text-foreground mt-1">
              {product.name}
            </h1>
            <p className="text-2xl font-bold text-primary mt-2">
              ₱{product.price.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Color swatches */}
          <div>
            <p className="text-sm font-bold text-foreground mb-2">Available Colors</p>
            <div className="flex gap-2">
              {product.colors.map((color) => (
                <div
                  key={color}
                  className="w-7 h-7 rounded-full border-2 border-border cursor-pointer hover:scale-110 transition-transform"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </div>

          {/* Breed selection */}
          <div>
            <p className="text-sm font-bold text-foreground mb-2">
              Select Breed <span className="text-destructive">*</span>
            </p>
            <div className="flex flex-wrap gap-2">
              {product.availableBreeds.map((b) => (
                <button
                  key={b}
                  onClick={() => { setSelectedBreed(b); setSelectedSize(null); }}
                  className={`px-4 py-2 rounded-full text-sm font-semibold border transition-colors ${
                    selectedBreed === b
                      ? "bg-accent text-accent-foreground border-accent"
                      : "border-border bg-card text-foreground hover:bg-muted"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Size selection */}
          {breedChart && (
            <div>
              <p className="text-sm font-bold text-foreground mb-2">
                Select Size <span className="text-destructive">*</span>
              </p>
              <div className="flex flex-wrap gap-2 mb-3">
                {breedChart.sizes.map((s) => (
                  <button
                    key={s.label}
                    onClick={() => setSelectedSize(s.label)}
                    className={`w-12 h-12 rounded-xl text-sm font-bold border transition-colors ${
                      selectedSize === s.label
                        ? "bg-primary text-primary-foreground border-primary"
                        : "border-border bg-card text-foreground hover:bg-muted"
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>

              {/* Size chart toggle */}
              <button
                onClick={() => setSizeChartOpen(!sizeChartOpen)}
                className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Size Chart
                {sizeChartOpen ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>

              {sizeChartOpen && (
                <div className="mt-3 rounded-2xl border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted">
                        <th className="px-4 py-2 text-left font-bold text-foreground text-xs">Size</th>
                        <th className="px-4 py-2 text-left font-bold text-foreground text-xs">Neck (cm)</th>
                        <th className="px-4 py-2 text-left font-bold text-foreground text-xs">Chest (cm)</th>
                        <th className="px-4 py-2 text-left font-bold text-foreground text-xs">Back (cm)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {breedChart.sizes.map((s, i) => (
                        <tr
                          key={s.label}
                          className={i % 2 === 0 ? "bg-card" : "bg-muted/40"}
                        >
                          <td className="px-4 py-2 font-semibold">{s.label}</td>
                          <td className="px-4 py-2 text-muted-foreground">{s.neckCm}</td>
                          <td className="px-4 py-2 text-muted-foreground">{s.chestCm}</td>
                          <td className="px-4 py-2 text-muted-foreground">{s.backCm}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Stock */}
          <p className="text-xs text-muted-foreground">
            {product.stock > 10
              ? `${product.stock} in stock`
              : product.stock > 0
              ? `Only ${product.stock} left — order soon`
              : "Out of stock"}
          </p>

          {/* Add to cart */}
          <button
            onClick={handleAddToCart}
            disabled={!canAdd}
            className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-base transition-all ${
              added
                ? "bg-green-500 text-white"
                : canAdd
                ? "bg-primary text-primary-foreground hover:opacity-90"
                : "bg-muted text-muted-foreground cursor-not-allowed"
            }`}
          >
            <ShoppingBag size={20} />
            {added
              ? "Added to Cart!"
              : canAdd
              ? "Add to Cart"
              : "Select breed and size"}
          </button>
        </div>
      </div>
    </main>
  );
}
