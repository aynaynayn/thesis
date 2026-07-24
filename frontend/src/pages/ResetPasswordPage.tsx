import { useState } from "react";
import { authApi } from "../lib/api";
import { useRouter } from "../context/RouterContext";

export default function ResetPasswordPage() {
  const { navigate } = useRouter();
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const token = new URLSearchParams(window.location.search).get("token");
    if (!token) { setError("The password-reset link is missing its token."); return; }
    setSaving(true); setError("");
    try { setMessage((await authApi.resetPassword(token, password)).message); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "Unable to reset password"); }
    finally { setSaving(false); }
  };
  return <main className="min-h-[70vh] flex items-center justify-center px-4"><form onSubmit={submit} className="w-full max-w-md bg-card border border-border rounded-3xl p-8"><h1 className="text-2xl font-extrabold text-foreground">Set a new password</h1><p className="mt-2 text-sm text-muted-foreground">Use at least 8 characters with uppercase, lowercase, number, and special character.</p>{message && <p className="mt-4 text-sm text-green-700">{message}</p>}{error && <p className="mt-4 text-sm text-destructive">{error}</p>}<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="input mt-5" /><button disabled={saving} className="mt-4 w-full py-3 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50">{saving ? "Saving" : "Reset Password"}</button>{message && <button type="button" onClick={() => navigate("auth")} className="mt-4 w-full text-sm font-semibold text-primary">Go to sign in</button>}</form></main>;
}
