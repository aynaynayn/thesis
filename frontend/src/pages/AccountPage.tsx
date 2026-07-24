import { useAuth } from "../context/AuthContext";
import { useRouter } from "../context/RouterContext";

export default function AccountPage() {
  const { user, loading, logout } = useAuth();
  const { navigate } = useRouter();
  if (loading) return <main className="min-h-[60vh] flex items-center justify-center text-muted-foreground">Loading account</main>;
  if (!user) return <main className="min-h-[60vh] flex items-center justify-center px-4"><div className="text-center"><h1 className="text-2xl font-extrabold text-foreground">Sign in to view your account</h1><button onClick={() => navigate("auth")} className="mt-5 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold">Sign In</button></div></main>;
  return <main className="max-w-2xl mx-auto px-4 sm:px-6 py-12"><h1 className="text-3xl font-extrabold text-foreground">My Account</h1><div className="mt-6 rounded-3xl border border-border bg-card p-6"><p className="text-xs font-bold uppercase tracking-wide text-muted-foreground">Account details</p><p className="mt-4 font-bold text-foreground">{user.name}</p><p className="text-muted-foreground">{user.email}</p>{user.phone && <p className="text-muted-foreground">{user.phone}</p>}<button onClick={() => void logout().then(() => navigate("home"))} className="mt-6 px-5 py-2.5 rounded-full border border-border text-sm font-semibold text-foreground">Sign Out</button></div></main>;
}
