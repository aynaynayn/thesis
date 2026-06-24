import { useState } from "react";
import { ArrowLeft, CheckCircle, ChevronRight } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useRouter } from "../context/RouterContext";

type PaymentMethod = "gcash" | "maya" | "cod";
type Step = "information" | "payment" | "review" | "success";

export default function CheckoutPage() {
  const { items, total, clearCart } = useCart();
  const { navigate } = useRouter();
  const [step, setStep] = useState<Step>("information");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("gcash");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    barangay: "",
    city: "",
    province: "",
    zipCode: "",
    gcashNumber: "",
    mayaNumber: "",
    gcashRef: "",
    mayaRef: "",
  });

  const update = (field: string, value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  const shippingFee = 100;
  const orderTotal = total + shippingFee;

  const handlePlaceOrder = () => {
    setStep("success");
    clearCart();
  };

  if (step === "success") {
    return (
      <main className="max-w-md mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-600" />
        </div>
        <h1 className="text-2xl font-extrabold text-foreground">Order Placed!</h1>
        <p className="text-muted-foreground mt-3 leading-relaxed">
          Thank you, {form.firstName}! Your order has been received. You will be
          contacted via {form.phone} once your order is confirmed.
        </p>
        <div className="mt-6 p-5 rounded-2xl bg-card border border-border text-left">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
            Order Summary
          </p>
          <p className="text-sm text-foreground font-semibold">
            {form.firstName} {form.lastName}
          </p>
          <p className="text-sm text-muted-foreground">{form.address}, {form.barangay}</p>
          <p className="text-sm text-muted-foreground">{form.city}, {form.province} {form.zipCode}</p>
          <div className="mt-3 pt-3 border-t border-border flex justify-between">
            <span className="text-sm text-muted-foreground">Total Paid</span>
            <span className="text-sm font-bold text-foreground">₱{orderTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-sm text-muted-foreground">Payment</span>
            <span className="text-sm font-semibold text-foreground capitalize">{paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "gcash" ? "GCash" : "Maya"}</span>
          </div>
        </div>
        <button
          onClick={() => navigate("home")}
          className="mt-8 w-full py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
        >
          Back to Home
        </button>
      </main>
    );
  }

  if (items.length === 0 && step !== "success") {
    return (
      <main className="max-w-md mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground">Your cart is empty.</p>
        <button
          onClick={() => navigate("shop")}
          className="mt-4 px-5 py-2.5 rounded-full bg-primary text-primary-foreground font-semibold text-sm"
        >
          Shop Now
        </button>
      </main>
    );
  }

  const steps: Step[] = ["information", "payment", "review"];
  const stepLabels: Record<Step, string> = {
    information: "Delivery Info",
    payment: "Payment",
    review: "Review Order",
    success: "Done",
  };

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <button
        onClick={() => navigate("shop")}
        className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-8"
      >
        <ArrowLeft size={16} />
        Back to Shop
      </button>

      <h1 className="text-3xl font-extrabold text-foreground mb-6">Checkout</h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-colors ${
                step === s
                  ? "bg-primary text-primary-foreground"
                  : steps.indexOf(step) > i
                  ? "bg-primary/20 text-primary"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <span>{i + 1}</span>
              <span className="hidden sm:inline">{stepLabels[s]}</span>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight size={14} className="text-muted-foreground" />
            )}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main form */}
        <div className="lg:col-span-2">
          {step === "information" && (
            <div className="bg-card rounded-3xl border border-border p-6 flex flex-col gap-5">
              <h2 className="font-bold text-foreground text-lg">Delivery Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <InputField label="First Name" value={form.firstName} onChange={(v) => update("firstName", v)} />
                <InputField label="Last Name" value={form.lastName} onChange={(v) => update("lastName", v)} />
              </div>
              <InputField label="Email Address" type="email" value={form.email} onChange={(v) => update("email", v)} />
              <InputField label="Phone Number (e.g. 09XXXXXXXXX)" value={form.phone} onChange={(v) => update("phone", v)} />
              <InputField label="House/Unit No. and Street" value={form.address} onChange={(v) => update("address", v)} />
              <InputField label="Barangay" value={form.barangay} onChange={(v) => update("barangay", v)} />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="City / Municipality" value={form.city} onChange={(v) => update("city", v)} />
                <InputField label="Province" value={form.province} onChange={(v) => update("province", v)} />
              </div>
              <InputField label="ZIP Code" value={form.zipCode} onChange={(v) => update("zipCode", v)} />
              <button
                onClick={() => setStep("payment")}
                disabled={!form.firstName || !form.lastName || !form.phone || !form.address || !form.city}
                className="mt-2 w-full py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue to Payment
              </button>
            </div>
          )}

          {step === "payment" && (
            <div className="bg-card rounded-3xl border border-border p-6 flex flex-col gap-5">
              <h2 className="font-bold text-foreground text-lg">Payment Method</h2>

              <div className="flex flex-col gap-3">
                {([
                  { value: "gcash", label: "GCash", description: "Pay using your GCash mobile wallet" },
                  { value: "maya", label: "Maya", description: "Pay using Maya (formerly PayMaya)" },
                  { value: "cod", label: "Cash on Delivery", description: "Pay when your order arrives" },
                ] as const).map((method) => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition-colors ${
                      paymentMethod === method.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-muted/30 hover:bg-muted"
                    }`}
                  >
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                        paymentMethod === method.value
                          ? "border-primary"
                          : "border-muted-foreground"
                      }`}
                    >
                      {paymentMethod === method.value && (
                        <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground text-sm">{method.label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{method.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              {paymentMethod === "gcash" && (
                <div className="bg-muted/40 rounded-2xl p-4 flex flex-col gap-4">
                  <p className="text-sm font-semibold text-foreground">
                    Transfer to: <span className="text-primary">0917-XXX-XXXX (PawFit Store)</span>
                  </p>
                  <InputField
                    label="Your GCash Number"
                    value={form.gcashNumber}
                    onChange={(v) => update("gcashNumber", v)}
                    placeholder="09XXXXXXXXX"
                  />
                  <InputField
                    label="GCash Reference Number"
                    value={form.gcashRef}
                    onChange={(v) => update("gcashRef", v)}
                    placeholder="Enter reference number after transfer"
                  />
                </div>
              )}

              {paymentMethod === "maya" && (
                <div className="bg-muted/40 rounded-2xl p-4 flex flex-col gap-4">
                  <p className="text-sm font-semibold text-foreground">
                    Transfer to: <span className="text-primary">0915-XXX-XXXX (PawFit Store)</span>
                  </p>
                  <InputField
                    label="Your Maya Number"
                    value={form.mayaNumber}
                    onChange={(v) => update("mayaNumber", v)}
                    placeholder="09XXXXXXXXX"
                  />
                  <InputField
                    label="Maya Reference Number"
                    value={form.mayaRef}
                    onChange={(v) => update("mayaRef", v)}
                    placeholder="Enter reference number after transfer"
                  />
                </div>
              )}

              {paymentMethod === "cod" && (
                <div className="bg-muted/40 rounded-2xl p-4">
                  <p className="text-sm text-muted-foreground">
                    Please prepare the exact amount of{" "}
                    <span className="font-bold text-foreground">₱{orderTotal.toLocaleString()}</span>{" "}
                    upon delivery. Our rider will collect payment at your doorstep.
                  </p>
                </div>
              )}

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep("information")}
                  className="flex-1 py-3 rounded-full border border-border text-foreground font-semibold hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep("review")}
                  className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                >
                  Review Order
                </button>
              </div>
            </div>
          )}

          {step === "review" && (
            <div className="bg-card rounded-3xl border border-border p-6 flex flex-col gap-5">
              <h2 className="font-bold text-foreground text-lg">Review Your Order</h2>

              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Delivery Address</p>
                <p className="text-sm font-semibold text-foreground">{form.firstName} {form.lastName}</p>
                <p className="text-sm text-muted-foreground">{form.address}, {form.barangay}</p>
                <p className="text-sm text-muted-foreground">{form.city}, {form.province} {form.zipCode}</p>
                <p className="text-sm text-muted-foreground">{form.phone}</p>
              </div>

              <div className="rounded-2xl bg-muted/40 p-4">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Payment Method</p>
                <p className="text-sm font-semibold text-foreground">
                  {paymentMethod === "cod" ? "Cash on Delivery" : paymentMethod === "gcash" ? "GCash" : "Maya"}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {items.map((item) => (
                  <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted shrink-0">
                      <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-foreground">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">{item.breed} · Size {item.size} · Qty {item.quantity}</p>
                    </div>
                    <p className="text-sm font-bold text-foreground">₱{(item.product.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => setStep("payment")}
                  className="flex-1 py-3 rounded-full border border-border text-foreground font-semibold hover:bg-muted transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={handlePlaceOrder}
                  className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                >
                  Place Order
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className="bg-card rounded-3xl border border-border p-5 h-fit">
          <h3 className="font-bold text-foreground mb-4">Order Summary</h3>
          <div className="flex flex-col gap-3 mb-4">
            {items.map((item) => (
              <div key={`${item.product.id}-${item.size}`} className="flex items-center gap-3">
                <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-muted shrink-0">
                  <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold">
                    {item.quantity}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">{item.product.name}</p>
                  <p className="text-xs text-muted-foreground">{item.breed} · {item.size}</p>
                </div>
                <p className="text-xs font-bold text-foreground">₱{(item.product.price * item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-border pt-4 flex flex-col gap-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold text-foreground">₱{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span className="font-semibold text-foreground">₱{shippingFee.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold mt-1 pt-2 border-t border-border">
              <span className="text-foreground">Total</span>
              <span className="text-primary">₱{orderTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-bold text-muted-foreground">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="px-4 py-2.5 rounded-xl border border-border bg-input-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
      />
    </div>
  );
}
