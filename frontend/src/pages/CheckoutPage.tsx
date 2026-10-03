import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle, MapPin, Phone, ShoppingBag, Truck } from "lucide-react";
import { useCart } from "../context/CartContext";
import { priceForSize } from "../data/products";
import { useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";
import { ordersApi, type Order } from "../lib/api";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [error, setError] = useState("");
  const [placing, setPlacing] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    line1: "",
    barangay: "",
    city: "",
    province: "",
    postalCode: "",
  });
  useEffect(() => {
    if (user)
      setForm((current) => ({
        ...current,
        email: current.email || user.email,
        phone: current.phone || user.phone || "",
      }));
  }, [user]);
  const update = (field: keyof typeof form, value: string) =>
    setForm((current) => ({ ...current, [field]: value }));
  const shippingFee = 100;
  const valid = Boolean(
    form.firstName &&
    form.lastName &&
    form.email &&
    form.phone &&
    form.line1 &&
    form.city &&
    form.province,
  );
  const placeOrder = async () => {
    if (!user) {
      navigate("auth");
      return;
    }
    if (!valid) {
      setError(
        "Complete the delivery information to place your order.",
      );
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const result = await ordersApi.create({
        deliveryAddress: form,
        paymentMethod: "cod",
      });
      setOrder(result.order);
      await clearCart();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to place order",
      );
    } finally {
      setPlacing(false);
    }
  };
  if (!user)
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-extrabold text-foreground">
          Sign in to checkout
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your cart and orders are stored securely on your account.
        </p>
        <button
          onClick={() => navigate("auth")}
          className="mt-6 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold"
        >
          Sign In
        </button>
      </main>
    );
  if (order)
    return (
      <main className="mx-auto max-w-2xl px-4 py-12 sm:py-20">
        <section className="border border-border bg-card p-6 text-center sm:p-10">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-success/10 text-success"><CheckCircle size={30} /></span>
          <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-accent">Order confirmed</p>
          <h1 className="mt-3 text-3xl font-extrabold text-foreground">Thanks, your order is in.</h1>
          <p className="mx-auto mt-3 max-w-md leading-7 text-muted-foreground">Keep this order number handy when reviewing your purchase.</p>
          <p className="mx-auto mt-5 w-fit border border-border bg-preview-bg px-4 py-3 font-mono text-sm font-bold tracking-[0.08em] text-foreground">{order.orderNumber}</p>
          <div className="mt-8 grid gap-px border border-border bg-border text-left sm:grid-cols-2"><div className="bg-surface p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Order summary</p><div className="mt-4 space-y-2"><Row label="Items" value={String(order.items.reduce((total, item) => total + item.quantity, 0))} /><Row label="Payment" value="Cash on Delivery" /><Row label="Total" value={`₱${order.total.toLocaleString()}`} bold /></div></div><div className="bg-surface p-5"><p className="text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground">Delivery address</p><div className="mt-4 text-sm leading-6 text-foreground"><p className="font-bold">{order.deliveryAddress.firstName} {order.deliveryAddress.lastName}</p><p className="text-muted-foreground">{order.deliveryAddress.line1}{order.deliveryAddress.barangay ? `, ${order.deliveryAddress.barangay}` : ""}<br />{order.deliveryAddress.city}, {order.deliveryAddress.province}{order.deliveryAddress.postalCode ? ` ${order.deliveryAddress.postalCode}` : ""}</p></div></div></div>
          <p className="mt-6 text-sm text-muted-foreground">Checkout is a demonstration simulation. No real payment has been processed.</p>
          <div className="mt-7 grid gap-3 sm:grid-cols-2"><button onClick={() => navigate("account")} className="rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground">View My Orders</button><button onClick={() => navigate("shop")} className="rounded-lg border border-border py-3 text-sm font-bold text-foreground">Continue Shopping</button></div>
        </section>
      </main>
    );
  if (!items.length)
    return (
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <button
          onClick={() => navigate("shop")}
          className="mt-5 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold"
        >
          Shop Now
        </button>
      </main>
    );
  return (
    <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
      <button
        onClick={() => navigate("shop")}
        className="mb-8 flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft size={16} /> Back to Shop
      </button>
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-7"><div><p className="text-xs font-bold uppercase tracking-[0.14em] text-accent">Secure checkout</p><h1 className="mt-2 text-3xl font-extrabold text-foreground">Almost there.</h1></div><p className="text-sm text-muted-foreground">{items.reduce((count, item) => count + item.quantity, 0)} item{items.reduce((count, item) => count + item.quantity, 0) === 1 ? "" : "s"} in your order</p></div>
      <div className="mt-6 grid grid-cols-3 border border-border bg-surface text-center text-xs font-bold uppercase tracking-[0.08em]"><div className="flex items-center justify-center gap-2 border-r border-border py-3 text-muted-foreground"><ShoppingBag size={15} /> Bag</div><div className="flex items-center justify-center gap-2 border-r border-border bg-primary py-3 text-primary-foreground"><MapPin size={15} /> Delivery</div><div className="flex items-center justify-center gap-2 py-3 text-muted-foreground"><Truck size={15} /> Payment</div></div>
      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <section className="border border-border bg-card p-5 sm:p-7">
          <div className="flex items-start gap-3"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/10 text-accent"><MapPin size={18} /></span><div><h2 className="font-bold text-lg text-foreground">Delivery details</h2><p className="mt-1 text-sm text-muted-foreground">Where should we prepare this order for?</p></div></div>
          <div className="mt-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="First name"
              value={form.firstName}
              onChange={(value) => update("firstName", value)}
            />
            <Field
              label="Last name"
              value={form.lastName}
              onChange={(value) => update("lastName", value)}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="Email address"
              type="email"
              value={form.email}
              onChange={(value) => update("email", value)}
            />
            <Field
              label="Phone number"
              value={form.phone}
              onChange={(value) => update("phone", value)}
            />
          </div>
          <div className="mt-7 border-t border-border pt-6"><div className="flex items-center gap-2"><Phone size={16} className="text-accent" /><h3 className="font-bold text-foreground">Address</h3></div><div className="mt-4">
            <Field
              label="House or unit number and street"
              value={form.line1}
              onChange={(value) => update("line1", value)}
            />
          </div></div>
          <div className="mt-4">
            <Field
              label="Barangay"
              value={form.barangay}
              onChange={(value) => update("barangay", value)}
            />
          </div>
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field
              label="City or municipality"
              value={form.city}
              onChange={(value) => update("city", value)}
            />
            <Field
              label="Province"
              value={form.province}
              onChange={(value) => update("province", value)}
            />
          </div>
          <div className="mt-4">
            <Field
              label="Postal code"
              value={form.postalCode}
              onChange={(value) => update("postalCode", value)}
            />
          </div>
          <div className="mt-8 border-t border-border pt-6"><h2 className="font-bold text-lg text-foreground">Payment method</h2><div className="mt-4 flex items-start gap-3 border border-border bg-preview-bg p-4"><span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-surface text-accent"><Truck size={18} /></span><div><p className="font-bold text-foreground">Cash on Delivery</p><p className="mt-1 text-sm leading-6 text-muted-foreground">Pay the courier when your order arrives.</p></div></div></div>
          {error && <p className="mt-5 border-l-2 border-danger bg-danger/10 px-4 py-3 text-sm text-danger">{error}</p>}
          <button
            disabled={placing}
            onClick={() => void placeOrder()}
            className="mt-7 w-full rounded-lg bg-primary py-3 text-sm font-bold text-primary-foreground disabled:opacity-50"
          >
            {placing ? "Placing order" : "Place Order"}
          </button>
        </section>
        <OrderSummary
          items={items}
          subtotal={total}
          shippingFee={shippingFee}
        />
      </div>
    </main>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold text-muted-foreground">
      {label}
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="input"
      />
    </label>
  );
}
function OrderSummary({
  items,
  subtotal,
  shippingFee,
}: {
  items: ReturnType<typeof useCart>["items"];
  subtotal: number;
  shippingFee: number;
}) {
  return (
    <aside className="h-fit border border-border bg-card p-5 lg:sticky lg:top-24">
      <div className="flex items-center justify-between"><h2 className="font-bold text-foreground">Order summary</h2><span className="text-xs font-semibold text-muted-foreground">{items.length} line item{items.length === 1 ? "" : "s"}</span></div>
      <div className="mt-5 divide-y divide-border">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3 py-3 first:pt-0">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="h-14 w-14 object-cover"
            />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-foreground">
                {item.product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                Size {item.size}{item.colorName ? ` · ${item.colorName}` : ""} · Qty {item.quantity}{item.petBreed ? ` · Previewed as ${item.petBreed}` : ""}
              </p>
            </div>
            <p className="shrink-0 text-sm font-bold text-foreground">
              ₱{(priceForSize(item.product, item.size) * item.quantity).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
      <div className="mt-5 border-t border-border pt-4 space-y-2">
        <Row label="Subtotal" value={`₱${subtotal.toLocaleString()}`} />
        <Row label="Shipping" value={`₱${shippingFee.toLocaleString()}`} />
        <Row
          label="Total"
          value={`₱${(subtotal + shippingFee).toLocaleString()}`}
          bold
        />
      </div>
      <p className="mt-5 border-t border-border pt-4 text-xs leading-5 text-muted-foreground">Checkout is a simulation for demonstration purposes. No real payments are processed.</p>
    </aside>
  );
}
function Row({
  label,
  value,
  bold = false,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <div
      className={`flex justify-between text-sm ${bold ? "font-bold text-foreground" : "text-muted-foreground"}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
