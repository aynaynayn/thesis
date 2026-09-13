import { useState } from "react";
import { ArrowLeft, Eye, EyeOff } from "lucide-react";
import { authApi } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "../context/RouterContext";

type Mode = "login" | "register" | "forgot";

export default function AuthPage() {
  const { navigate } = useRouter();
  const { login } = useAuth();

  const [mode, setMode] = useState<Mode>("login");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const update = (field: keyof typeof form, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError("");
    setMessage("");
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSubmitting(true);
    setError("");
    setMessage("");

    try {
      if (mode === "login") {
        const user = await login(form.email, form.password);

        // Automatically redirect admins to the admin dashboard
        navigate(user.role === "admin" ? "admin" : "home");
      } else if (mode === "register") {
        await authApi.register(form);
        setMessage("Account created successfully. You can now sign in.");
        setMode("login");
      } else {
        const result = await authApi.forgotPassword(form.email);
        setMessage(result.message);
      }
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to complete the request",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const title =
    mode === "login"
      ? "Sign In"
      : mode === "register"
        ? "Create your account"
        : "Reset your password";

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground mb-8"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        <div className="bg-card rounded-3xl border border-border p-8">
          <h1 className="text-2xl font-extrabold text-foreground text-center">
            {title}
          </h1>

          <p className="text-sm text-muted-foreground text-center mt-2">
            {mode === "register"
              ? "Create your PawFit account."
              : mode === "forgot"
                ? "We'll send a secure password reset link if the account exists."
                : "Sign in to your PawFit account."}
          </p>

          {message && (
            <p className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-800">
              {message}
            </p>
          )}

          {error && (
            <p className="mt-5 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}

          <form onSubmit={submit} className="mt-6 flex flex-col gap-4">
            {mode === "register" && (
              <Field label="Full name">
                <input
                  required
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  className="input"
                />
              </Field>
            )}

            <Field label="Email address">
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                className="input"
              />
            </Field>

            {mode === "register" && (
              <Field label="Phone number">
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  className="input"
                />
              </Field>
            )}

            {mode !== "forgot" && (
              <Field label="Password">
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={form.password}
                    onChange={(e) => update("password", e.target.value)}
                    className="input pr-11"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </Field>
            )}

            {mode === "register" && (
              <p className="text-xs text-muted-foreground">
                Use at least 8 characters with uppercase, lowercase, number, and
                special character.
              </p>
            )}

            <button
              disabled={submitting}
              className="mt-2 w-full py-3 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50"
            >
              {submitting
                ? "Please wait..."
                : mode === "login"
                  ? "Sign In"
                  : mode === "register"
                    ? "Create Account"
                    : "Send Reset Link"}
            </button>
          </form>

          {mode === "login" && (
            <div className="mt-5 text-center text-sm">
              <button
                onClick={() => setMode("forgot")}
                className="text-primary font-semibold hover:underline"
              >
                Forgot password?
              </button>

              <p className="mt-4 text-muted-foreground">
                New to PawFit?{" "}
                <button
                  onClick={() => setMode("register")}
                  className="text-primary font-semibold hover:underline"
                >
                  Create an account
                </button>
              </p>

              <p className="mt-6 text-xs text-muted-foreground">
                Admins can sign in using their administrator credentials.
              </p>
            </div>
          )}

          {mode !== "login" && (
            <p className="mt-6 text-center text-sm text-muted-foreground">
              <button
                onClick={() => setMode("login")}
                className="text-primary font-semibold hover:underline"
              >
                Back to sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold text-muted-foreground">
      {label}
      {children}
    </label>
  );
}
