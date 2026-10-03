import { useEffect, useState } from "react";
import { ArrowRight, Check, Image as ImageIcon } from "lucide-react";
import type { Product } from "../data/products";
import { productsApi } from "../lib/api";
import { useRouter } from "../context/RouterContext";

const about = {
  steps: [
    ["Create a pet profile", "Enter your dog's neck girth, chest girth, and back length."],
    ["Get a size recommendation", "We compare your dog's measurements against each product's own size ranges and recommend the size where all three measurements fit."],
    ["Preview it in 3D", "Choose your dog's breed to see the clothing on a 3D model, then add to cart."],
  ],
  differences: [
    "Measurement-based sizing: every product has its own size ranges, so the recommendation reflects that exact item.",
    "Breed-specific 3D preview: pick a breed to see a matching model. If your breed doesn't have its own model yet, we show a general reference model, and your size recommendation still works.",
    "Honest availability: if your recommended size is out of stock, we still tell you it's the right size and mark it as currently unavailable.",
    "Interactive viewing: rotate and zoom the 3D model to see the fit from every angle.",
  ],
};

function ProductVisual({ product, className = "" }: { product?: Product; className?: string }) {
  if (product?.image) return <img src={product.image} alt={`${product.name} dog apparel`} className={`h-full w-full object-cover ${className}`} />;
  return <div role="img" aria-label="PawFit product image loading" className={`grid min-h-72 place-items-center bg-preview-bg ${className}`}><div className="text-center"><ImageIcon className="mx-auto text-accent" size={36} /><p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground">PawFit apparel</p></div></div>;
}

export default function AboutPage() {
  const { navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "About PawFit";
    void productsApi.list().then(setProducts).catch(() => setProducts([]));
    return () => { document.title = previousTitle; };
  }, []);

  const heroProduct = products[0];
  const fittingProduct = products[1] || heroProduct;
  const detailProduct = products[2] || heroProduct;
  return <main>
    <section className="bg-preview-bg"><div className="mx-auto grid min-h-[34rem] max-w-6xl items-center px-4 sm:px-6 lg:grid-cols-2"><div className="py-16 lg:py-24"><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">About PawFit</p><h1 className="mt-4 max-w-xl font-serif text-5xl leading-[0.98] text-foreground sm:text-6xl">Find the right fit before you buy.</h1><p className="mt-6 max-w-lg leading-7 text-muted-foreground">PawFit is an online dog apparel store with a 3D virtual fitting preview and a size recommendation based on your dog's actual measurements, so you can shop with confidence.</p><button onClick={() => navigate("shop")} className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-sm font-bold text-primary-foreground">Shop the collection <ArrowRight size={17} /></button></div><div className="h-80 overflow-hidden lg:h-[34rem]"><ProductVisual product={heroProduct} /></div></div></section>

    <section className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[0.85fr_1.15fr] lg:py-24"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">Our point of view</p><h2 className="mt-3 font-serif text-4xl text-foreground">Dogs aren't one size fits all.</h2></div><div className="space-y-5 leading-7 text-muted-foreground"><p>Buying clothes for a dog online is mostly guesswork. Sizes differ from brand to brand, and a dog's build doesn't always match what a size label says.</p><p>PawFit was built to take the guesswork out. Instead of assuming a breed means a size, we look at your dog's real measurements and show you how the clothing looks on a 3D model before you check out.</p></div></section>

    <section className="bg-surface py-16"><div className="mx-auto grid max-w-6xl gap-8 px-4 sm:px-6 lg:grid-cols-2 lg:items-center"><div className="aspect-[4/5] overflow-hidden"><ProductVisual product={fittingProduct} /></div><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">How it works</p><h2 className="mt-3 font-serif text-4xl text-foreground">Measure once, shop with confidence.</h2><p className="mt-4 text-muted-foreground">Everything starts with your dog's profile.</p><div className="mt-7 grid gap-4">{about.steps.map(([title, text], index) => <div key={title} className="grid grid-cols-[2rem_1fr] gap-3 border-l-2 border-accent pl-4"><span className="font-bold text-accent">0{index + 1}</span><div><h3 className="font-bold text-foreground">{title}</h3><p className="mt-1 text-sm leading-6 text-muted-foreground">{text}</p></div></div>)}</div></div></div></section>

    <section className="mx-auto grid max-w-6xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr]"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">What makes us different</p><h2 className="mt-3 font-serif text-4xl text-foreground">Sizing based on measurements, not guesses.</h2><ul className="mt-7 grid gap-4">{about.differences.map((point) => <li key={point} className="flex gap-3 text-sm leading-6 text-muted-foreground"><Check className="mt-0.5 shrink-0 text-accent" size={18} />{point}</li>)}</ul><button onClick={() => navigate("shop")} className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-accent">Try the virtual fitting <ArrowRight size={16} /></button></div><div className="aspect-square overflow-hidden"><ProductVisual product={detailProduct} /></div></section>

    <section className="border-y border-border bg-surface py-16"><div className="mx-auto max-w-6xl px-4 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">The collection</p><h2 className="mt-3 font-serif text-4xl text-foreground">Clothes made for real dogs.</h2><div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">{[0, 1, 2, 3].map((index) => <div key={index} className="aspect-square overflow-hidden"><ProductVisual product={products[index]} /></div>)}</div></div></section>

    <section className="bg-preview-bg py-16"><div className="mx-auto max-w-6xl px-4 sm:px-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-accent">About the project</p><h2 className="mt-3 font-serif text-4xl text-foreground">Built as a thesis project.</h2><p className="mt-5 max-w-2xl leading-7 text-muted-foreground">PawFit is an interactive 3D virtual fitting and e-commerce platform for dog apparel, developed as a thesis project at Mapua University by Cordero, Zamoras, and Javier, under the guidance of our adviser, Antoinette Gabriel.</p><p className="mt-5 text-sm font-semibold text-foreground">Checkout on this site is a simulation for demonstration purposes. No real payments are processed.</p></div></section>
  </main>;
}
