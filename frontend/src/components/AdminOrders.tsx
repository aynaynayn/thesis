import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { ordersApi, type Order } from "../lib/api";

type AdminOrder = Order & { user?: { name: string; email: string } };
const statuses: Order["status"][] = ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"];
const paymentStatuses: Order["paymentStatus"][] = ["pending", "paid", "failed", "refunded"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<"all" | Order["status"]>("all");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try { setOrders((await ordersApi.admin()).orders as AdminOrder[]); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to load orders"); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const update = async (order: AdminOrder, status: Order["status"], paymentStatus: Order["paymentStatus"]) => {
    setSaving(order.id); setError("");
    try { const result = await ordersApi.updateStatus(order.id, status, paymentStatus); setOrders((current) => current.map((item) => item.id === order.id ? { ...item, ...result.order } : item)); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to update order"); }
    finally { setSaving(null); }
  };
  const visibleOrders = filter === "all" ? orders : orders.filter((order) => order.status === filter);

  return <section className="mt-14 border-t border-border pt-10"><div className="flex flex-wrap items-end justify-between gap-4"><div><h2 className="text-2xl font-extrabold text-foreground">Order management</h2><p className="mt-1 text-muted-foreground">Review customer orders and keep fulfilment and payment status current.</p></div><div className="flex items-center gap-2"><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)} className="input w-auto"><option value="all">All orders</option>{statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select><button type="button" aria-label="Refresh orders" title="Refresh orders" onClick={() => void load()} className="rounded-full border border-border p-2.5 text-muted-foreground"><RefreshCw size={16} /></button></div></div>{error && <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p>}{loading ? <p className="mt-8 text-muted-foreground">Loading orders</p> : visibleOrders.length === 0 ? <div className="mt-8 rounded-2xl border border-border p-8 text-center text-muted-foreground">No orders match this filter.</div> : <div className="mt-8 space-y-4">{visibleOrders.map((order) => <article key={order.id} className="rounded-2xl border border-border bg-card p-5"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="font-bold text-foreground">{order.orderNumber}</p><p className="mt-1 text-sm text-muted-foreground">{order.user?.name || "Customer"} · {order.user?.email || order.deliveryAddress.email}</p><p className="text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p></div><p className="text-lg font-extrabold text-foreground">₱{order.total.toLocaleString()}</p></div><div className="mt-4 grid gap-2 text-sm text-muted-foreground">{order.items.map((item, index) => <p key={`${order.id}-${index}`}><span className="font-semibold text-foreground">{item.name}</span> · {item.breed} · {item.size} · Qty {item.quantity}</p>)}</div><div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3"><label className="flex flex-col gap-1.5 text-xs font-bold text-muted-foreground">Order status<select disabled={saving === order.id} value={order.status} onChange={(event) => void update(order, event.target.value as Order["status"], order.paymentStatus)} className="input">{statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label><label className="flex flex-col gap-1.5 text-xs font-bold text-muted-foreground">Payment status<select disabled={saving === order.id} value={order.paymentStatus} onChange={(event) => void update(order, order.status, event.target.value as Order["paymentStatus"])} className="input">{paymentStatuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase() + status.slice(1)}</option>)}</select></label></div></article>)}</div>}</section>;
}
