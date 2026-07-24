import { ArrowRight, Ruler, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { productsApi } from "../lib/api";
import type { Product } from "../data/products";
import { useRouter } from "../context/RouterContext";
import ProductCard from "../components/ProductCard";

export default function HomePage() {
  const { navigate } = useRouter();
  const [featured, setFeatured] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => { void productsApi.list({ featured: true, limit: "4" }).then(setFeatured).catch(() => setFeatured([])).finally(() => setLoading(false)); }, []);
  return <main>
    <section className="relative min-h-[70vh] flex items-center overflow-hidden bg-secondary"><div className="absolute inset-0"><img src="https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=1400&h=900&fit=crop&auto=format" alt="Dog wearing PawFit apparel" className="w-full h-full object-cover opacity-20" /><div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/80 to-transparent" /></div><div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20"><span className="inline-block px-4 py-1.5 rounded-full bg-primary/20 text-primary text-sm font-bold mb-6">Breed-specific fit</span><h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">Apparel made<br /><span className="text-primary">for your dog,</span><br />not just any dog.</h1><p className="mt-6 text-lg text-muted-foreground leading-relaxed max-w-md">Shop clothing built around your dog’s breed and measurements.</p><button onClick={() => navigate("shop")} className="mt-8 flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground font-bold">Shop Now <ArrowRight size={18} /></button></div></section>
    <section className="bg-card border-y border-border py-14"><div className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 sm:grid-cols-2 gap-8"><Feature icon={<Ruler size={28} className="text-primary" />} title="Breed-specific sizing" text="Choose from product measurements and breed-specific size charts." /><Feature icon={<ShieldCheck size={28} className="text-primary" />} title="Secure account access" text="Verify your email before signing in and manage your shopping account securely." /></div></section>
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16"><div className="flex items-end justify-between mb-8"><div><h2 className="text-2xl font-extrabold text-foreground">Featured products</h2><p className="text-muted-foreground mt-1">Available styles from the PawFit catalogue.</p></div><button onClick={() => navigate("shop")} className="text-sm font-semibold text-primary">View all</button></div>{loading ? <p className="text-muted-foreground">Loading products</p> : featured.length ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">{featured.map((product) => <ProductCard key={product.id} product={product} />)}</div> : <p className="text-muted-foreground">No featured products are currently available.</p>}</section>
  </main>;
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) { return <div className="flex gap-4"><div className="shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">{icon}</div><div><h3 className="font-bold text-foreground">{title}</h3><p className="text-sm text-muted-foreground mt-1">{text}</p></div></div>; }
