import { useEffect, useRef, useState } from "react";
import { Box, CheckCircle2, ImageIcon, LayoutDashboard, LogOut, Menu, Package, Plus, RefreshCw, Search, ShoppingBag, SlidersHorizontal, Trash2, X } from "lucide-react";
import { type InventoryItem, type Product } from "../data/products";
import { ordersApi, productsApi, type Order } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "../context/RouterContext";
import { toast } from "sonner";

type Draft = Pick<
  Product,
  | "name"
  | "category"
  | "price"
  | "description"
  | "image"
  | "images"
  | "featured"
  | "inventory"
  | "sizeCharts"
  | "sizeSpecs"
  | "colorVariants"
>;
type QueuedModel = { id: string; breed: string; colorName: string; file: File | null };
const MAX_GLB_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const MAX_GLB_FILE_SIZE_LABEL = "10 MB";
const MAX_PRODUCT_IMAGES = 3;

const emptyDraft = (): Draft => ({
  name: "",
  category: "",
  price: 0,
  description: "",
  image: "",
  images: [],
  featured: false,
  inventory: [],
  sizeCharts: [],
  sizeSpecs: [],
  colorVariants: [{ name: "Default", hex: "#C96D48", models: [] }],
});
const createQueueRow = (): QueuedModel => ({
  id: crypto.randomUUID(),
  breed: "",
  colorName: "Default",
  file: null,
});

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const { navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const [adminView, setAdminView] = useState<"dashboard" | "products" | "add" | "orders" | "models">("dashboard");
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [pendingOrderCount, setPendingOrderCount] = useState(0);
  const [productCategoryFilter, setProductCategoryFilter] = useState("All");
  const load = async () => {
    try {
      setProducts(await productsApi.listAdmin());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load products",
      );
    } finally {
      setLoadingProducts(false);
    }
  };
  useEffect(() => {
    if (!loading && user?.role === "admin") void load();
  }, [loading, user]);
  useEffect(() => {
    if (loading || user?.role !== "admin") return;
    void ordersApi.admin().then(({ orders }) => {
      setPendingOrderCount(orders.filter((order) => order.status === "pending").length);
    }).catch(() => undefined);
  }, [loading, user]);
  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking account access
      </main>
    );
  if (!user || user.role !== "admin")
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-foreground">
            Admin access required
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in with an administrator account to manage products and
            inventory.
          </p>
          <button
            onClick={() => navigate("auth")}
            className="mt-5 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  const remove = async (id: string) => {
    if (
      !window.confirm("Delete this product permanently? This cannot be undone.")
    )
      return;
    try {
      await productsApi.remove(id);
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete product",
      );
    }
  };
  const categoryOptions = [...new Map(["Shirts", "Coats", "Sweaters", "Hoodies", ...products.map((product) => product.category)].filter(Boolean).map((category) => [category.trim().toLowerCase(), category.trim()])).values()];
  const productCategories = ["All", ...new Set(products.map((product) => product.category).filter(Boolean))];
  const visibleProducts = productCategoryFilter === "All" ? products : products.filter((product) => product.category === productCategoryFilter);
  const openEditor = (item?: Product) => { setEditing(item || null); setAdminView(item ? "products" : "add"); setMobileNavOpen(false); };
  return (
    <main className="min-h-screen bg-admin-bg md:grid md:grid-cols-[15rem_1fr]">
      <aside className={`${mobileNavOpen ? "block" : "hidden"} fixed inset-x-0 top-0 z-50 border-b border-border bg-card p-5 shadow-lg md:static md:block md:min-h-screen md:border-b-0 md:border-r`}>
        <div className="flex items-center justify-between"><div><h1 className="font-extrabold text-foreground">PawFit Admin</h1><p className="text-xs text-muted-foreground">{user.email}</p></div><button className="md:hidden" onClick={() => setMobileNavOpen(false)} aria-label="Close menu"><X size={18} /></button></div>
        <nav className="mt-7 grid gap-1">
          {[["dashboard", "Dashboard", LayoutDashboard], ["products", "Products", Package], ["add", "Add Product", Plus], ["orders", "Orders", ShoppingBag], ["models", "3D Models", Box]].map(([view, label, Icon]) => { const AdminIcon = Icon as typeof Package; const isActive = adminView === view || (view === "add" && editing !== undefined); return <button key={String(view)} onClick={() => { setAdminView(view as typeof adminView); if (view === "add") openEditor(); else setMobileNavOpen(false); }} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-semibold ${isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}><AdminIcon size={17} /><span className="flex-1">{String(label)}</span>{view === "orders" && pendingOrderCount > 0 && <span className={`min-w-5 rounded-full px-1.5 py-0.5 text-center text-[10px] ${isActive ? "bg-surface text-primary" : "bg-accent text-white"}`}>{pendingOrderCount}</span>}</button>; })}
        </nav>
        <button onClick={() => void logout().then(() => { navigate("home"); toast.success("You have been signed out."); })} className="mt-8 flex items-center gap-2 px-3 text-sm font-semibold text-muted-foreground"><LogOut size={16} /> Sign out</button>
      </aside>
      <div>
      <header className="flex h-16 items-center justify-between border-b border-border bg-card px-4 md:hidden"><h1 className="font-bold text-foreground">PawFit Admin</h1><button onClick={() => setMobileNavOpen(true)} aria-label="Open admin menu"><Menu size={22} /></button></header>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        {adminView === "products" && <>
        <div>
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              Products and inventory
            </h2>
            <p className="text-muted-foreground mt-1">
              Create catalogue entries and maintain stock by garment size.
            </p>
          </div>
        </div>
        {error && (
          <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {loadingProducts ? (
          <p className="mt-10 text-muted-foreground">Loading products</p>
        ) : products.length ? (
          <>
          <div className="mt-6 flex flex-wrap items-end justify-between gap-3"><p className="text-sm text-muted-foreground">Showing {visibleProducts.length} of {products.length} products</p><label className="grid gap-1 text-xs font-bold text-muted-foreground"><span>Category</span><select value={productCategoryFilter} onChange={(event) => setProductCategoryFilter(event.target.value)} className="h-10 min-w-36 border border-border bg-surface px-3 text-sm font-semibold text-foreground outline-none focus:border-accent">{productCategories.map((category) => <option key={category} value={category}>{category}</option>)}</select></label></div>
          <div className="mt-8 overflow-x-auto border border-border rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleProducts.map((product) => (
                  <tr key={product.id} className="border-t border-border">
                    <td className="p-3">
                      <p className="font-bold text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₱{product.price.toLocaleString()} ·{" "}
                        {product.isActive ? "Active" : "Inactive"}
                      </p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-foreground">
                        {product.stock}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.inventory
                          .map(
                            (item) => `${item.size}: ${item.stock}`,
                          )
                          .join(", ")}
                      </p>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => openEditor(product)}
                        className="mr-3 text-primary font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void remove(product.id)}
                        className="text-destructive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {visibleProducts.length === 0 && <p className="mt-5 text-sm text-muted-foreground">No products are in this category yet.</p>}
          </>
        ) : (
          <div className="mt-8 border border-border rounded-2xl p-8 text-center">
            <Package className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              No products have been created yet.
            </p>
          </div>
        )}
        </>}
      </section>
      {adminView === "dashboard" && <AdminDashboard products={products} onShowOrders={() => setAdminView("orders")} onEditProduct={openEditor} />}
      {adminView === "orders" && <CompactOrders onOrdersChanged={() => void ordersApi.admin().then(({ orders }) => setPendingOrderCount(orders.filter((order) => order.status === "pending").length)).catch(() => undefined)} />}
      {adminView === "models" && <ModelsOverview products={products} onEditProduct={openEditor} />}
      {editing !== undefined && (
        <ProductEditor
          initial={editing || undefined}
          onClose={() => setEditing(undefined)}
          onProductSaved={load}
          categoryOptions={categoryOptions}
        />
      )}
      </div></main>
  );
}

function AdminDashboard({
  products,
  onShowOrders,
  onEditProduct,
}: {
  products: Product[];
  onShowOrders: () => void;
  onEditProduct: (product?: Product) => void;
}) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadOrders = async () => {
    setLoading(true);
    setError("");
    try {
      setOrders((await ordersApi.admin()).orders as AdminOrder[]);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load order statistics.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { void loadOrders(); }, []);

  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);
  const monthOrders = orders.filter((order) => new Date(order.createdAt) >= monthStart);
  const paidRevenue = monthOrders.filter((order) => order.paymentStatus === "paid").reduce((sum, order) => sum + order.total, 0);
  const lowStock = products.flatMap((product) => product.inventory.filter((item) => item.stock <= 3).map((item) => ({ product, item }))).slice(0, 5);
  const pending = orders.filter((order) => order.status === "pending").length;
  const statuses = ["pending", "confirmed", "processing", "shipped", "delivered"] as const;
  const recentOrders = [...orders].sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt)).slice(0, 5);
  const dailySales = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const total = orders.filter((order) => order.paymentStatus === "paid" && new Date(order.createdAt).toDateString() === date.toDateString()).reduce((sum, order) => sum + order.total, 0);
    return { label: date.toLocaleDateString(undefined, { weekday: "narrow" }), total };
  });
  const peakSales = Math.max(...dailySales.map((day) => day.total), 1);
  const statCards = [
    ["Needs action", pending, "Pending orders"],
    ["This month", monthOrders.length, "Orders received"],
    ["Paid revenue", `PHP ${paidRevenue.toLocaleString()}`, "Paid orders only"],
    ["Active products", products.filter((product) => product.isActive).length, `${lowStock.length} low or out sizes`],
  ];

  return <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Seller overview</p><h2 className="mt-1 text-2xl font-extrabold text-foreground">Good morning, PawFit</h2><p className="mt-1 text-muted-foreground">Today’s orders, revenue, and inventory signals in one place.</p></div>
      <div className="flex gap-2"><button onClick={() => void loadOrders()} className="rounded-lg border border-border bg-card p-2.5 text-muted-foreground" aria-label="Refresh dashboard" title="Refresh dashboard"><RefreshCw size={16} /></button><button onClick={onShowOrders} className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-primary-foreground"><ShoppingBag size={16} /> Review orders</button></div>
    </div>
    {error && <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger"><span>Order statistics could not load: {error}</span><button onClick={() => void loadOrders()} className="font-bold underline">Try again</button></div>}
    <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{statCards.map(([label, value, detail]) => <article key={String(label)} className="rounded-lg border border-border bg-card p-4"><p className="text-sm font-semibold text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-extrabold text-foreground">{loading ? "-" : value}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p></article>)}</div>
    <div className="mt-7 grid gap-5 lg:grid-cols-[1.35fr_0.9fr]">
      <section className="rounded-lg border border-border bg-card p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-foreground">Sales, last 7 days</h3><span className="text-xs text-muted-foreground">Paid orders</span></div>{orders.length ? <div className="mt-7 flex h-40 items-end gap-3">{dailySales.map((day) => <div key={day.label} className="flex flex-1 flex-col items-center gap-2"><span className="text-xs text-muted-foreground">{day.total ? `P${Math.round(day.total / 1000)}k` : ""}</span><div className="w-full rounded-t bg-accent" style={{ height: `${Math.max((day.total / peakSales) * 100, 4)}%` }} /><span className="text-xs text-muted-foreground">{day.label}</span></div>)}</div> : <p className="py-12 text-center text-sm text-muted-foreground">Sales data will appear after paid orders arrive.</p>}</section>
      <section className="rounded-lg border border-border bg-card p-5"><h3 className="font-bold text-foreground">Order status</h3><div className="mt-4 grid grid-cols-2 gap-2">{statuses.map((status) => <button key={status} onClick={onShowOrders} className="border border-border p-3 text-left hover:border-accent"><span className="block text-lg font-bold text-foreground">{orders.filter((order) => order.status === status).length}</span><span className="text-xs text-muted-foreground">{formatOrderStatus(status)}</span></button>)}</div></section>
    </div>
    <div className="mt-7 grid gap-5 lg:grid-cols-2">
      <section className="rounded-lg border border-border bg-card p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-foreground">Recent orders</h3><button onClick={onShowOrders} className="text-sm font-bold text-accent">View all</button></div><div className="mt-4 divide-y divide-border">{recentOrders.length ? recentOrders.map((order) => <button key={order.id} onClick={onShowOrders} className="flex w-full items-center justify-between gap-4 py-3 text-left"><span><span className="block text-sm font-bold text-foreground">{order.orderNumber}</span><span className="text-xs text-muted-foreground">{order.user?.name || order.deliveryAddress.firstName}</span></span><span className="text-right"><span className="block text-sm font-bold text-foreground">P{order.total.toLocaleString()}</span><span className="text-xs text-muted-foreground">{formatOrderStatus(order.status)}</span></span></button>) : <p className="py-7 text-center text-sm text-muted-foreground">No orders yet.</p>}</div></section>
      <section className="rounded-lg border border-border bg-card p-5"><div className="flex items-center justify-between"><h3 className="font-bold text-foreground">Low stock</h3><span className="text-xs text-muted-foreground">3 or fewer left</span></div><div className="mt-4 divide-y divide-border">{lowStock.length ? lowStock.map(({ product, item }) => <div key={`${product.id}-${item.size}`} className="flex items-center justify-between gap-3 py-3"><span><span className="block text-sm font-bold text-foreground">{product.name}</span><span className="text-xs text-muted-foreground">Size {item.size}</span></span><button onClick={() => onEditProduct(product)} className="text-sm font-bold text-accent">{item.stock} left · Edit</button></div>) : <p className="py-7 text-center text-sm text-muted-foreground">All listed sizes are comfortably stocked.</p>}</div></section>
    </div>
  </section>;
}

function ModelsOverview({ products, onEditProduct }: { products: Product[]; onEditProduct: (product: Product) => void }) {
  const [coverage, setCoverage] = useState<"all" | "ready" | "missing">("all");
  const [category, setCategory] = useState("all");
  const categories = Array.from(new Set(products.map((product) => product.category).filter(Boolean)));
  const modelCount = (product: Product) => product.colorVariants.reduce((total, color) => total + (color.models?.length || 0), 0);
  const readyProducts = products.filter((product) => modelCount(product) > 0).length;
  const visibleProducts = products.filter((product) => {
    const hasModels = modelCount(product) > 0;
    return (coverage === "all" || (coverage === "ready" ? hasModels : !hasModels)) && (category === "all" || product.category === category);
  });

  return <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div><p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">3D fitting library</p><h2 className="mt-1 text-2xl font-extrabold text-foreground">3D Models</h2><p className="mt-1 text-muted-foreground">Choose a product, then add or replace breed-specific GLB previews for each color.</p></div>
      <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-sm"><Box size={16} className="text-accent" /><span className="font-bold text-foreground">{readyProducts}</span><span className="text-muted-foreground">of {products.length} products have models</span></div>
    </div>
    <div className="mt-7 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[1fr_auto] md:items-end">
      <div><p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Model coverage</p><div className="mt-2 flex flex-wrap gap-2">{([ ["all", "All products"], ["missing", "Needs models"], ["ready", "Has models"] ] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setCoverage(value)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${coverage === value ? "border-primary bg-primary text-primary-foreground" : "border-border text-muted-foreground hover:border-accent"}`}>{label}</button>)}</div></div>
      <label className="grid gap-1 text-xs font-bold text-muted-foreground"><span className="flex items-center gap-1"><SlidersHorizontal size={13} /> Category</span><select value={category} onChange={(event) => setCategory(event.target.value)} className="input min-w-44"><option value="all">All categories</option>{categories.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
    </div>
    <p className="mt-4 text-sm text-muted-foreground">Showing {visibleProducts.length} product{visibleProducts.length === 1 ? "" : "s"}.</p>
    <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{visibleProducts.length ? visibleProducts.map((product) => {
      const count = modelCount(product);
      const colorsWithModels = product.colorVariants.filter((color) => color.models?.length).length;
      return <article key={product.id} className="overflow-hidden rounded-lg border border-border bg-card"><div className="flex h-36 items-center justify-center bg-preview-bg">{product.image ? <img src={product.image} alt="" className="h-full w-full object-cover" /> : <ImageIcon className="text-muted-foreground" size={30} />}</div><div className="p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-bold text-foreground">{product.name}</p><p className="mt-1 text-xs text-muted-foreground">{product.category || "Uncategorized"}</p></div>{count > 0 ? <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-bold text-success"><CheckCircle2 size={12} /> {count}</span> : <span className="shrink-0 rounded-full bg-muted px-2 py-1 text-xs font-bold text-muted-foreground">No models</span>}</div><p className="mt-3 text-sm text-muted-foreground">{colorsWithModels} of {product.colorVariants.length} color option{product.colorVariants.length === 1 ? "" : "s"} covered</p><div className="mt-3 flex flex-wrap gap-1.5">{product.colorVariants.map((color) => <span key={color.name} className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-xs ${color.models?.length ? "border-success/30 text-success" : "border-border text-muted-foreground"}`}><span className="h-2 w-2 rounded-full" style={{ backgroundColor: color.hex }} />{color.name}: {color.models?.length || 0}</span>)}</div><button onClick={() => onEditProduct(product)} className="mt-4 w-full rounded-lg border border-border px-3 py-2.5 text-sm font-bold text-primary hover:border-accent">Manage 3D models</button></div></article>;
    }) : <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground sm:col-span-2 lg:col-span-3">No products match these filters.</div>}</div>
  </section>;
}

function ProductEditor({
  initial,
  onClose,
  onProductSaved,
  categoryOptions,
}: {
  initial?: Product;
  onClose: () => void;
  onProductSaved: () => Promise<void>;
  categoryOptions: string[];
}) {
  const [product, setProduct] = useState<Product | null>(initial ?? null);
  const [draft, setDraft] = useState<Draft>(
    initial ? productDraft(initial) : emptyDraft(),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [galleryImages, setGalleryImages] = useState<string[]>(() => Array.from(new Set((initial?.images || []).filter((image) => image && image !== initial?.image))).slice(0, MAX_PRODUCT_IMAGES - 1));
  const [galleryFiles, setGalleryFiles] = useState<File[]>([]);
  const [queuedModels, setQueuedModels] = useState<QueuedModel[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [progress, setProgress] = useState("");
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(0);
  const imagePreview = useObjectUrl(imageFile);
  const isNew = !product;

  const updateVariant = (
    index: number,
    key: keyof InventoryItem,
    value: string | number | undefined,
  ) =>
    setDraft((current) => ({
      ...current,
      inventory: current.inventory.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, [key]: value } : variant,
      ),
    }));
  const addVariant = () =>
    setDraft((current) => ({
      ...current,
      inventory: [
        ...current.inventory,
        { size: "", sku: "", stock: 0, lowStockThreshold: 3 },
      ],
    }));
  const syncSizeSpecs = () =>
    setDraft((current) => {
      const existing = new Map(
        current.sizeSpecs.map((spec) => [spec.size, spec]),
      );
      const sizes = [
        ...new Set(
          current.inventory
            .map((variant) => variant.size.trim().toUpperCase())
            .filter(Boolean),
        ),
      ];
      return {
        ...current,
        sizeSpecs: sizes.map(
          (size) =>
            existing.get(size) || {
              size,
              neckMinCm: 0,
              neckMaxCm: 0,
              chestMinCm: 0,
              chestMaxCm: 0,
              backMinCm: 0,
              backMaxCm: 0,
            },
        ),
      };
    });
  const updateSizeSpec = (
    index: number,
    field: keyof Product["sizeSpecs"][number],
    value: number,
  ) =>
    setDraft((current) => ({
      ...current,
      sizeSpecs: current.sizeSpecs.map((spec, itemIndex) =>
        itemIndex === index ? { ...spec, [field]: value } : spec,
      ),
    }));

  const validateImage = () => {
    if (!imageFile && !product?.image) return "Choose a product image.";
    if (
      imageFile &&
      !["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)
    )
      return "Product image must be a JPEG, PNG, or WebP file.";
    return null;
  };

  const validateDraft = () => {
    if (!draft.name.trim() || !draft.category.trim() || !draft.description.trim() || draft.price < 0) {
      setStep(0);
      return "Add a product name, category, description, and valid price before saving.";
    }
    return null;
  };

  const validateGalleryImages = () => {
    if (galleryImages.length + galleryFiles.length > MAX_PRODUCT_IMAGES - 1)
      return `A product can have up to ${MAX_PRODUCT_IMAGES} images, including its cover.`;
    if (galleryFiles.some((file) => !["image/jpeg", "image/png", "image/webp"].includes(file.type)))
      return "Additional product images must be JPEG, PNG, or WebP files.";
    return null;
  };

  const validateQueuedModels = () => {
    const breeds = new Set<string>();
    for (const entry of queuedModels) {
      const breed = entry.breed.trim();
      if (!breed || !entry.file)
        return "Every queued 3D model needs a breed and a GLB file.";
      if (!entry.file.name.toLowerCase().endsWith(".glb"))
        return `${breed} must use a .glb file.`;
      const key = breed.toLowerCase();
      if (breeds.has(key))
        return `Only one queued 3D model is allowed for ${breed}.`;
      breeds.add(key);
    }
    return null;
  };

  const uploadQueuedModels = async (currentProduct: Product) => {
    const failed: QueuedModel[] = [];
    let updatedProduct = currentProduct;
    for (const entry of queuedModels) {
      setProgress(`Uploading ${entry.breed.trim()} model...`);
      try {
        updatedProduct = await productsApi.uploadModel(
          updatedProduct.id,
          entry.breed.trim(),
          entry.file as File,
          entry.colorName,
        );
      } catch (uploadError) {
        failed.push(entry);
        setError(
          (current) =>
            `${current ? `${current} ` : ""}${entry.breed.trim()}: ${uploadError instanceof Error ? uploadError.message : "model upload failed."}`,
        );
      }
    }
    setQueuedModels(failed);
    return { product: updatedProduct, failed };
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const draftError = validateDraft();
    const imageError = validateImage();
    const galleryError = validateGalleryImages();
    const modelError = validateQueuedModels();
    if (draftError || imageError || galleryError || modelError) {
      setError(draftError || imageError || galleryError || modelError || "");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let saved: Product;
      if (product) {
        setProgress("Saving product details...");
        saved = product;
        if (imageFile) {
          setProgress("Uploading product cover image...");
          saved = await productsApi.uploadImage(saved.id, imageFile);
          setImageFile(null);
        }
        setProgress("Uploading additional product images...");
        const galleryUploads = await Promise.all(
          galleryFiles.map((file) => productsApi.uploadPendingImage(file)),
        );
        const finalGallery = [
          saved.image,
          ...galleryImages,
          ...galleryUploads.map((upload) => upload.imagePath),
        ].slice(0, MAX_PRODUCT_IMAGES);
        setProgress("Saving product details...");
        saved = await productsApi.update(saved.id, { ...draft, images: finalGallery });
        setGalleryImages(finalGallery.slice(1));
        setGalleryFiles([]);
      } else {
        setProgress("Uploading product image...");
        const { imagePath, imageCloudinaryPublicId } =
          await productsApi.uploadPendingImage(imageFile as File);
        const galleryUploads = await Promise.all(galleryFiles.map((file) => productsApi.uploadPendingImage(file)));
        setProgress("Creating product...");
        saved = await productsApi.create({
          ...draft,
          image: imagePath,
          imageCloudinaryPublicId,
          images: [imagePath, ...galleryUploads.map((upload) => upload.imagePath)],
        });
        setImageFile(null);
        setGalleryFiles([]);
      }
      setProduct(saved);
      const queuedCount = queuedModels.length;
      const modelUpload = queuedCount ? await uploadQueuedModels(saved) : null;
      if (modelUpload) saved = modelUpload.product;
      setProduct(saved);
      setDraft(productDraft(saved));
      if (modelUpload?.failed.length)
        setSuccess("Product created. Retry the failed 3D model uploads below.");
      else if (queuedCount)
        setSuccess("Product and 3D models created successfully.");
      else
        setSuccess(
          isNew ? "Product created successfully." : "Product details saved.",
        );
      await onProductSaved();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save product",
      );
    } finally {
      setProgress("");
      setSaving(false);
    }
  };

  const updateProductFromModelUpload = async (updatedProduct: Product) => {
    setProduct(updatedProduct);
    setDraft(productDraft(updatedProduct));
    void onProductSaved().catch(() => {});
  };
  const currentImage = imagePreview || product?.image;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto p-4">
      <form
        onSubmit={save}
        noValidate
        className="admin-editor my-6 mx-auto max-w-3xl bg-card rounded-3xl border border-border"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div><h2 className="font-extrabold text-foreground">{product ? "Edit Product" : "Add Product"}</h2><p className="mt-0.5 text-xs text-muted-foreground">Step {step + 1} of 6</p></div>
          <button type="button" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="grid grid-cols-6 border-b border-border px-5 py-3">{["Basics", "Colors", "Inventory", "Sizing", "3D models", "Review"].map((label, index) => <button key={label} type="button" onClick={() => setStep(index)} className={`border-b-2 pb-2 text-[10px] font-bold uppercase tracking-[0.06em] sm:text-xs ${step === index ? "border-accent text-accent" : index < step ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>{label}</button>)}</div>
        <div className="p-4 grid gap-4">
          {error && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-success/10 p-3 text-sm text-success">
              {success}
            </p>
          )}
          {progress && (
            <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              {progress}
            </p>
          )}
          <section className={`grid gap-4 ${step === 0 ? "" : "hidden"}`}>
            <h3 className="font-bold text-foreground">Product Details</h3>
            <Label text="Product name">
              <input
                required
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
                className="input"
              />
            </Label>
            <div className="grid sm:grid-cols-2 gap-4">
              <Label text="Category">
                <select value={categoryOptions.some((option) => option.toLowerCase() === draft.category.toLowerCase()) ? draft.category : "other"} onChange={(event) => setDraft({ ...draft, category: event.target.value === "other" ? "" : event.target.value })} className="input">
                  <option value="" disabled>Select a category</option>
                  {categoryOptions.map((option) => <option key={option} value={option}>{option}</option>)}
                  <option value="other">Other</option>
                </select>
                {!categoryOptions.some((option) => option.toLowerCase() === draft.category.toLowerCase()) && <input required value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value.trimStart() })} placeholder="Custom category" className="input" />}
              </Label>
              <Label text="Price">
                <input
                  type="number"
                  min="0"
                  required
                  value={draft.price || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, price: Number(event.target.value) })
                  }
                  className="input"
                />
              </Label>
            </div>
            <Label text="Description">
              <textarea
                required
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
                rows={4}
                className="input"
              />
            </Label>
            <ImagePicker
              file={imageFile}
              preview={currentImage}
              onChange={setImageFile}
            />
            <GalleryPicker
              existing={galleryImages}
              files={galleryFiles}
              remaining={MAX_PRODUCT_IMAGES - 1 - galleryImages.length - galleryFiles.length}
              onAdd={(files) => setGalleryFiles((current) => [...current, ...files].slice(0, MAX_PRODUCT_IMAGES - 1 - galleryImages.length))}
              onRemoveExisting={(image) => setGalleryImages((current) => current.filter((entry) => entry !== image))}
              onRemoveFile={(file) => setGalleryFiles((current) => current.filter((entry) => entry !== file))}
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) =>
                  setDraft({ ...draft, featured: event.target.checked })
                }
              />{" "}
              Featured product
            </label>
          </section>
          <div className={step === 1 ? "" : "hidden"}><ColorVariantsEditor variants={draft.colorVariants} onChange={(colorVariants) => setDraft({ ...draft, colorVariants })} /></div>
          <section className={`border-t border-border pt-5 ${step === 2 ? "" : "hidden"}`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground">
                  Inventory Variants
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use variants for sellable options such as size or color. Each
                  variant can have its own SKU, price, and stock.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="shrink-0 text-sm font-semibold text-primary"
              >
                Add variant
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {draft.inventory.map((variant, index) => (
                <InventoryRow
                  key={variant._id || index}
                  variant={variant}
                  onChange={(key, value) => updateVariant(index, key, value)}
                  onRemove={() =>
                    setDraft((current) => ({
                      ...current,
                      inventory: current.inventory.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    }))
                  }
                />
              ))}
            </div>
          </section>
          <section className={`border-t border-border pt-5 ${step === 3 ? "" : "hidden"}`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground">
                  Product size specifications
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Set the product garment ranges in cm. These values are product
                  specifications, not breed standards.
                </p>
              </div>
              <button
                type="button"
                onClick={syncSizeSpecs}
                className="shrink-0 text-sm font-semibold text-primary"
              >
                Sync sizes
              </button>
            </div>
            <SizeSpecEditor specs={draft.sizeSpecs} onChange={updateSizeSpec} />
          </section>
          <div className={step === 4 ? "" : "hidden"}>{!product || queuedModels.length ? (
            <QueuedModelsSection
              entries={queuedModels}
              product={product}
              colorVariants={draft.colorVariants}
              disabled={saving}
              onChange={setQueuedModels}
              onUploaded={updateProductFromModelUpload}
            />
          ) : (
            <ModelUploadSection
              product={product}
              colorVariants={draft.colorVariants}
              onUploaded={updateProductFromModelUpload}
            />
          )}</div>
          {step === 5 && <section className="rounded-lg border border-border bg-muted p-5"><h3 className="font-bold text-foreground">Ready to {product ? "save changes" : "create this product"}</h3><dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2"><div><dt className="text-muted-foreground">Product</dt><dd className="font-semibold text-foreground">{draft.name || "Not named yet"}</dd></div><div><dt className="text-muted-foreground">Category</dt><dd className="font-semibold text-foreground">{draft.category || "Not chosen yet"}</dd></div><div><dt className="text-muted-foreground">Price</dt><dd className="font-semibold text-foreground">P{draft.price.toLocaleString()}</dd></div><div><dt className="text-muted-foreground">Sellable sizes</dt><dd className="font-semibold text-foreground">{draft.inventory.length}</dd></div></dl><p className="mt-4 text-sm text-muted-foreground">Confirm the details, then use the primary action below. You can return to any step to revise them.</p></section>}
        </div>
        <div className="flex gap-3 p-5 border-t border-border">
          <button type="button" onClick={step === 0 ? onClose : () => setStep((current) => current - 1)} className="flex-1 py-3 rounded-lg border border-border font-semibold">{step === 0 ? "Cancel" : "Back"}</button>
          {step < 5 ? <button type="button" onClick={() => setStep((current) => current + 1)} className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-bold">Continue</button> : <button disabled={saving} className="flex-1 py-3 rounded-lg bg-primary text-primary-foreground font-bold disabled:opacity-50">{saving ? "Working..." : product ? "Save Product Details" : "Create Product"}</button>}
        </div>
      </form>
    </div>
  );
}

function ImagePicker({
  file,
  preview,
  onChange,
}: {
  file: File | null;
  preview?: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground">Product Image</p>
      <div className="mt-1.5 rounded-xl border border-border p-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          className="input"
        />
        {file && (
          <p className="mt-2 text-sm text-muted-foreground">
            Selected: {file.name}
          </p>
        )}
        {preview && (
          <img
            src={preview}
            alt="Selected product preview"
            className="mt-3 h-36 w-36 rounded-xl border border-border object-cover"
          />
        )}
        {file && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="mt-3 text-sm font-semibold text-destructive"
          >
            Remove selected image
          </button>
        )}
      </div>
    </div>
  );
}

function GalleryPicker({
  existing,
  files,
  remaining,
  onAdd,
  onRemoveExisting,
  onRemoveFile,
}: {
  existing: string[];
  files: File[];
  remaining: number;
  onAdd: (files: File[]) => void;
  onRemoveExisting: (image: string) => void;
  onRemoveFile: (file: File) => void;
}) {
  return <section><div className="flex items-baseline justify-between gap-3"><div><p className="text-xs font-bold text-muted-foreground">Additional product images</p><p className="mt-1 text-xs text-muted-foreground">Up to {MAX_PRODUCT_IMAGES} images total, including the cover.</p></div><span className="text-xs font-semibold text-muted-foreground">{remaining} slot{remaining === 1 ? "" : "s"} left</span></div><div className="mt-2 border border-border p-3"><input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={remaining === 0} onChange={(event) => { onAdd(Array.from(event.target.files || []).slice(0, remaining)); event.currentTarget.value = ""; }} className="input" />{(existing.length || files.length) > 0 && <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">{existing.map((image) => <div key={image} className="relative aspect-square overflow-hidden border border-border"><img src={image} alt="Saved additional product" className="h-full w-full object-cover" /><button type="button" onClick={() => onRemoveExisting(image)} className="absolute right-1 top-1 grid h-7 w-7 place-items-center bg-surface text-destructive" aria-label="Remove additional image"><X size={15} /></button></div>)}{files.map((file) => <div key={`${file.name}-${file.lastModified}`} className="relative flex aspect-square items-end border border-dashed border-border bg-muted p-2"><span className="break-all text-xs text-muted-foreground">{file.name}</span><button type="button" onClick={() => onRemoveFile(file)} className="absolute right-1 top-1 grid h-7 w-7 place-items-center bg-surface text-destructive" aria-label={`Remove ${file.name}`}><X size={15} /></button></div>)}</div>}</div></section>;
}

function SizeSpecEditor({
  specs,
  onChange,
}: {
  specs: Product["sizeSpecs"];
  onChange: (
    index: number,
    field: keyof Product["sizeSpecs"][number],
    value: number,
  ) => void;
}) {
  if (!specs.length)
    return (
      <p className="mt-4 text-sm text-muted-foreground">
        Add inventory sizes, then select Sync sizes to enter their garment
        specifications.
      </p>
    );
  const fields = [
    ["neckMinCm", "Neck min"],
    ["neckMaxCm", "Neck max"],
    ["chestMinCm", "Chest min"],
    ["chestMaxCm", "Chest max"],
    ["backMinCm", "Back min"],
    ["backMaxCm", "Back max"],
  ] as const;
  return (
    <div className="mt-4 space-y-3">
      {specs.map((spec, index) => (
        <div
          key={spec.size}
          className="grid grid-cols-2 gap-3 rounded-xl border border-border p-3 sm:grid-cols-4 lg:grid-cols-7"
        >
          <p className="col-span-2 self-center font-bold sm:col-span-1">
            {spec.size}
          </p>
          {fields.map(([field, label]) => (
            <Label key={field} text={label}>
              <input
                required
                type="number"
                min="0"
                max="300"
                step="0.1"
                value={spec[field] || ""}
                onChange={(event) =>
                  onChange(index, field, Number(event.target.value))
                }
                className="input"
              />
            </Label>
          ))}
        </div>
      ))}
    </div>
  );
}

function InventoryRow({
  variant,
  onChange,
  onRemove,
}: {
  variant: InventoryItem;
  onChange: (key: keyof InventoryItem, value: string | number | undefined) => void;
  onRemove: () => void;
}) {
  const [stockText, setStockText] = useState(String(variant.stock));
  const [thresholdText, setThresholdText] = useState(
    String(variant.lowStockThreshold),
  );
  const [priceText, setPriceText] = useState(variant.price?.toString() || "");

  useEffect(() => setStockText(String(variant.stock)), [variant.stock]);
  useEffect(
    () => setThresholdText(String(variant.lowStockThreshold)),
    [variant.lowStockThreshold],
  );
  useEffect(() => setPriceText(variant.price?.toString() || ""), [variant.price]);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-xl border border-border p-3">
      <Label text="Size">
        <input
          required
          value={variant.size}
          onChange={(event) => onChange("size", event.target.value)}
          placeholder="e.g. M"
          className="input"
        />
      </Label>
      <Label text="SKU">
        <input
          required
          value={variant.sku}
          onChange={(event) => onChange("sku", event.target.value)}
          placeholder="e.g. HOODIE-LAB-M"
          className="input"
        />
      </Label>
      <Label text="Stock">
        <input
          type="number"
          min="0"
          required
          value={stockText}
          onChange={(event) => {
            setStockText(event.target.value);
            if (event.target.value !== "")
              onChange("stock", Number(event.target.value));
          }}
          placeholder="0"
          className="input"
        />
      </Label>
      <Label text="Low stock threshold">
        <input
          type="number"
          min="0"
          value={thresholdText}
          onChange={(event) => {
            setThresholdText(event.target.value);
            if (event.target.value !== "")
              onChange("lowStockThreshold", Number(event.target.value));
          }}
          placeholder="3"
          className="input"
        />
      </Label>
      <Label text="Size price (optional)">
        <input
          type="number"
          min="0"
          step="0.01"
          value={priceText}
          onChange={(event) => {
            setPriceText(event.target.value);
            onChange("price", event.target.value === "" ? undefined : Number(event.target.value));
          }}
          placeholder="Use base price"
          className="input"
        />
      </Label>
      <div className="flex items-end">
        <button
          type="button"
          onClick={onRemove}
          className="w-full py-2.5 text-sm font-semibold text-destructive"
        >
          Remove variant
        </button>
      </div>
    </div>
  );
}

function ColorVariantsEditor({ variants, onChange }: { variants: Draft["colorVariants"]; onChange: (variants: Draft["colorVariants"]) => void }) {
  const update = (index: number, patch: Partial<Draft["colorVariants"][number]>) => onChange(variants.map((variant, itemIndex) => itemIndex === index ? { ...variant, ...patch } : variant));
  return (
    <section className="border-t border-border pt-5">
      <div className="flex items-center justify-between gap-4"><div><h3 className="font-bold text-foreground">Color Variants</h3><p className="mt-1 text-sm text-muted-foreground">Each color can have its own breed-specific GLB uploads.</p></div><button type="button" onClick={() => onChange([...variants, { name: "", hex: "#000000", models: [] }])} className="text-sm font-semibold text-primary">Add color</button></div>
      <div className="mt-3 space-y-3">{variants.map((variant, index) => <div key={variant._id || index} className="grid gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_8rem_auto]"><Label text="Color name"><input required value={variant.name} onChange={(event) => update(index, { name: event.target.value })} placeholder="e.g. Coral" className="input" /></Label><Label text="Hex"><div className="flex gap-2"><input type="color" value={variant.hex} onChange={(event) => update(index, { hex: event.target.value })} className="h-10 w-10 rounded border border-border p-1" /><input value={variant.hex} onChange={(event) => update(index, { hex: event.target.value })} className="input" /></div></Label><div className="flex items-end"><button type="button" disabled={variants.length === 1} onClick={() => onChange(variants.filter((_, itemIndex) => itemIndex !== index))} className="py-2 text-sm font-semibold text-destructive disabled:opacity-40">Remove</button></div></div>)}</div>
    </section>
  );
}

function QueuedModelsSection({
  entries,
  product,
  colorVariants,
  disabled,
  onChange,
  onUploaded,
}: {
  entries: QueuedModel[];
  product: Product | null;
  colorVariants: Draft["colorVariants"];
  disabled: boolean;
  onChange: (entries: QueuedModel[]) => void;
  onUploaded: (product: Product) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const update = (id: string, patch: Partial<QueuedModel>) =>
    onChange(
      entries.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    );
  const retry = async () => {
    if (!product) return;
    const failed: QueuedModel[] = [];
    let updated = product;
    setError("");
    setUploading(true);
    for (const entry of entries) {
      try {
        if (
          !entry.breed.trim() ||
          !entry.file ||
          !entry.file.name.toLowerCase().endsWith(".glb")
        )
          throw new Error("A breed and .glb file are required");
        if (entry.file.size > MAX_GLB_FILE_SIZE_BYTES)
          throw new Error(
            `This Cloudinary account currently allows GLB files up to ${MAX_GLB_FILE_SIZE_LABEL}.`,
          );
        updated = await productsApi.uploadModel(
          updated.id,
          entry.breed.trim(),
          entry.file,
          entry.colorName,
        );
      } catch (requestError) {
        failed.push(entry);
        setError(
          (current) =>
            `${current ? `${current} ` : ""}${entry.breed || "Unnamed breed"}: ${requestError instanceof Error ? requestError.message : "model upload failed."}`,
        );
      }
    }
    onChange(failed);
    await onUploaded(updated);
    setUploading(false);
  };
  return (
    <section className="border-t border-border pt-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-foreground">
            Breed-Specific 3D Models
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add complete GLB models now. They will upload after the product is
            created.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => onChange([...entries, createQueueRow()])}
          className="shrink-0 text-sm font-semibold text-primary"
        >
          Add model
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4 space-y-3">
        {entries.length ? (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-3 rounded-xl border border-border p-3"
            >
              <Label text="Color"><select value={entry.colorName} onChange={(event) => update(entry.id, { colorName: event.target.value })} className="input">{colorVariants.map((variant) => <option key={variant.name} value={variant.name}>{variant.name}</option>)}</select></Label>
              <Label text="Breed">
                <input
                  value={entry.breed}
                  onChange={(event) =>
                    update(entry.id, { breed: event.target.value })
                  }
                  placeholder="e.g. Labrador"
                  className="input"
                />
              </Label>
              <Label text="GLB file">
                <input
                  type="file"
                  accept=".glb,model/gltf-binary"
                  onChange={(event) =>
                    update(entry.id, { file: event.target.files?.[0] ?? null })
                  }
                  className="input"
                />
                {entry.file && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {entry.file.name}
                  </span>
                )}
              </Label>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() =>
                    onChange(entries.filter((item) => item.id !== entry.id))
                  }
                  className="w-full py-2.5 text-sm font-semibold text-destructive"
                >
                  Remove row
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No models queued. Add a row to upload breed-specific GLB files after
            creation.
          </p>
        )}
      </div>
      {product && entries.length > 0 && (
        <button
          type="button"
          disabled={uploading || disabled}
          onClick={() => void retry()}
          className="mt-4 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50"
        >
          {uploading ? "Uploading queued models..." : "Retry queued models"}
        </button>
      )}
    </section>
  );
}

function ModelUploadSection({
  product,
  colorVariants,
  onUploaded,
}: {
  product: Product;
  colorVariants: Draft["colorVariants"];
  onUploaded: (product: Product) => Promise<void>;
}) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [customBreed, setCustomBreed] = useState("");
  const [selectedColorName, setSelectedColorName] = useState(product.colorVariants[0]?.name || "Default");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [busyBreed, setBusyBreed] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const selectedColor = product.colorVariants.find((variant) => variant.name === selectedColorName) || product.colorVariants[0];
  const breeds = selectedColor?.models.map((model) => model.breed) || [];

  const upload = async (breed: string, file: File | null) => {
    if (!breed.trim())
      return setError("Enter a breed before uploading a model.");
    if (!file) return setError("Choose a GLB file before uploading.");
    if (!file.name.toLowerCase().endsWith(".glb"))
      return setError("Only .glb files are allowed.");
    if (file.size > MAX_GLB_FILE_SIZE_BYTES)
      return setError(
        `This Cloudinary account currently allows GLB files up to ${MAX_GLB_FILE_SIZE_LABEL}.`,
      );
    setBusyBreed(breed);
    setError("");
    setSuccess("");
    try {
      await onUploaded(await productsApi.uploadModel(product.id, breed, file, selectedColorName));
      setSuccess(
        `${breed} model ${selectedColor?.models.some((model) => model.breed.toLowerCase() === breed.toLowerCase()) ? "replaced" : "uploaded"}.`,
      );
      setCustomBreed("");
      setCustomFile(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to upload the ${breed} model.`,
      );
    } finally {
      setBusyBreed(null);
    }
  };

  const remove = async (breed: string) => {
    setBusyBreed(breed);
    setError("");
    setSuccess("");
    try {
      await onUploaded(await productsApi.deleteModel(product.id, breed, selectedColorName));
      setSuccess(`${breed} model deleted.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to delete the ${breed} model.`,
      );
    } finally {
      setBusyBreed(null);
    }
  };

  return (
    <section className="border-t border-border pt-5">
      <h3 className="font-bold text-foreground">3D Models</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload one complete GLB model for each breed, up to 10 MB. The model
        should already contain the dog wearing this product.
      </p>
      {error && <p aria-live="polite" className="mt-3 text-sm text-destructive">{error}</p>}
      {success && <p aria-live="polite" className="mt-3 text-sm text-success">{success}</p>}
      <Label text="Color variant"><select value={selectedColorName} onChange={(event) => setSelectedColorName(event.target.value)} className="input mt-3">{colorVariants.map((variant) => <option key={variant.name} value={variant.name}>{variant.name} ({variant.hex})</option>)}</select></Label>
      <div className="mt-4 space-y-3">
        {breeds.map((breed) => {
          const model = selectedColor?.models.find(
            (item) => item.breed.toLowerCase() === breed.toLowerCase(),
          );
          const busy = busyBreed === breed;
          return (
            <div
              key={breed.toLowerCase()}
              className="flex min-w-0 flex-col gap-3 rounded-xl border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <input
                ref={(element) => {
                  inputRefs.current[breed] = element;
                }}
                type="file"
                accept=".glb,model/gltf-binary"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (file) void upload(breed, file);
                  event.currentTarget.value = "";
                }}
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-foreground">{breed}</p>
                {model ? (
                  <>
                    <p className="text-xs text-success">Uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      Cloudinary model ready for preview
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No model uploaded
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-4">
                {model && (
                  <button
                    type="button"
                    disabled={Boolean(busyBreed)}
                    onClick={() => inputRefs.current[breed]?.click()}
                    className="text-sm font-semibold text-primary disabled:opacity-50"
                  >
                    {busy ? "Replacing" : "Replace"}
                  </button>
                )}
                {model ? (
                  <button
                    type="button"
                    disabled={Boolean(busyBreed)}
                    onClick={() => void remove(breed)}
                    className="text-sm font-semibold text-destructive disabled:opacity-50"
                  >
                    {busy ? "Deleting" : "Delete"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={Boolean(busyBreed)}
                    onClick={() => inputRefs.current[breed]?.click()}
                    className="text-sm font-semibold text-primary disabled:opacity-50"
                  >
                    {busy ? "Uploading" : "Upload"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid min-w-0 gap-3 rounded-xl border border-border p-3 sm:grid-cols-[1fr_1.5fr_auto]">
        <Label text="Additional breed">
          <input
            value={customBreed}
            onChange={(event) => setCustomBreed(event.target.value)}
            placeholder="e.g. Husky"
            className="input"
          />
        </Label>
        <Label text="GLB file">
          <input
            type="file"
            accept=".glb,model/gltf-binary"
            onChange={(event) => setCustomFile(event.target.files?.[0] ?? null)}
            className="input"
          />
        </Label>
        <div className="flex items-end">
          <button
            type="button"
            disabled={Boolean(busyBreed)}
            onClick={() => void upload(customBreed.trim(), customFile)}
            className="w-full py-2.5 text-sm font-semibold text-primary disabled:opacity-50"
          >
            Upload model
          </button>
        </div>
      </div>
    </section>
  );
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | undefined>();
  useEffect(() => {
    if (!file) {
      setUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
}
function productDraft(product: Product): Draft {
  return {
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description,
    image: product.image,
    images: product.images,
    featured: product.featured,
    inventory: product.inventory,
    sizeCharts: product.sizeCharts,
    sizeSpecs: product.sizeSpecs,
    colorVariants: product.colorVariants,
  };
}
function filenameFromPath(modelPath: string) {
  return modelPath.split("/").pop() || modelPath;
}
function Label({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold text-muted-foreground">
      {text}
      {children}
    </label>
  );
}

type AdminOrder = Order & {
  user?: { name: string; email: string };
};

const statuses: Order["status"][] = [
  "pending",
  "confirmed",
  "processing",
];

const paymentStatuses: Order["paymentStatus"][] = [
  "pending",
  "paid",
  "failed",
];

function formatOrderStatus(status: string) {
  return status
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

function CompactOrders({ onOrdersChanged }: { onOrdersChanged: () => void }) {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");
  const [paymentFilter, setPaymentFilter] = useState<"all" | Order["paymentStatus"]>("all");
  const [query, setQuery] = useState("");
  const [dateRange, setDateRange] = useState("all");
  const [sort, setSort] = useState("newest");
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const pageSize = 10;
  const load = async () => { setLoading(true); setError(""); try { setOrders((await ordersApi.admin()).orders as AdminOrder[]); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load orders"); } finally { setLoading(false); } };
  useEffect(() => { void load(); }, []);
  useEffect(() => { setPage(0); }, [filter, paymentFilter, query, dateRange, sort]);
  const visibleOrders = orders.filter((order) => {
    const date = new Date(order.createdAt);
    const now = new Date();
    const matchesDate = dateRange === "all" || (dateRange === "week" && now.getTime() - date.getTime() <= 7 * 24 * 60 * 60 * 1000) || (dateRange === "month" && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear());
    return matchesDate && (filter === "all" || order.status === filter) && (paymentFilter === "all" || order.paymentStatus === paymentFilter) && `${order.orderNumber} ${order.user?.name || ""} ${order.user?.email || order.deliveryAddress.email}`.toLowerCase().includes(query.toLowerCase());
  }).sort((a, b) => sort === "oldest" ? +new Date(a.createdAt) - +new Date(b.createdAt) : sort === "value" ? b.total - a.total : +new Date(b.createdAt) - +new Date(a.createdAt));
  const pageCount = Math.max(1, Math.ceil(visibleOrders.length / pageSize));
  const pagedOrders = visibleOrders.slice(page * pageSize, page * pageSize + pageSize);
  const update = async (order: AdminOrder, status: Order["status"], paymentStatus = order.paymentStatus, cancellationReason?: string) => { setSaving(order.id); setError(""); try { const result = await ordersApi.updateStatus(order.id, status, paymentStatus, cancellationReason); setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...result.order } : item)); onOrdersChanged(); } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to update order"); } finally { setSaving(null); } };
  const workflowStatuses = ["pending", "confirmed", "processing", "cancelled"] as const;
  const tabs = ["all", ...workflowStatuses] as const;
  const pendingFulfillment = orders.filter((order) => order.status === "pending" || order.status === "confirmed").length;
  const paymentDue = orders.filter((order) => order.paymentStatus === "pending").length;
  const displayedValue = visibleOrders.reduce((total, order) => total + order.total, 0);
  return <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Fulfillment</p><h2 className="mt-1 text-2xl font-extrabold text-foreground">Orders</h2><p className="mt-1 text-muted-foreground">Review payments and move each order through fulfillment.</p></div><button type="button" onClick={() => void load()} className="rounded-lg border border-border bg-card p-2.5 text-muted-foreground hover:border-accent" aria-label="Refresh orders" title="Refresh orders"><RefreshCw size={16} /></button></div>
    <div className="mt-7 grid gap-3 sm:grid-cols-3"><article className="rounded-lg border border-border bg-card p-4"><p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Needs fulfillment</p><p className="mt-2 text-2xl font-extrabold text-foreground">{loading ? "-" : pendingFulfillment}</p><p className="mt-1 text-sm text-muted-foreground">Pending or confirmed</p></article><article className="rounded-lg border border-border bg-card p-4"><p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Payment pending</p><p className="mt-2 text-2xl font-extrabold text-foreground">{loading ? "-" : paymentDue}</p><p className="mt-1 text-sm text-muted-foreground">Orders awaiting payment</p></article><article className="rounded-lg border border-border bg-card p-4"><p className="text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">Visible order value</p><p className="mt-2 text-2xl font-extrabold text-foreground">P{loading ? "-" : displayedValue.toLocaleString()}</p><p className="mt-1 text-sm text-muted-foreground">Matches the filters below</p></article></div>
    <div className="mt-7 flex gap-2 overflow-x-auto pb-1">{tabs.map((status) => <button key={status} onClick={() => setFilter(status)} className={`whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold ${filter === status ? "border-primary bg-primary text-primary-foreground" : "border-border bg-card text-muted-foreground hover:border-accent"}`}>{status === "all" ? "All" : formatOrderStatus(status)} <span className="ml-1 text-xs">{status === "all" ? orders.length : orders.filter((order) => order.status === status).length}</span></button>)}</div>
    <div className="mt-4 grid gap-3 rounded-lg border border-border bg-card p-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]"><label className="relative block"><Search aria-hidden="true" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search order number, customer, or email" className="input pl-9" /></label><label className="grid gap-1 text-xs font-bold text-muted-foreground"><span>Payment</span><select value={paymentFilter} onChange={(event) => setPaymentFilter(event.target.value as typeof paymentFilter)} className="input w-auto"><option value="all">All payments</option><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></label><label className="grid gap-1 text-xs font-bold text-muted-foreground"><span>Date</span><select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="input w-auto"><option value="all">All dates</option><option value="week">Last 7 days</option><option value="month">This month</option></select></label><label className="grid gap-1 text-xs font-bold text-muted-foreground"><span>Sort</span><select value={sort} onChange={(event) => setSort(event.target.value)} className="input w-auto"><option value="newest">Newest first</option><option value="oldest">Oldest first</option><option value="value">Highest value</option></select></label></div>
    {error && <p className="mt-5 rounded-lg bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}
    <div className="mt-6 overflow-x-auto rounded-lg border border-border bg-card">{loading ? <p className="p-8 text-center text-muted-foreground">Loading orders</p> : pagedOrders.length ? <table className="w-full min-w-[800px] text-sm"><thead className="border-b border-border bg-muted text-left text-xs uppercase tracking-[0.08em] text-muted-foreground"><tr><th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Items</th><th className="p-4">Total</th><th className="p-4">Payment</th><th className="p-4">Fulfillment</th></tr></thead><tbody>{pagedOrders.map((order) => <tr key={order.id} className="border-b border-border align-top last:border-0"><td className="p-4"><p className="font-bold text-foreground">{order.orderNumber}</p><p className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}</p></td><td className="p-4"><p className="font-semibold text-foreground">{order.user?.name || `${order.deliveryAddress.firstName} ${order.deliveryAddress.lastName}`}</p><p className="mt-1 max-w-44 truncate text-xs text-muted-foreground">{order.user?.email || order.deliveryAddress.email}</p></td><td className="p-4"><p className="font-semibold text-foreground">{order.items.reduce((sum, item) => sum + item.quantity, 0)} item(s)</p><p className="mt-1 max-w-36 truncate text-xs text-muted-foreground">{order.items.map((item) => item.name).join(", ")}</p></td><td className="p-4 font-bold text-foreground">P{order.total.toLocaleString()}</td><td className="p-4"><select disabled={saving === order.id} value={order.paymentStatus} onChange={(event) => void update(order, order.status, event.target.value as Order["paymentStatus"])} className="border border-border bg-surface px-2 py-2 text-xs font-semibold text-foreground"><option value="pending">Pending</option><option value="paid">Paid</option><option value="failed">Failed</option><option value="refunded">Refunded</option></select></td><td className="p-4"><select disabled={saving === order.id || !workflowStatuses.includes(order.status as typeof workflowStatuses[number])} value={order.status} onChange={(event) => { const next = event.target.value as Order["status"]; if (next === "cancelled" && order.status !== "cancelled") { const reason = window.prompt("Enter the cancellation reason for the customer."); if (!reason?.trim()) { setError("A cancellation reason is required."); return; } void update(order, next, order.paymentStatus, reason.trim()); return; } void update(order, next); }} className="border border-border bg-surface px-2 py-2 text-xs font-semibold text-foreground">{!workflowStatuses.includes(order.status as typeof workflowStatuses[number]) && <option value={order.status}>{formatOrderStatus(order.status)} (historical)</option>}{workflowStatuses.map((status) => <option key={status} value={status}>{formatOrderStatus(status)}</option>)}</select>{saving === order.id && <p className="mt-1 text-xs text-muted-foreground">Saving...</p>}</td></tr>)}</tbody></table> : <p className="p-8 text-center text-muted-foreground">No orders match this view.</p>}</div>
    {!loading && visibleOrders.length > pageSize && <div className="mt-4 flex items-center justify-between text-sm"><span className="text-muted-foreground">Page {page + 1} of {pageCount}</span><div className="flex gap-2"><button disabled={page === 0} onClick={() => setPage((current) => current - 1)} className="rounded-lg border border-border px-3 py-2 disabled:text-muted-foreground">Previous</button><button disabled={page + 1 >= pageCount} onClick={() => setPage((current) => current + 1)} className="rounded-lg border border-border px-3 py-2 disabled:text-muted-foreground">Next</button></div></div>}
  </section>;
}

function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      setOrders((await ordersApi.admin()).orders as AdminOrder[]);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load orders",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const update = async (
    order: AdminOrder,
    status: Order["status"],
    paymentStatus: Order["paymentStatus"],
    cancellationReason?: string,
  ) => {
    setSaving(order.id);
    setError("");
    try {
      const result = await ordersApi.updateStatus(
        order.id,
        status,
        paymentStatus,
        cancellationReason,
      );
      setOrders((current) =>
        current.map((item) =>
          item.id === order.id ? { ...item, ...result.order } : item,
        ),
      );
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to update order",
      );
    } finally {
      setSaving(null);
    }
  };

  const displayStatuses = Array.from(new Set([...statuses, ...orders.map((order) => order.status)]));
  const orderGroups = (filter === "all" ? displayStatuses : [filter])
    .map((status) => ({
      status,
      orders: orders.filter((order) => order.status === status),
    }))
    .filter((group) => group.orders.length);

  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
      <div className="border-t border-border pt-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              Order management
            </h2>
            <p className="mt-1 text-muted-foreground">
              Review customer orders and keep fulfilment and payment status
              current.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={filter}
              onChange={(event) =>
                setFilter(event.target.value as typeof filter)
              }
              className="input w-auto"
            >
              <option value="all">All orders</option>
              {displayStatuses.map((status) => (
                <option key={status} value={status}>
                  {formatOrderStatus(status)}
                </option>
              ))}
            </select>
            <button
              type="button"
              aria-label="Refresh orders"
              title="Refresh orders"
              onClick={() => void load()}
              className="rounded-full border border-border p-2.5 text-muted-foreground"
            >
              <RefreshCw size={16} />
            </button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {displayStatuses.map((status) => {
            const count = orders.filter((order) => order.status === status).length;
            return (
              <button
                key={status}
                type="button"
                onClick={() => setFilter(status)}
                className={`border px-3 py-2 text-left text-xs font-semibold ${filter === status ? "border-primary bg-secondary text-primary" : "border-border text-muted-foreground"}`}
              >
                <span className="block text-lg font-bold text-foreground">{count}</span>
                {formatOrderStatus(status)}
              </button>
            );
          })}
        </div>
        {error && (
          <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {loading ? (
          <p className="mt-8 text-muted-foreground">Loading orders</p>
        ) : orderGroups.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-border p-8 text-center text-muted-foreground">
            No orders match this filter.
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {orderGroups.map((group) => (
              <section key={group.status}>
                <div className="mb-3 flex items-center justify-between border-b border-border pb-2">
                  <h3 className="font-bold text-foreground">{formatOrderStatus(group.status)} orders</h3>
                  <span className="text-xs font-semibold text-muted-foreground">{group.orders.length}</span>
                </div>
                <div className="space-y-4">
                {group.orders.map((order) => (
              <article
                key={order.id}
                className="rounded-2xl border border-border bg-card p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-bold text-foreground">
                      {order.orderNumber}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {order.user?.name || "Customer"} ·{" "}
                      {order.user?.email || order.deliveryAddress.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </p>
                  </div>
                  <p className="text-lg font-extrabold text-foreground">
                    ₱{order.total.toLocaleString()}
                  </p>
                </div>
                <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                  {order.items.map((item, index) => (
                    <p key={`${order.id}-${index}`}>
                      <span className="font-semibold text-foreground">
                        {item.name}
                      </span>{" "}
                      · Size {item.size}{item.colorName ? ` · ${item.colorName}` : ""} · Qty {item.quantity}{item.breed ? ` · Previewed as ${item.breed}` : ""}
                    </p>
                  ))}
                </div>
                {order.status === "cancelled" && order.cancellationReason && (
                  <p className="mt-4 border-l-2 border-border pl-3 text-sm text-muted-foreground">
                    Cancelled by {order.cancelledBy || "admin"}: {order.cancellationReason}
                  </p>
                )}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <label className="flex flex-col gap-1.5 text-xs font-bold text-muted-foreground">
                    Order status
                    <select
                      disabled={saving === order.id || !statuses.includes(order.status)}
                      value={order.status}
                      onChange={(event) => {
                        const nextStatus = event.target.value as Order["status"];
                        if (nextStatus === "cancelled" && order.status !== "cancelled") {
                          const reason = window.prompt("Enter the cancellation reason for the customer.");
                          if (!reason?.trim()) {
                            setError("A cancellation reason is required.");
                            return;
                          }
                          void update(order, nextStatus, order.paymentStatus, reason.trim());
                          return;
                        }
                        void update(order, nextStatus, order.paymentStatus);
                      }}
                      className="input"
                    >
                      {!statuses.includes(order.status) && <option value={order.status}>{formatOrderStatus(order.status)} (managed by logistics)</option>}
                      {statuses.map((status) => (
                        <option key={status} value={status}>
                          {formatOrderStatus(status)}
                        </option>
                      ))}
                    </select>
                    {!statuses.includes(order.status) && <span className="text-xs font-normal text-muted-foreground">This historical logistics status is read-only.</span>}
                  </label>
                  <label className="flex flex-col gap-1.5 text-xs font-bold text-muted-foreground">
                    Payment status
                    <select
                      disabled={saving === order.id}
                      value={order.paymentStatus}
                      onChange={(event) =>
                        void update(
                          order,
                          order.status,
                          event.target.value as Order["paymentStatus"],
                        )
                      }
                      className="input"
                    >
                      {paymentStatuses.map((status) => (
                        <option key={status} value={status}>
                          {formatOrderStatus(status)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
              </article>
                ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
