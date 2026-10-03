import { ArrowRight, Ruler, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { productsApi } from "../lib/api";
import type { Product } from "../data/products";
import { useRouter } from "../context/RouterContext";
import ProductCard from "../components/ProductCard";
import bandanaDog from "../assets/boop/boop-bandana.jpg";
import flowerCollarDogs from "../assets/boop/boop-flower-collar.jpg";
import fruityCollarDog from "../assets/boop/boop-fruity-collar.jpg";
import leashTagDog from "../assets/boop/boop-leash-tag.jpg";
import customBandanaDog from "../assets/boop/boop-custom-bandana.jpg";

export default function HomePage() {
  const { navigate } = useRouter();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    void productsApi
      .list({ featured: true, limit: "4" })
      .then(setFeatured)
      .catch(() => setFeatured([]));
    void productsApi
      .list()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, []);
  return (
    <main>
      <section className="relative flex min-h-[72vh] items-end overflow-hidden bg-muted sm:min-h-[78vh]">
        <div className="absolute inset-0">
          <img
            src={flowerCollarDogs}
            alt="Dogs wearing BOOP flower collars"
            className="h-full w-full object-cover object-[center_42%]"
          />
        </div>
        <div className="relative mx-auto w-full max-w-7xl px-4 pb-10 sm:px-6 sm:pb-14">
          <button
            onClick={() => navigate("shop")}
            className="flex items-center gap-2 bg-foreground px-6 py-3 text-xs font-bold uppercase tracking-[0.14em] text-background transition hover:bg-primary"
          >
            Shop Now <ArrowRight size={18} />
          </button>
        </div>
      </section>
      <section className="border-y border-border bg-card py-12">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 sm:grid-cols-2 sm:px-6">
          <Feature
            icon={<Ruler size={28} className="text-primary" />}
            title="Breed-specific sizing"
            text="Choose from product measurements and breed-specific size charts."
          />
          <Feature
            icon={<ShieldCheck size={28} className="text-primary" />}
            title="Secure account access"
            text="Verify your email before signing in and manage your shopping account securely."
          />
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">New arrivals</p>
            <h2 className="mt-2 text-4xl text-foreground">Made to move with them.</h2>
          </div>
          <button
            onClick={() => navigate("shop")}
            className="text-sm font-semibold text-primary"
          >
            View all
          </button>
        </div>
        {loading ? (
          <p className="text-muted-foreground">Loading products</p>
        ) : featured.length ? (
          <div className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-4 sm:gap-x-5">
            {featured.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            No featured products are currently available.
          </p>
        )}
      </section>
      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Shop by collection</p><h2 className="mt-2 text-4xl text-foreground">Everyday layers, made better.</h2></div><button onClick={() => navigate("shop")} className="hidden text-xs font-bold uppercase tracking-[0.14em] text-primary sm:block">Shop all</button></div>
          <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-3">
            {(products.length ? products : featured).slice(0, 6).map((product, index) => <button key={`${product.id}-${index}`} onClick={() => navigate("shop")} className="group relative aspect-[4/5] overflow-hidden bg-muted text-left"><img src={product.images[index % product.images.length] || product.image} alt={`${product.category} collection`} loading="lazy" className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" /><span className="absolute inset-x-0 bottom-0 bg-background/90 px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground">{product.category}</span></button>)}
          </div>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-end"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-primary">Last chance</p><h2 className="mt-2 text-4xl text-foreground">Good things should get worn.</h2><p className="mt-4 max-w-sm text-sm leading-7 text-muted-foreground">Small runs, limited stock, and pieces ready for their next long walk.</p><button onClick={() => navigate("shop")} className="mt-6 border-b border-foreground pb-1 text-xs font-bold uppercase tracking-[0.14em]">Shop the edit</button></div><div className="grid grid-cols-2 gap-4">{(products.length ? products : featured).filter((product) => product.stock > 0).slice(0, 2).map((product) => <ProductCard key={product.id} product={product} />)}</div></div>
      </section>
      <div className="border-y border-border bg-secondary py-4"><p className="text-center text-xs font-bold uppercase tracking-[0.18em] text-secondary-foreground">Comfort is a daily ritual. Dress for it.</p></div>
      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 py-16 sm:grid-cols-2 sm:px-6">
        <img src={bandanaDog} alt="Dog wearing a colorful BOOP bandana" loading="lazy" className="aspect-square h-full w-full object-cover" />
        <div className="flex min-h-80 flex-col justify-center bg-muted p-8 sm:p-12"><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Our story</p><h2 className="mt-3 text-4xl text-foreground">Clothes that let dogs be dogs.</h2><p className="mt-5 max-w-md text-sm leading-7 text-muted-foreground">PawFit pairs considered fabrics with measurements that make sense for the dog wearing them.</p><button onClick={() => navigate("shop")} className="mt-7 w-fit border-b border-foreground pb-1 text-xs font-bold uppercase tracking-[0.14em] text-foreground">Explore the collection</button></div>
      </section>
      <section className="border-t border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6"><div className="grid gap-8 lg:grid-cols-[1fr_2fr]"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Fit starts here</p><h2 className="mt-3 text-4xl text-foreground">A better fit is a calmer day.</h2></div><div className="grid gap-6 sm:grid-cols-3"><FitPoint number="01" title="Save their measurements" text="Keep neck, chest, and back measurements on a pet profile." /><FitPoint number="02" title="See the right size" text="PawFit compares each garment range against those measurements." /><FitPoint number="03" title="Preview the look" text="Explore breed-specific 3D models before you add to bag." /></div></div></div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6"><div className="flex items-end justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">Follow along</p><h2 className="mt-2 text-4xl text-foreground">Life in PawFit.</h2></div><span className="text-xs font-bold uppercase tracking-[0.14em] text-primary">@pawfit</span></div><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[{ image: customBandanaDog, alt: "Dog wearing a custom BOOP bandana" }, { image: flowerCollarDogs, alt: "Dogs wearing BOOP flower collars" }, { image: fruityCollarDog, alt: "Dog wearing a BOOP fruity collar" }, { image: leashTagDog, alt: "Dog with a BOOP leash tag" }].map(({ image, alt }) => <img key={image} src={image} alt={alt} loading="lazy" className="aspect-square w-full object-cover" />)}</div></section>
    </main>
  );
}

function FitPoint({ number, title, text }: { number: string; title: string; text: string }) {
  return <div className="border-t border-border pt-4"><p className="text-xs font-bold text-primary">{number}</p><h3 className="mt-3 text-lg font-semibold text-foreground">{title}</h3><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>;
}

function Feature({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode;
  title: string;
  text: string;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="font-bold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{text}</p>
      </div>
    </div>
  );
}
