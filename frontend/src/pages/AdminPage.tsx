import { useState } from "react";
import pawfitLogo from "../assets/logo";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Box,
  Ruler,
  Users,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  Upload,
  ChevronDown,
  TrendingUp,
  AlertCircle,
  LogOut,
} from "lucide-react";
import { PRODUCTS, BREEDS } from "../data/products";
import type { Product, Breed } from "../data/products";
import { useRouter } from "../context/RouterContext";

// ─── Mock Data ──────────────────────────────────────────────────────────────

type OrderStatus = "Pending" | "Confirmed" | "Shipped" | "Delivered" | "Cancelled";

type Order = {
  id: string;
  customer: string;
  phone: string;
  items: { name: string; breed: string; size: string; qty: number; price: number }[];
  total: number;
  payment: string;
  address: string;
  status: OrderStatus;
  date: string;
};

const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-2024-001",
    customer: "Maria Santos",
    phone: "09171234567",
    items: [{ name: "Classic Polo Tee", breed: "Labrador", size: "L", qty: 1, price: 349 }],
    total: 449,
    payment: "GCash",
    address: "123 Sampaguita St., Barangay Sta. Cruz, Quezon City, Metro Manila",
    status: "Delivered",
    date: "2024-06-10",
  },
  {
    id: "ORD-2024-002",
    customer: "Jose Reyes",
    phone: "09189876543",
    items: [
      { name: "Fluffy Cloud Hoodie", breed: "Pomeranian", size: "XS", qty: 1, price: 598 },
      { name: "Pawprint Graphic Shirt", breed: "Aspin", size: "M", qty: 2, price: 299 },
    ],
    total: 1296,
    payment: "Maya",
    address: "45 Rizal Ave., Barangay Poblacion, Makati City, Metro Manila",
    status: "Shipped",
    date: "2024-06-14",
  },
  {
    id: "ORD-2024-003",
    customer: "Ana Dela Cruz",
    phone: "09221234567",
    items: [{ name: "Barong Tagalog Costume", breed: "Aspin", size: "S", qty: 1, price: 850 }],
    total: 950,
    payment: "Cash on Delivery",
    address: "78 Mabini St., Barangay San Isidro, Cebu City, Cebu",
    status: "Confirmed",
    date: "2024-06-17",
  },
  {
    id: "ORD-2024-004",
    customer: "Ramon Lim",
    phone: "09334567890",
    items: [{ name: "Sausage Stretch Raincoat", breed: "Dachshund", size: "M", qty: 1, price: 720 }],
    total: 820,
    payment: "GCash",
    address: "10 Acacia Lane, Barangay Magsaysay, Davao City, Davao del Sur",
    status: "Pending",
    date: "2024-06-19",
  },
  {
    id: "ORD-2024-005",
    customer: "Lourdes Bautista",
    phone: "09451234567",
    items: [{ name: "Floral Summer Dress", breed: "Pomeranian", size: "S", qty: 1, price: 480 }],
    total: 580,
    payment: "Maya",
    address: "22 Pines St., Barangay Engineers Hill, Baguio City, Benguet",
    status: "Pending",
    date: "2024-06-20",
  },
];

type MockUser = {
  id: string;
  name: string;
  email: string;
  phone: string;
  joined: string;
  orders: number;
};

const MOCK_USERS: MockUser[] = [
  { id: "u001", name: "Maria Santos", email: "maria.santos@email.com", phone: "09171234567", joined: "2024-05-01", orders: 3 },
  { id: "u002", name: "Jose Reyes", email: "jose.reyes@email.com", phone: "09189876543", joined: "2024-05-18", orders: 2 },
  { id: "u003", name: "Ana Dela Cruz", email: "ana.delacruz@email.com", phone: "09221234567", joined: "2024-06-02", orders: 1 },
  { id: "u004", name: "Ramon Lim", email: "ramon.lim@email.com", phone: "09334567890", joined: "2024-06-15", orders: 1 },
  { id: "u005", name: "Lourdes Bautista", email: "lourdes.bautista@email.com", phone: "09451234567", joined: "2024-06-19", orders: 1 },
];

type Asset3D = {
  id: string;
  breed: Breed;
  filename: string;
  size: string;
  uploaded: string;
  status: "Active" | "Draft";
};

const MOCK_ASSETS: Asset3D[] = [
  { id: "a001", breed: "Labrador", filename: "labrador_base.glb", size: "4.2 MB", uploaded: "2024-05-10", status: "Active" },
  { id: "a002", breed: "Pomeranian", filename: "pomeranian_base.glb", size: "3.1 MB", uploaded: "2024-05-10", status: "Active" },
  { id: "a003", breed: "Dachshund", filename: "dachshund_base.glb", size: "3.6 MB", uploaded: "2024-05-12", status: "Active" },
  { id: "a004", breed: "Aspin", filename: "aspin_base.glb", size: "3.9 MB", uploaded: "2024-05-14", status: "Active" },
];

// ─── Tab Types ───────────────────────────────────────────────────────────────

type Tab = "dashboard" | "products" | "orders" | "assets3d" | "sizecharts" | "users";

// ─── Status Badge ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    Pending: "bg-yellow-100 text-yellow-800",
    Confirmed: "bg-blue-100 text-blue-800",
    Shipped: "bg-purple-100 text-purple-800",
    Delivered: "bg-green-100 text-green-800",
    Cancelled: "bg-red-100 text-red-800",
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${styles[status]}`}>
      {status}
    </span>
  );
}

// ─── Main Admin Page ─────────────────────────────────────────────────────────

export default function AdminPage() {
  const { navigate } = useRouter();
  const [tab, setTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS_EDITABLE());
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [assets, setAssets] = useState<Asset3D[]>(MOCK_ASSETS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [productModal, setProductModal] = useState<"add" | "edit" | null>(null);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={16} /> },
    { key: "products", label: "Products", icon: <Package size={16} /> },
    { key: "orders", label: "Orders", icon: <ShoppingCart size={16} /> },
    { key: "assets3d", label: "3D Assets", icon: <Box size={16} /> },
    { key: "sizecharts", label: "Size Charts", icon: <Ruler size={16} /> },
    { key: "users", label: "Users", icon: <Users size={16} /> },
  ];

  const totalRevenue = orders
    .filter((o) => o.status !== "Cancelled")
    .reduce((s, o) => s + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === "Pending").length;

  return (
    <div className="min-h-screen bg-muted flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-card border-r border-border flex flex-col">
        <div className="px-5 py-5 border-b border-border">
          <img src={pawfitLogo} alt="PawFit" className="h-8 w-auto" />
          <p className="text-xs text-muted-foreground mt-1 font-semibold">Admin Panel</p>
        </div>

        <nav className="flex-1 py-4 flex flex-col gap-1 px-3">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-left transition-colors ${
                tab === t.key
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              }`}
            >
              {t.icon}
              {t.label}
              {t.key === "orders" && pendingOrders > 0 && (
                <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-white text-xs font-bold flex items-center justify-center">
                  {pendingOrders}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 pb-4">
          <button
            onClick={() => navigate("home")}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted w-full transition-colors"
          >
            <LogOut size={15} />
            Exit Admin
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8">

          {/* ── Dashboard ── */}
          {tab === "dashboard" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-extrabold text-foreground">Dashboard</h1>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Revenue", value: `₱${totalRevenue.toLocaleString()}`, sub: "All non-cancelled orders", color: "text-primary" },
                  { label: "Total Orders", value: orders.length, sub: `${pendingOrders} pending`, color: "text-foreground" },
                  { label: "Products", value: products.length, sub: "Active listings", color: "text-foreground" },
                  { label: "Registered Users", value: MOCK_USERS.length, sub: "All time", color: "text-foreground" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-card rounded-2xl border border-border p-5">
                    <p className="text-xs font-bold text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-extrabold mt-1 ${stat.color}`}>{stat.value}</p>
                    <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <div className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <AlertCircle size={16} className="text-yellow-500" />
                    Pending Orders
                  </h3>
                  {orders.filter((o) => o.status === "Pending").length === 0 ? (
                    <p className="text-sm text-muted-foreground">No pending orders.</p>
                  ) : (
                    <div className="flex flex-col gap-3">
                      {orders.filter((o) => o.status === "Pending").map((o) => (
                        <div key={o.id} className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-foreground">{o.id}</p>
                            <p className="text-xs text-muted-foreground">{o.customer} · {o.payment}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-foreground">₱{o.total.toLocaleString()}</p>
                            <button
                              onClick={() => { setTab("orders"); setSelectedOrder(o); }}
                              className="text-xs text-primary hover:underline"
                            >
                              Manage
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-card rounded-2xl border border-border p-5">
                  <h3 className="font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp size={16} className="text-primary" />
                    Low Stock
                  </h3>
                  <div className="flex flex-col gap-3">
                    {products.filter((p) => p.stock <= 10).map((p) => (
                      <div key={p.id} className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-foreground">{p.name}</p>
                        <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                          {p.stock} left
                        </span>
                      </div>
                    ))}
                    {products.filter((p) => p.stock <= 10).length === 0 && (
                      <p className="text-sm text-muted-foreground">All products well stocked.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-card rounded-2xl border border-border p-5">
                <h3 className="font-bold text-foreground mb-4">Recent Orders</h3>
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      {["Order ID", "Customer", "Total", "Payment", "Status", "Date"].map((h) => (
                        <th key={h} className="text-left pb-2 text-xs font-bold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map((o) => (
                      <tr key={o.id} className="border-b border-border/50 hover:bg-muted/30 transition-colors">
                        <td className="py-2.5 font-semibold text-foreground">{o.id}</td>
                        <td className="py-2.5 text-muted-foreground">{o.customer}</td>
                        <td className="py-2.5 font-semibold">₱{o.total.toLocaleString()}</td>
                        <td className="py-2.5 text-muted-foreground">{o.payment}</td>
                        <td className="py-2.5"><StatusBadge status={o.status} /></td>
                        <td className="py-2.5 text-muted-foreground">{o.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ── Products ── */}
          {tab === "products" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold text-foreground">Products</h1>
                <button
                  onClick={() => { setEditingProduct(null); setProductModal("add"); }}
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  <Plus size={15} />
                  Add Product
                </button>
              </div>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Product", "Category", "Price", "Stock", "Breeds", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl overflow-hidden bg-muted shrink-0">
                              <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                            </div>
                            <span className="font-semibold text-foreground">{p.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{p.category}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">₱{p.price.toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className={`font-semibold ${p.stock <= 10 ? "text-red-600" : "text-foreground"}`}>
                            {p.stock}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.availableBreeds.map((b) => (
                              <span key={b} className="px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground text-xs font-medium">
                                {b}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => { setEditingProduct(p); setProductModal("edit"); }}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => setProducts((prev) => prev.filter((x) => x.id !== p.id))}
                              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors text-muted-foreground hover:text-destructive"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Product Modal */}
              {productModal && (
                <ProductModal
                  mode={productModal}
                  initial={editingProduct}
                  onClose={() => setProductModal(null)}
                  onSave={(p) => {
                    if (productModal === "add") {
                      setProducts((prev) => [...prev, { ...p, id: `p${Date.now()}` }]);
                    } else {
                      setProducts((prev) => prev.map((x) => (x.id === p.id ? p : x)));
                    }
                    setProductModal(null);
                  }}
                />
              )}
            </div>
          )}

          {/* ── Orders ── */}
          {tab === "orders" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-extrabold text-foreground">Orders</h1>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Order ID", "Customer", "Total", "Payment", "Status", "Date", ""].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr
                        key={o.id}
                        className="border-b border-border/50 hover:bg-muted/20 transition-colors cursor-pointer"
                        onClick={() => setSelectedOrder(o)}
                      >
                        <td className="px-4 py-3 font-semibold text-foreground">{o.id}</td>
                        <td className="px-4 py-3 text-muted-foreground">{o.customer}</td>
                        <td className="px-4 py-3 font-semibold">₱{o.total.toLocaleString()}</td>
                        <td className="px-4 py-3 text-muted-foreground">{o.payment}</td>
                        <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
                        <td className="px-4 py-3 text-muted-foreground">{o.date}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-primary hover:underline">Details</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Order Detail Panel */}
              {selectedOrder && (
                <OrderDetailPanel
                  order={selectedOrder}
                  onClose={() => setSelectedOrder(null)}
                  onUpdateStatus={(id, status) => {
                    setOrders((prev) =>
                      prev.map((o) => (o.id === id ? { ...o, status } : o))
                    );
                    setSelectedOrder((prev) =>
                      prev ? { ...prev, status } : null
                    );
                  }}
                />
              )}
            </div>
          )}

          {/* ── 3D Assets ── */}
          {tab === "assets3d" && (
            <div className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-extrabold text-foreground">3D Asset Management</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage breed-specific .glb 3D models used for apparel visualization.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BREEDS.map((breed) => {
                  const asset = assets.find((a) => a.breed === breed);
                  return (
                    <div key={breed} className="bg-card rounded-2xl border border-border p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                            <Box size={20} className="text-accent-foreground" />
                          </div>
                          <div>
                            <p className="font-bold text-foreground">{breed}</p>
                            <p className="text-xs text-muted-foreground">Base model</p>
                          </div>
                        </div>
                        {asset ? (
                          <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-bold">
                            {asset.status}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-bold">
                            Missing
                          </span>
                        )}
                      </div>

                      {asset ? (
                        <div className="flex flex-col gap-2">
                          <div className="text-xs text-muted-foreground flex justify-between">
                            <span>{asset.filename}</span>
                            <span>{asset.size}</span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            Uploaded: {asset.uploaded}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <label className="flex-1">
                              <div className="flex items-center justify-center gap-1.5 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors cursor-pointer">
                                <Upload size={13} />
                                Replace
                              </div>
                              <input type="file" accept=".glb,.gltf" className="hidden" onChange={() => {}} />
                            </label>
                            <button
                              onClick={() =>
                                setAssets((prev) =>
                                  prev.map((a) =>
                                    a.breed === breed
                                      ? { ...a, status: a.status === "Active" ? "Draft" : "Active" }
                                      : a
                                  )
                                )
                              }
                              className="flex-1 py-2 rounded-xl border border-border text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                            >
                              {asset.status === "Active" ? "Deactivate" : "Activate"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="block w-full cursor-pointer">
                          <div className="border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors">
                            <Upload size={24} className="mx-auto text-muted-foreground mb-2" />
                            <p className="text-xs font-semibold text-muted-foreground">
                              Upload .glb or .gltf file
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">Max 20MB</p>
                          </div>
                          <input
                            type="file"
                            accept=".glb,.gltf"
                            className="hidden"
                            onChange={() => {
                              setAssets((prev) => [
                                ...prev,
                                {
                                  id: `a${Date.now()}`,
                                  breed,
                                  filename: `${breed.toLowerCase()}_base.glb`,
                                  size: "—",
                                  uploaded: new Date().toISOString().slice(0, 10),
                                  status: "Draft",
                                },
                              ]);
                            }}
                          />
                        </label>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="bg-secondary/50 rounded-2xl p-5 text-sm text-secondary-foreground">
                <p className="font-bold mb-1">Integration Note</p>
                <p className="text-xs leading-relaxed">
                  Uploaded .glb files are served via the Express.js backend and loaded by the
                  Three.js renderer on the Product page. Activate a model to make it available
                  in the 3D viewer. Deactivated models show a placeholder instead.
                </p>
              </div>
            </div>
          )}

          {/* ── Size Charts ── */}
          {tab === "sizecharts" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-extrabold text-foreground">Size Charts</h1>
              <p className="text-sm text-muted-foreground -mt-4">
                Breed-specific measurement data used for size recommendations and apparel fitting.
              </p>

              {BREEDS.map((breed) => (
                <SizeChartSection key={breed} breed={breed} products={products} />
              ))}
            </div>
          )}

          {/* ── Users ── */}
          {tab === "users" && (
            <div className="flex flex-col gap-6">
              <h1 className="text-2xl font-extrabold text-foreground">Users</h1>

              <div className="bg-card rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/40">
                      {["Name", "Email", "Phone", "Orders", "Joined"].map((h) => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-bold text-muted-foreground">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {MOCK_USERS.map((u) => (
                      <tr key={u.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                        <td className="px-4 py-3 font-semibold text-foreground">{u.name}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.phone}</td>
                        <td className="px-4 py-3 font-semibold text-foreground">{u.orders}</td>
                        <td className="px-4 py-3 text-muted-foreground">{u.joined}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}

// ─── Product Modal ────────────────────────────────────────────────────────────

function ProductModal({
  mode,
  initial,
  onClose,
  onSave,
}: {
  mode: "add" | "edit";
  initial: Product | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const blank: Product = {
    id: "",
    name: "",
    category: "Shirt",
    price: 0,
    description: "",
    image: "",
    colors: ["#C8A06A"],
    availableBreeds: [],
    sizeCharts: [],
    stock: 0,
    featured: false,
  };

  const [form, setForm] = useState<Product>(initial ?? blank);

  const toggleBreed = (b: Breed) => {
    setForm((f) => ({
      ...f,
      availableBreeds: f.availableBreeds.includes(b)
        ? f.availableBreeds.filter((x) => x !== b)
        : [...f.availableBreeds, b],
    }));
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl border border-border w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border sticky top-0 bg-card">
          <h2 className="font-bold text-foreground">
            {mode === "add" ? "Add Product" : "Edit Product"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-4">
          <Field label="Product Name">
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Category">
              <select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Product["category"] }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none"
              >
                {["Shirt", "Hoodie", "Raincoat", "Costume", "Dress"].map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Price (₱)">
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </Field>

          <Field label="Image URL">
            <input
              value={form.image}
              onChange={(e) => setForm((f) => ({ ...f, image: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Stock Quantity">
              <input
                type="number"
                value={form.stock}
                onChange={(e) => setForm((f) => ({ ...f, stock: Number(e.target.value) }))}
                className="w-full px-3 py-2 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </Field>
            <Field label="Featured">
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                  className={`w-10 h-5 rounded-full transition-colors relative ${form.featured ? "bg-primary" : "bg-muted"}`}
                >
                  <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${form.featured ? "left-5" : "left-0.5"}`} />
                </button>
                <span className="text-sm text-muted-foreground">{form.featured ? "Yes" : "No"}</span>
              </div>
            </Field>
          </div>

          <Field label="Available Breeds">
            <div className="flex flex-wrap gap-2 mt-1">
              {BREEDS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => toggleBreed(b)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                    form.availableBreeds.includes(b)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {form.availableBreeds.includes(b) && <Check size={11} />}
                  {b}
                </button>
              ))}
            </div>
          </Field>
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-3 sticky bottom-0 bg-card">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={!form.name || form.price <= 0}
            className="flex-1 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            {mode === "add" ? "Add Product" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Order Detail Panel ───────────────────────────────────────────────────────

function OrderDetailPanel({
  order,
  onClose,
  onUpdateStatus,
}: {
  order: Order;
  onClose: () => void;
  onUpdateStatus: (id: string, status: OrderStatus) => void;
}) {
  const statuses: OrderStatus[] = ["Pending", "Confirmed", "Shipped", "Delivered", "Cancelled"];
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-4">
      <div className="bg-card rounded-3xl border border-border w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-foreground">{order.id}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-5">
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1">Customer</p>
            <p className="font-semibold text-foreground">{order.customer}</p>
            <p className="text-sm text-muted-foreground">{order.phone}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-muted-foreground mb-1">Delivery Address</p>
            <p className="text-sm text-foreground">{order.address}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2">Items</p>
            <div className="flex flex-col gap-2">
              {order.items.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-foreground">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.breed} · Size {item.size} · Qty {item.qty}</p>
                  </div>
                  <p className="font-bold text-foreground">₱{(item.price * item.qty).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-3 pt-3 border-t border-border">
              <span className="text-sm font-bold text-foreground">Total</span>
              <span className="text-sm font-bold text-primary">₱{order.total.toLocaleString()}</span>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2">Payment</p>
            <p className="text-sm font-semibold text-foreground">{order.payment}</p>
          </div>

          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2">Update Status</p>
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm font-semibold"
              >
                <StatusBadge status={order.status} />
                <ChevronDown size={14} className="text-muted-foreground" />
              </button>
              {dropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-lg z-10 overflow-hidden">
                  {statuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => { onUpdateStatus(order.id, s); setDropdownOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm font-semibold hover:bg-muted transition-colors flex items-center justify-between ${
                        order.status === s ? "text-primary" : "text-foreground"
                      }`}
                    >
                      <StatusBadge status={s} />
                      {order.status === s && <Check size={13} className="text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Size Chart Section ───────────────────────────────────────────────────────

function SizeChartSection({ breed, products }: { breed: Breed; products: Product[] }) {
  const [open, setOpen] = useState(true);
  const charts = products.flatMap((p) => p.sizeCharts.filter((sc) => sc.breed === breed));
  const unique = charts[0];

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
            <Ruler size={16} className="text-accent-foreground" />
          </div>
          <span className="font-bold text-foreground">{breed}</span>
        </div>
        <ChevronDown size={16} className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="px-5 pb-5">
          {unique ? (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {["Size", "Neck (cm)", "Chest (cm)", "Back Length (cm)"].map((h) => (
                    <th key={h} className="text-left py-2 text-xs font-bold text-muted-foreground">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {unique.sizes.map((s, i) => (
                  <tr key={s.label} className={i % 2 === 0 ? "" : "bg-muted/30"}>
                    <td className="py-2 font-bold text-foreground">{s.label}</td>
                    <td className="py-2 text-muted-foreground">{s.neckCm}</td>
                    <td className="py-2 text-muted-foreground">{s.chestCm}</td>
                    <td className="py-2 text-muted-foreground">{s.backCm}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-sm text-muted-foreground">No size chart data for {breed} yet.</p>
          )}
          <p className="text-xs text-muted-foreground mt-3">
            Size charts are defined per product in the Products section.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      {children}
    </div>
  );
}

function MOCK_PRODUCTS_EDITABLE(): Product[] {
  return JSON.parse(JSON.stringify(PRODUCTS));
}
