import { useState } from "react";
import { Eye, EyeOff, ArrowLeft, ShieldCheck } from "lucide-react";
import { useRouter } from "../context/RouterContext";
import pawfitLogo from "../assets/logo";

type Mode = "login" | "register";

const ADMIN_EMAIL = "admin@pawfit.com";
const ADMIN_PASSWORD = "pawfit2024";

export default function AuthPage() {
  const { navigate } = useRouter();
  const [mode, setMode] = useState<Mode>("login");
  const [adminMode, setAdminMode] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
  });

  const [adminForm, setAdminForm] = useState({ email: "", password: "" });

  const update = (field: string, value: string) => {
    setForm((f) => ({ ...f, [field]: value }));
    setError("");
  };

  const handleUserSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate("home");
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminForm.email === ADMIN_EMAIL &&
      adminForm.password === ADMIN_PASSWORD
    ) {
      navigate("admin");
    } else {
      setError("Invalid admin credentials.");
    }
  };

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <div className="bg-card rounded-3xl border border-border p-8">
          {!adminMode ? (
            <>
              <div className="text-center mb-8">
                <img
                  src={pawfitLogo}
                  alt="PawFit"
                  className="h-12 w-auto mx-auto mb-4"
                />
                <h1 className="text-2xl font-extrabold text-foreground">
                  {mode === "login" ? "Welcome back" : "Create account"}
                </h1>
                <p className="text-muted-foreground text-sm mt-1">
                  {mode === "login"
                    ? "Sign in to track your orders and manage your profile."
                    : "Join PawFit and start shopping for your pup."}
                </p>
              </div>

              <div className="flex bg-muted rounded-full p-1 mb-6">
                {(["login", "register"] as Mode[]).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-full text-sm font-bold transition-colors ${
                      mode === m
                        ? "bg-card text-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {m === "login" ? "Sign In" : "Register"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleUserSubmit} className="flex flex-col gap-4">
                {mode === "register" && (
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground">First Name</label>
                      <input
                        type="text"
                        required
                        value={form.firstName}
                        onChange={(e) => update("firstName", e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label className="text-xs font-bold text-muted-foreground">Last Name</label>
                      <input
                        type="text"
                        required
                        value={form.lastName}
                        onChange={(e) => update("lastName", e.target.value)}
                        className="px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      />
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Email Address</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => update("email", e.target.value)}
                    placeholder="you@example.com"
                    className="px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  />
                </div>

                {mode === "register" && (
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-bold text-muted-foreground">Phone Number</label>
                    <input
                      type="tel"
                      value={form.phone}
                      onChange={(e) => update("phone", e.target.value)}
                      placeholder="09XXXXXXXXX"
                      className="px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                    />
                  </div>
                )}

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={form.password}
                      onChange={(e) => update("password", e.target.value)}
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {mode === "login" && (
                  <div className="text-right">
                    <button type="button" className="text-xs text-primary hover:underline font-semibold">
                      Forgot password?
                    </button>
                  </div>
                )}

                <button
                  type="submit"
                  className="mt-2 w-full py-3 rounded-full bg-primary text-primary-foreground font-bold hover:opacity-90 transition-opacity"
                >
                  {mode === "login" ? "Sign In" : "Create Account"}
                </button>
              </form>

              <p className="text-center text-xs text-muted-foreground mt-6">
                {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                <button
                  onClick={() => setMode(mode === "login" ? "register" : "login")}
                  className="text-primary font-semibold hover:underline"
                >
                  {mode === "login" ? "Register" : "Sign In"}
                </button>
              </p>

              {/* Discreet admin entry */}
              <div className="mt-8 pt-5 border-t border-border text-center">
                <button
                  onClick={() => { setAdminMode(true); setError(""); }}
                  className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                >
                  Admin access
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-foreground flex items-center justify-center mx-auto mb-4">
                  <ShieldCheck size={22} className="text-background" />
                </div>
                <h1 className="text-xl font-extrabold text-foreground">Admin Sign In</h1>
                <p className="text-muted-foreground text-xs mt-1">
                  Restricted access. Authorized personnel only.
                </p>
              </div>

              <form onSubmit={handleAdminSubmit} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Admin Email</label>
                  <input
                    type="email"
                    required
                    value={adminForm.email}
                    onChange={(e) => { setAdminForm((f) => ({ ...f, email: e.target.value })); setError(""); }}
                    placeholder="admin@pawfit.com"
                    className="px-4 py-2.5 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground/50"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-muted-foreground">Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={adminForm.password}
                      onChange={(e) => { setAdminForm((f) => ({ ...f, password: e.target.value })); setError(""); }}
                      className="w-full px-4 py-2.5 pr-11 rounded-xl border border-border bg-input-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-destructive font-semibold">{error}</p>
                )}

                <button
                  type="submit"
                  className="mt-2 w-full py-3 rounded-full bg-foreground text-background font-bold hover:opacity-90 transition-opacity"
                >
                  Sign In as Admin
                </button>
              </form>

              <div className="mt-6 text-center">
                <button
                  onClick={() => { setAdminMode(false); setError(""); setAdminForm({ email: "", password: "" }); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Back to customer sign in
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
