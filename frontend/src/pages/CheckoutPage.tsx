import { useEffect, useState } from "react";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";
import { ordersApi, type Order } from "../lib/api";

type PaymentMethod = "gcash" | "maya" | "cod";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { navigate } = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
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
    reference: "",
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
    form.province &&
    (paymentMethod === "cod" || form.reference),
  );
  const placeOrder = async () => {
    if (!user) {
      navigate("auth");
      return;
    }
    if (!valid) {
      setError(
        "Complete delivery information and payment reference are required.",
      );
      return;
    }
    setPlacing(true);
    setError("");
    try {
      const result = await ordersApi.create({
        deliveryAddress: form,
        paymentMethod,
        paymentReference: paymentMethod === "cod" ? undefined : form.reference,
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
      <main className="max-w-md mx-auto px-4 py-20 text-center">
        <CheckCircle size={44} className="mx-auto text-green-600" />
        <h1 className="mt-5 text-2xl font-extrabold text-foreground">
          Order placed
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your order number is{" "}
          <span className="font-bold text-foreground">{order.orderNumber}</span>
          .
        </p>
        <div className="mt-6 rounded-2xl border border-border bg-card p-5 text-left">
          <Row label="Items" value={String(order.items.length)} />
          <Row
            label="Payment"
            value={
              paymentMethod === "cod"
                ? "Cash on Delivery"
                : paymentMethod === "gcash"
                  ? "GCash"
                  : "Maya"
            }
          />
          <Row label="Total" value={`₱${order.total.toLocaleString()}`} />
        </div>
        <button
          onClick={() => navigate("account")}
          className="mt-7 w-full py-3 rounded-full bg-primary text-primary-foreground font-bold"
        >
          View My Orders
        </button>
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
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate("shop")}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground mb-8"
      >
        <ArrowLeft size={16} /> Back to Shop
      </button>
      <h1 className="text-3xl font-extrabold text-foreground">Checkout</h1>
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2 rounded-3xl border border-border bg-card p-6">
          <h2 className="font-bold text-lg text-foreground">
            Delivery information
          </h2>
          <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
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
          <div className="mt-4">
            <Field
              label="Email address"
              type="email"
              value={form.email}
              onChange={(value) => update("email", value)}
            />
          </div>
          <div className="mt-4">
            <Field
              label="Phone number"
              value={form.phone}
              onChange={(value) => update("phone", value)}
            />
          </div>
          <div className="mt-4">
            <Field
              label="House or unit number and street"
              value={form.line1}
              onChange={(value) => update("line1", value)}
            />
          </div>
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
          <h2 className="mt-8 font-bold text-lg text-foreground">
            Payment method
          </h2>
          <div className="mt-4 flex flex-wrap gap-2">
            {(["cod", "gcash", "maya"] as PaymentMethod[]).map((method) => (
              <button
                key={method}
                onClick={() => setPaymentMethod(method)}
                className={`px-4 py-2 rounded-full text-sm font-semibold ${paymentMethod === method ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
              >
                {method === "cod"
                  ? "Cash on Delivery"
                  : method === "gcash"
                    ? "GCash"
                    : "Maya"}
              </button>
            ))}
          </div>
          {paymentMethod !== "cod" && (
            <div className="mt-4">
              <Field
                label={`${paymentMethod === "gcash" ? "GCash" : "Maya"} payment reference`}
                value={form.reference}
                onChange={(value) => update("reference", value)}
              />
            </div>
          )}
          {error && <p className="mt-5 text-sm text-destructive">{error}</p>}
          <button
            disabled={placing}
            onClick={() => void placeOrder()}
            className="mt-6 w-full py-3 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50"
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
    <aside className="h-fit rounded-3xl border border-border bg-card p-5">
      <h2 className="font-bold text-foreground">Order summary</h2>
      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex gap-3">
            <img
              src={item.product.image}
              alt={item.product.name}
              className="h-12 w-12 rounded-xl object-cover"
            />
            <div className="flex-1 text-sm">
              <p className="font-semibold text-foreground">
                {item.product.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {item.breed} · {item.size} · Qty {item.quantity}
              </p>
            </div>
            <p className="text-sm font-bold">
              ₱{(item.product.price * item.quantity).toLocaleString()}
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
