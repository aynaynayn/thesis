import { ArrowRight, Ruler, Box, ShieldCheck } from "lucide-react";
import { PRODUCTS } from "../data/products";
import { useRouter } from "../context/RouterContext";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const { navigate } = useRouter();
  const featured = PRODUCTS.filter((p) => p.featured);

  return (
    <main>
      {/* Hero */}
      <section className="relative min-h-[88vh] flex items-center overflow-hidden bg-secondary">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400&h=900&fit=crop&auto=format"
            alt="Happy dog wearing apparel"
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold mb-6">
              Breed-Specific Fit
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
              Apparel made
              <br />
              <span className="text-primary">for your dog,</span>
              <br />
              not just any dog.
            </h1>
            <p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">
              PawFit designs dog clothing tailored to your dog's breed and body
              shape. Visualize the fit in 3D before you buy.
            </p>
            <div className="flex flex-wrap gap-3 mt-8">
              <button
                onClick={() => navigate("shop")}
                className="flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
              >
                Shop Now
                <ArrowRight size={18} />
              </button>
              <button
                onClick={() => navigate("shop")}
                className="flex items-center gap-2 px-6 py-3 rounded-full border border-border bg-background text-foreground font-semibold hover:bg-muted transition-colors"
              >
                View Collection
              </button>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="relative w-96 h-96">
              <div className="absolute inset-0 rounded-3xl bg-primary/10 rotate-6" />
              <img
                src="https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=500&h=500&fit=crop&auto=format"
                alt="Dog in PawFit apparel"
                className="relative z-10 w-full h-full object-cover rounded-3xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Breeds */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-extrabold text-foreground mb-2">
          Sized for every breed
        </h2>
        <p className="text-muted-foreground mb-8">
          We carry breed-specific size charts for the most popular Philippine dog breeds.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { breed: "Labrador", img: "https://images.unsplash.com/photo-1601979031925-424e53b6caaa?w=400&h=400&fit=crop&auto=format" },
            { breed: "Pomeranian", img: "https://images.unsplash.com/photo-1548767797-d8c844163c4a?w=400&h=400&fit=crop&auto=format" },
            { breed: "Dachshund", img: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop&auto=format" },
            { breed: "Aspin", img: "https://images.unsplash.com/photo-1530281700549-e82e7bf110d6?w=400&h=400&fit=crop&auto=format" },
          ].map(({ breed, img }) => (
            <button
              key={breed}
              onClick={() => navigate("shop")}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted"
            >
              <img
                src={img}
                alt={breed}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
              <span className="absolute bottom-3 left-3 text-white font-bold text-sm">
                {breed}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-card border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: <Box size={28} className="text-primary" />,
                title: "3D Fit Visualization",
                desc: "Preview how each outfit looks on your breed's 3D model before purchasing.",
              },
              {
                icon: <Ruler size={28} className="text-primary" />,
                title: "Breed-Specific Sizing",
                desc: "Size charts calibrated for Labrador, Pomeranian, Dachshund, and Aspin builds.",
              },
              {
                icon: <ShieldCheck size={28} className="text-primary" />,
                title: "Philippine Payment",
                desc: "Pay via GCash, Maya, or Cash on Delivery — no credit card required.",
              },
            ].map((feat) => (
              <div key={feat.title} className="flex flex-col gap-3">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  {feat.icon}
                </div>
                <h3 className="font-bold text-foreground">{feat.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feat.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              Featured Products
            </h2>
            <p className="text-muted-foreground mt-1">
              Our most popular styles this season.
            </p>
          </div>
          <button
            onClick={() => navigate("shop")}
            className="flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            View all <ArrowRight size={15} />
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="rounded-3xl bg-primary p-10 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-2xl font-extrabold text-primary-foreground">
              Find the perfect fit for your dog.
            </h2>
            <p className="text-primary-foreground/80 mt-1 text-sm">
              Browse by breed, category, or use the 3D viewer on any product page.
            </p>
          </div>
          <button
            onClick={() => navigate("shop")}
            className="shrink-0 px-6 py-3 rounded-full bg-white text-primary font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap"
          >
            Shop Collection
          </button>
        </div>
      </section>
    </main>
  );
}
