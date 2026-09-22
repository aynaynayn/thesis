import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "../context/RouterContext";
import { authApi, ordersApi, type Order, type PetProfile, type PetProfileInput } from "../lib/api";

const emptyProfile: PetProfileInput = {
  name: "",
  breed: "",
  neckGirthCm: 0,
  chestGirthCm: 0,
  backLengthCm: 0,
};

export default function AccountPage() {
  const { user, loading, logout, refresh } = useAuth();
  const { navigate } = useRouter();
  const [draft, setDraft] = useState<PetProfileInput>(emptyProfile);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  if (loading)
    return (
      <main className="min-h-[60vh] flex items-center justify-center text-muted-foreground">
        Loading account
      </main>
    );
  if (!user)
    return (
      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div>
          <h1 className="text-4xl text-foreground">
            Sign in to view your account
          </h1>
          <button
            onClick={() => navigate("auth")}
            className="mt-5 border-b border-primary pb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary"
          >
            Sign in
          </button>
        </div>
      </main>
    );

  const update = (field: keyof PetProfileInput, value: string) =>
    setDraft((current) => ({
      ...current,
      [field]: field === "name" || field === "breed" ? value : Number(value),
    }));
  const beginEdit = (profile: PetProfile) => {
    setDraft({
      name: profile.name,
      breed: profile.breed,
      neckGirthCm: profile.neckGirthCm,
      chestGirthCm: profile.chestGirthCm,
      backLengthCm: profile.backLengthCm,
    });
    setEditingId(profile.id);
    setMessage("");
    setError("");
  };
  const reset = () => {
    setDraft(emptyProfile);
    setEditingId(null);
    setError("");
  };
  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");
    try {
      if (editingId) await authApi.updatePetProfile(editingId, draft);
      else await authApi.createPetProfile(draft);
      await refresh();
      reset();
      setMessage(editingId ? "Pet profile updated." : "Pet profile added.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save pet profile",
      );
    } finally {
      setSaving(false);
    }
  };
  const remove = async (id: string) => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      await authApi.deletePetProfile(id);
      await refresh();
      if (editingId === id) reset();
      setMessage("Pet profile deleted.");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete pet profile",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 py-12">
      <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
        Account / pet records
      </p>
      <h1 className="mt-2 text-5xl text-foreground">My account</h1>
      <section className="mt-8 rounded-2xl border border-border bg-card p-6">
        <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          Account details
        </p>
        <p className="mt-3 font-bold text-foreground">{user.name}</p>
        <p className="text-muted-foreground">{user.email}</p>
        {user.phone && <p className="text-muted-foreground">{user.phone}</p>}
        <button
          onClick={() => void logout().then(() => navigate("home"))}
          className="mt-5 border-b border-muted-foreground pb-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
        >
          Sign out
        </button>
      </section>
      <MyOrders />
      <section className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Saved pets
          </p>
          <h2 className="mt-2 text-3xl text-foreground">Pet profiles</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Keep a separate breed and measurement record for each dog.
          </p>
          <div className="mt-6 space-y-3">
            {user.petProfiles.length ? (
              user.petProfiles.map((profile) => (
                <article
                  key={profile.id}
                  className="rounded-xl border border-border bg-background p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-bold text-foreground">
                        {profile.name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {profile.breed}
                      </p>
                    </div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.1em] text-primary">
                      {profile.neckGirthCm} / {profile.chestGirthCm} / {profile.backLengthCm} cm
                    </p>
                  </div>
                  <div className="mt-3 flex gap-4">
                    <button
                      type="button"
                      onClick={() => beginEdit(profile)}
                      className="border-b border-primary pb-0.5 text-xs font-bold uppercase tracking-[0.1em] text-primary"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      disabled={saving}
                      onClick={() => void remove(profile.id)}
                      className="border-b border-transparent pb-0.5 text-xs font-bold uppercase tracking-[0.1em] text-muted-foreground hover:border-destructive hover:text-destructive"
                    >
                      Delete
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="border-t border-border pt-4 text-sm text-muted-foreground">
                No pet profiles yet. Add a pet to keep its measurements on file.
              </p>
            )}
          </div>
        </div>
        <form
          onSubmit={save}
          className="rounded-2xl border border-border bg-card p-6"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            {editingId ? "Edit profile" : "New profile"}
          </p>
          <h2 className="mt-2 text-3xl text-foreground">
            {editingId ? "Update a pet" : "Add a pet"}
          </h2>
          {error && (
            <p className="mt-4 border-l-2 border-destructive bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {message && (
            <p className="mt-4 border-l-2 border-primary bg-secondary p-3 text-sm text-primary">
              {message}
            </p>
          )}
          <label className="mt-5 flex flex-col gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Pet name
            <input
              required
              value={draft.name}
              onChange={(event) => update("name", event.target.value)}
              className="input normal-case tracking-normal"
            />
          </label>
          <label className="mt-4 flex flex-col gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
            Breed
            <input
              required
              value={draft.breed}
              onChange={(event) => update("breed", event.target.value)}
              placeholder="e.g. Labrador"
              className="input normal-case tracking-normal"
            />
          </label>
          <div className="mt-4 grid grid-cols-3 gap-3">
            <PetField
              label="Neck"
              value={draft.neckGirthCm}
              onChange={(value) => update("neckGirthCm", value)}
            />
            <PetField
              label="Chest"
              value={draft.chestGirthCm}
              onChange={(value) => update("chestGirthCm", value)}
            />
            <PetField
              label="Back"
              value={draft.backLengthCm}
              onChange={(value) => update("backLengthCm", value)}
            />
          </div>
          <div className="mt-6 flex gap-4">
            <button
              disabled={saving}
              className="border border-primary bg-primary px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground disabled:opacity-50"
            >
              {saving ? "Saving" : editingId ? "Save changes" : "Add pet"}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={reset}
                className="border-b border-muted-foreground pb-1 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>
    </main>
  );
}

function MyOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    void ordersApi
      .mine()
      .then((result) => setOrders(result.orders))
      .catch((requestError: Error) => setError(requestError.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="mt-6 rounded-2xl border border-border bg-card p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted-foreground">Purchases</p>
          <h2 className="mt-2 text-3xl tracking-normal text-foreground">My orders</h2>
        </div>
        <p className="text-sm text-muted-foreground">{orders.length} total</p>
      </div>
      {error ? <p className="mt-5 text-sm text-destructive">{error}</p> : loading ? <p className="mt-5 text-sm text-muted-foreground">Loading orders</p> : orders.length ? (
        <div className="mt-5">
          {orders.map((order) => (
            <article key={order.id} className="border-t border-border py-4 first:pt-4 last:border-b">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-bold text-foreground">{order.orderNumber}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{new Date(order.createdAt).toLocaleString()}</p>
                </div>
                <p className="font-bold text-foreground">₱{order.total.toLocaleString()}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
                <span className="rounded-full bg-secondary px-3 py-1 text-primary">Order: {formatStatus(order.status)}</span>
                <span className="rounded-full border border-border px-3 py-1 text-muted-foreground">Payment: {formatStatus(order.paymentStatus)}</span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {order.items.map((item) => `${item.name} · ${item.size} × ${item.quantity}`).join("; ")}
              </p>
            </article>
          ))}
        </div>
      ) : <p className="mt-5 text-sm text-muted-foreground">Your completed purchases will appear here.</p>}
    </section>
  );
}

function formatStatus(status: string) {
  return status[0].toUpperCase() + status.slice(1);
}

function PetField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (value: string) => void;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold uppercase tracking-[0.08em] text-muted-foreground">
      {label}
      <input
        required
        type="number"
        min="1"
        max="300"
        step="0.1"
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        placeholder="cm"
        className="input normal-case tracking-normal"
      />
    </label>
  );
}
