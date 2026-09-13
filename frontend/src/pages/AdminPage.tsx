import { useEffect, useRef, useState } from "react";
import { LogOut, Package, Plus, Trash2, X } from "lucide-react";
import {
  BREEDS,
  type Breed,
  type InventoryItem,
  type Product,
} from "../data/products";
import { productsApi } from "../lib/api";
import AdminOrders from "../components/AdminOrders";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "../context/RouterContext";

type Draft = Pick<
  Product,
  | "name"
  | "category"
  | "price"
  | "description"
  | "image"
  | "images"
  | "featured"
  | "inventory"
  | "sizeCharts"
>;
type QueuedModel = { id: string; breed: string; file: File | null };

const emptyDraft = (): Draft => ({
  name: "",
  category: "",
  price: 0,
  description: "",
  image: "",
  images: [],
  featured: false,
  inventory: [],
  sizeCharts: [],
});
const createQueueRow = (): QueuedModel => ({
  id: crypto.randomUUID(),
  breed: "",
  file: null,
});

export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const { navigate } = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [editing, setEditing] = useState<Product | null | undefined>(undefined);
  const load = async () => {
    try {
      setProducts(await productsApi.listAdmin());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load products",
      );
    } finally {
      setLoadingProducts(false);
    }
  };
  useEffect(() => {
    if (!loading && user?.role === "admin") void load();
  }, [loading, user]);
  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center text-muted-foreground">
        Checking account access
      </main>
    );
  if (!user || user.role !== "admin")
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-2xl font-extrabold text-foreground">
            Admin access required
          </h1>
          <p className="mt-2 text-muted-foreground">
            Sign in with an administrator account to manage products and
            inventory.
          </p>
          <button
            onClick={() => navigate("auth")}
            className="mt-5 px-5 py-3 rounded-full bg-primary text-primary-foreground font-bold"
          >
            Sign In
          </button>
        </div>
      </main>
    );
  const remove = async (id: string) => {
    if (
      !window.confirm("Delete this product permanently? This cannot be undone.")
    )
      return;
    try {
      await productsApi.remove(id);
      await load();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to delete product",
      );
    }
  };
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-extrabold text-foreground">
              PawFit Administration
            </h1>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
          <button
            onClick={() => void logout().then(() => navigate("home"))}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-foreground">
              Products and inventory
            </h2>
            <p className="text-muted-foreground mt-1">
              Create catalogue entries and maintain stock by breed and size.
            </p>
          </div>
          <button
            onClick={() => setEditing(null)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-primary text-primary-foreground font-bold"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>
        {error && (
          <p className="mt-5 rounded-xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </p>
        )}
        {loadingProducts ? (
          <p className="mt-10 text-muted-foreground">Loading products</p>
        ) : products.length ? (
          <div className="mt-8 overflow-x-auto border border-border rounded-2xl">
            <table className="w-full text-sm">
              <thead className="bg-muted">
                <tr>
                  <th className="p-3 text-left">Product</th>
                  <th className="p-3 text-left">Category</th>
                  <th className="p-3 text-left">Stock</th>
                  <th className="p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t border-border">
                    <td className="p-3">
                      <p className="font-bold text-foreground">
                        {product.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        ₱{product.price.toLocaleString()} ·{" "}
                        {product.isActive ? "Active" : "Inactive"}
                      </p>
                    </td>
                    <td className="p-3 text-muted-foreground">
                      {product.category}
                    </td>
                    <td className="p-3">
                      <p className="font-semibold text-foreground">
                        {product.stock}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {product.inventory
                          .map(
                            (item) =>
                              `${item.breed} ${item.size}: ${item.stock}`,
                          )
                          .join(", ")}
                      </p>
                    </td>
                    <td className="p-3 text-right">
                      <button
                        onClick={() => setEditing(product)}
                        className="mr-3 text-primary font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => void remove(product.id)}
                        className="text-destructive"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="mt-8 border border-border rounded-2xl p-8 text-center">
            <Package className="mx-auto text-muted-foreground" />
            <p className="mt-3 text-muted-foreground">
              No products have been created yet.
            </p>
          </div>
        )}
      </section>
      <AdminOrders />
      {editing !== undefined && (
        <ProductEditor
          initial={editing || undefined}
          onClose={() => setEditing(undefined)}
          onProductSaved={load}
        />
      )}
    </main>
  );
}

function ProductEditor({
  initial,
  onClose,
  onProductSaved,
}: {
  initial?: Product;
  onClose: () => void;
  onProductSaved: () => Promise<void>;
}) {
  const [product, setProduct] = useState<Product | null>(initial ?? null);
  const [draft, setDraft] = useState<Draft>(
    initial ? productDraft(initial) : emptyDraft(),
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [queuedModels, setQueuedModels] = useState<QueuedModel[]>([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [progress, setProgress] = useState("");
  const [saving, setSaving] = useState(false);
  const imagePreview = useObjectUrl(imageFile);
  const isNew = !product;

  const updateVariant = (
    index: number,
    key: keyof InventoryItem,
    value: string | number,
  ) =>
    setDraft((current) => ({
      ...current,
      inventory: current.inventory.map((variant, itemIndex) =>
        itemIndex === index ? { ...variant, [key]: value } : variant,
      ),
    }));
  const addVariant = () =>
    setDraft((current) => ({
      ...current,
      inventory: [
        ...current.inventory,
        { breed: BREEDS[0], size: "", sku: "", stock: 0, lowStockThreshold: 3 },
      ],
    }));

  const validateImage = () => {
    if (!imageFile && !product?.image) return "Choose a product image.";
    if (
      imageFile &&
      !["image/jpeg", "image/png", "image/webp"].includes(imageFile.type)
    )
      return "Product image must be a JPEG, PNG, or WebP file.";
    return null;
  };

  const validateQueuedModels = () => {
    const breeds = new Set<string>();
    for (const entry of queuedModels) {
      const breed = entry.breed.trim();
      if (!breed || !entry.file)
        return "Every queued 3D model needs a breed and a GLB file.";
      if (!entry.file.name.toLowerCase().endsWith(".glb"))
        return `${breed} must use a .glb file.`;
      const key = breed.toLowerCase();
      if (breeds.has(key))
        return `Only one queued 3D model is allowed for ${breed}.`;
      breeds.add(key);
    }
    return null;
  };

  const uploadQueuedModels = async (currentProduct: Product) => {
    const failed: QueuedModel[] = [];
    let updatedProduct = currentProduct;
    for (const entry of queuedModels) {
      setProgress(`Uploading ${entry.breed.trim()} model...`);
      try {
        updatedProduct = await productsApi.uploadModel(
          updatedProduct.id,
          entry.breed.trim(),
          entry.file as File,
        );
      } catch (uploadError) {
        failed.push(entry);
        setError(
          (current) =>
            `${current ? `${current} ` : ""}${entry.breed.trim()}: ${uploadError instanceof Error ? uploadError.message : "model upload failed."}`,
        );
      }
    }
    setQueuedModels(failed);
    return { product: updatedProduct, failed };
  };

  const save = async (event: React.FormEvent) => {
    event.preventDefault();
    const imageError = validateImage();
    const modelError = validateQueuedModels();
    if (imageError || modelError) {
      setError(imageError || modelError || "");
      return;
    }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      let saved: Product;
      if (product) {
        setProgress("Saving product details...");
        saved = await productsApi.update(product.id, draft);
      } else {
        setProgress("Uploading product image...");
        const { imagePath } = await productsApi.uploadPendingImage(
          imageFile as File,
        );
        setProgress("Creating product...");
        saved = await productsApi.create({ ...draft, image: imagePath });
        setImageFile(null);
      }
      setProduct(saved);
      if (product && imageFile) {
        setProgress("Uploading product image...");
        saved = await productsApi.uploadImage(saved.id, imageFile);
        setImageFile(null);
      }
      const queuedCount = queuedModels.length;
      const modelUpload = queuedCount ? await uploadQueuedModels(saved) : null;
      if (modelUpload) saved = modelUpload.product;
      setProduct(saved);
      setDraft(productDraft(saved));
      if (modelUpload?.failed.length)
        setSuccess("Product created. Retry the failed 3D model uploads below.");
      else if (queuedCount)
        setSuccess("Product and 3D models created successfully.");
      else
        setSuccess(
          isNew ? "Product created successfully." : "Product details saved.",
        );
      await onProductSaved();
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to save product",
      );
    } finally {
      setProgress("");
      setSaving(false);
    }
  };

  const updateProductFromModelUpload = async (updatedProduct: Product) => {
    setProduct(updatedProduct);
    setDraft(productDraft(updatedProduct));
    await onProductSaved();
  };
  const currentImage = imagePreview || product?.image;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 overflow-y-auto p-4">
      <form
        onSubmit={save}
        className="my-6 mx-auto max-w-3xl bg-card rounded-3xl border border-border"
      >
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-extrabold text-foreground">
            {product ? "Edit Product" : "Add Product"}
          </h2>
          <button type="button" aria-label="Close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="p-5 grid gap-5">
          {error && (
            <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </p>
          )}
          {success && (
            <p className="rounded-xl bg-green-50 p-3 text-sm text-green-800">
              {success}
            </p>
          )}
          {progress && (
            <p className="rounded-xl bg-muted p-3 text-sm text-muted-foreground">
              {progress}
            </p>
          )}
          <section className="grid gap-4">
            <h3 className="font-bold text-foreground">Product Details</h3>
            <Label text="Product name">
              <input
                required
                value={draft.name}
                onChange={(event) =>
                  setDraft({ ...draft, name: event.target.value })
                }
                className="input"
              />
            </Label>
            <div className="grid sm:grid-cols-2 gap-4">
              <Label text="Category">
                <input
                  required
                  value={draft.category}
                  onChange={(event) =>
                    setDraft({ ...draft, category: event.target.value })
                  }
                  className="input"
                />
              </Label>
              <Label text="Price">
                <input
                  type="number"
                  min="0"
                  required
                  value={draft.price || ""}
                  onChange={(event) =>
                    setDraft({ ...draft, price: Number(event.target.value) })
                  }
                  className="input"
                />
              </Label>
            </div>
            <Label text="Description">
              <textarea
                required
                value={draft.description}
                onChange={(event) =>
                  setDraft({ ...draft, description: event.target.value })
                }
                rows={4}
                className="input"
              />
            </Label>
            <ImagePicker
              file={imageFile}
              preview={currentImage}
              onChange={setImageFile}
            />
            <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <input
                type="checkbox"
                checked={draft.featured}
                onChange={(event) =>
                  setDraft({ ...draft, featured: event.target.checked })
                }
              />{" "}
              Featured product
            </label>
          </section>
          <section className="border-t border-border pt-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h3 className="font-bold text-foreground">
                  Inventory Variants
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use variants for sellable options such as size or color. Each
                  variant can have its own SKU, price, and stock.
                </p>
              </div>
              <button
                type="button"
                onClick={addVariant}
                className="shrink-0 text-sm font-semibold text-primary"
              >
                Add variant
              </button>
            </div>
            <div className="mt-3 space-y-3">
              {draft.inventory.map((variant, index) => (
                <InventoryRow
                  key={variant._id || index}
                  variant={variant}
                  onChange={(key, value) => updateVariant(index, key, value)}
                  onRemove={() =>
                    setDraft((current) => ({
                      ...current,
                      inventory: current.inventory.filter(
                        (_, itemIndex) => itemIndex !== index,
                      ),
                    }))
                  }
                />
              ))}
            </div>
          </section>
          {!product || queuedModels.length ? (
            <QueuedModelsSection
              entries={queuedModels}
              product={product}
              disabled={saving}
              onChange={setQueuedModels}
              onUploaded={updateProductFromModelUpload}
            />
          ) : (
            <ModelUploadSection
              product={product}
              onUploaded={updateProductFromModelUpload}
            />
          )}
        </div>
        <div className="flex gap-3 p-5 border-t border-border">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 rounded-full border border-border font-semibold"
          >
            Cancel
          </button>
          <button
            disabled={saving}
            className="flex-1 py-3 rounded-full bg-primary text-primary-foreground font-bold disabled:opacity-50"
          >
            {saving
              ? "Working..."
              : product
                ? "Save Product Details"
                : "Create Product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function ImagePicker({
  file,
  preview,
  onChange,
}: {
  file: File | null;
  preview?: string;
  onChange: (file: File | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground">Product Image</p>
      <div className="mt-1.5 rounded-xl border border-border p-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(event) => onChange(event.target.files?.[0] ?? null)}
          className="input"
        />
        {file && (
          <p className="mt-2 text-sm text-muted-foreground">
            Selected: {file.name}
          </p>
        )}
        {preview && (
          <img
            src={preview}
            alt="Selected product preview"
            className="mt-3 h-36 w-36 rounded-xl border border-border object-cover"
          />
        )}
        {file && (
          <button
            type="button"
            onClick={() => {
              onChange(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
            className="mt-3 text-sm font-semibold text-destructive"
          >
            Remove selected image
          </button>
        )}
      </div>
    </div>
  );
}

function InventoryRow({
  variant,
  onChange,
  onRemove,
}: {
  variant: InventoryItem;
  onChange: (key: keyof InventoryItem, value: string | number) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 rounded-xl border border-border p-3">
      <Label text="Breed">
        <select
          value={variant.breed}
          onChange={(event) => onChange("breed", event.target.value as Breed)}
          className="input"
        >
          {BREEDS.map((breed) => (
            <option key={breed}>{breed}</option>
          ))}
        </select>
      </Label>
      <Label text="Size">
        <input
          required
          value={variant.size}
          onChange={(event) => onChange("size", event.target.value)}
          placeholder="e.g. M"
          className="input"
        />
      </Label>
      <Label text="SKU">
        <input
          required
          value={variant.sku}
          onChange={(event) => onChange("sku", event.target.value)}
          placeholder="e.g. HOODIE-LAB-M"
          className="input"
        />
      </Label>
      <Label text="Stock">
        <input
          type="number"
          min="0"
          required
          value={variant.stock}
          onChange={(event) => onChange("stock", Number(event.target.value))}
          placeholder="0"
          className="input"
        />
      </Label>
      <Label text="Low stock threshold">
        <input
          type="number"
          min="0"
          value={variant.lowStockThreshold}
          onChange={(event) =>
            onChange("lowStockThreshold", Number(event.target.value))
          }
          placeholder="3"
          className="input"
        />
      </Label>
      <div className="flex items-end">
        <button
          type="button"
          onClick={onRemove}
          className="w-full py-2.5 text-sm font-semibold text-destructive"
        >
          Remove variant
        </button>
      </div>
    </div>
  );
}

function QueuedModelsSection({
  entries,
  product,
  disabled,
  onChange,
  onUploaded,
}: {
  entries: QueuedModel[];
  product: Product | null;
  disabled: boolean;
  onChange: (entries: QueuedModel[]) => void;
  onUploaded: (product: Product) => Promise<void>;
}) {
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);
  const update = (id: string, patch: Partial<QueuedModel>) =>
    onChange(
      entries.map((entry) =>
        entry.id === id ? { ...entry, ...patch } : entry,
      ),
    );
  const retry = async () => {
    if (!product) return;
    const failed: QueuedModel[] = [];
    let updated = product;
    setError("");
    setUploading(true);
    for (const entry of entries) {
      try {
        if (
          !entry.breed.trim() ||
          !entry.file ||
          !entry.file.name.toLowerCase().endsWith(".glb")
        )
          throw new Error("A breed and .glb file are required");
        updated = await productsApi.uploadModel(
          updated.id,
          entry.breed.trim(),
          entry.file,
        );
      } catch (requestError) {
        failed.push(entry);
        setError(
          (current) =>
            `${current ? `${current} ` : ""}${entry.breed || "Unnamed breed"}: ${requestError instanceof Error ? requestError.message : "model upload failed."}`,
        );
      }
    }
    onChange(failed);
    await onUploaded(updated);
    setUploading(false);
  };
  return (
    <section className="border-t border-border pt-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-foreground">
            Breed-Specific 3D Models
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Add complete GLB models now. They will upload after the product is
            created.
          </p>
        </div>
        <button
          type="button"
          disabled={disabled || uploading}
          onClick={() => onChange([...entries, createQueueRow()])}
          className="shrink-0 text-sm font-semibold text-primary"
        >
          Add model
        </button>
      </div>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      <div className="mt-4 space-y-3">
        {entries.length ? (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="grid grid-cols-1 sm:grid-cols-[1fr_1.5fr_auto] gap-3 rounded-xl border border-border p-3"
            >
              <Label text="Breed">
                <input
                  value={entry.breed}
                  onChange={(event) =>
                    update(entry.id, { breed: event.target.value })
                  }
                  list="queued-model-breeds"
                  placeholder="e.g. Labrador"
                  className="input"
                />
              </Label>
              <Label text="GLB file">
                <input
                  type="file"
                  accept=".glb,model/gltf-binary"
                  onChange={(event) =>
                    update(entry.id, { file: event.target.files?.[0] ?? null })
                  }
                  className="input"
                />
                {entry.file && (
                  <span className="text-xs font-normal text-muted-foreground">
                    {entry.file.name}
                  </span>
                )}
              </Label>
              <div className="flex items-end">
                <button
                  type="button"
                  disabled={disabled || uploading}
                  onClick={() =>
                    onChange(entries.filter((item) => item.id !== entry.id))
                  }
                  className="w-full py-2.5 text-sm font-semibold text-destructive"
                >
                  Remove row
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">
            No models queued. Add a row to upload breed-specific GLB files after
            creation.
          </p>
        )}
        <datalist id="queued-model-breeds">
          {BREEDS.map((breed) => (
            <option key={breed} value={breed} />
          ))}
        </datalist>
      </div>
      {product && entries.length > 0 && (
        <button
          type="button"
          disabled={uploading || disabled}
          onClick={() => void retry()}
          className="mt-4 px-4 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-bold disabled:opacity-50"
        >
          {uploading ? "Uploading queued models..." : "Retry queued models"}
        </button>
      )}
    </section>
  );
}

function ModelUploadSection({
  product,
  onUploaded,
}: {
  product: Product;
  onUploaded: (product: Product) => Promise<void>;
}) {
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [customBreed, setCustomBreed] = useState("");
  const [customFile, setCustomFile] = useState<File | null>(null);
  const [busyBreed, setBusyBreed] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const breeds = [
    ...new Set([...BREEDS, ...product.models.map((model) => model.breed)]),
  ];

  const upload = async (breed: string, file: File | null) => {
    if (!breed.trim())
      return setError("Enter a breed before uploading a model.");
    if (!file) return setError("Choose a GLB file before uploading.");
    if (!file.name.toLowerCase().endsWith(".glb"))
      return setError("Only .glb files are allowed.");
    setBusyBreed(breed);
    setError("");
    setSuccess("");
    try {
      await onUploaded(await productsApi.uploadModel(product.id, breed, file));
      setSuccess(
        `${breed} model ${product.models.some((model) => model.breed.toLowerCase() === breed.toLowerCase()) ? "replaced" : "uploaded"}.`,
      );
      setCustomBreed("");
      setCustomFile(null);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to upload the ${breed} model.`,
      );
    } finally {
      setBusyBreed(null);
    }
  };

  const remove = async (breed: string) => {
    setBusyBreed(breed);
    setError("");
    setSuccess("");
    try {
      await onUploaded(await productsApi.deleteModel(product.id, breed));
      setSuccess(`${breed} model deleted.`);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : `Unable to delete the ${breed} model.`,
      );
    } finally {
      setBusyBreed(null);
    }
  };

  return (
    <section className="border-t border-border pt-5">
      <h3 className="font-bold text-foreground">3D Models</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Upload one complete GLB model for each breed. The model should already
        contain the dog wearing this product.
      </p>
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
      {success && <p className="mt-3 text-sm text-green-700">{success}</p>}
      <div className="mt-4 space-y-3">
        {breeds.map((breed) => {
          const model = product.models.find(
            (item) => item.breed.toLowerCase() === breed.toLowerCase(),
          );
          const busy = busyBreed === breed;
          return (
            <div
              key={breed.toLowerCase()}
              className="flex items-center justify-between gap-4 rounded-xl border border-border p-4"
            >
              <input
                ref={(element) => {
                  inputRefs.current[breed] = element;
                }}
                type="file"
                accept=".glb,model/gltf-binary"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (file) void upload(breed, file);
                  event.currentTarget.value = "";
                }}
              />
              <div>
                <p className="font-semibold text-foreground">{breed}</p>
                {model ? (
                  <>
                    <p className="text-xs text-green-700">Uploaded</p>
                    <p className="text-xs text-muted-foreground">
                      {model.modelPath}
                    </p>
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    No model uploaded
                  </p>
                )}
              </div>
              <div className="flex shrink-0 gap-3">
                {model && (
                  <button
                    type="button"
                    disabled={Boolean(busyBreed)}
                    onClick={() => inputRefs.current[breed]?.click()}
                    className="text-sm font-semibold text-primary disabled:opacity-50"
                  >
                    {busy ? "Replacing" : "Replace"}
                  </button>
                )}
                {model ? (
                  <button
                    type="button"
                    disabled={Boolean(busyBreed)}
                    onClick={() => void remove(breed)}
                    className="text-sm font-semibold text-destructive disabled:opacity-50"
                  >
                    {busy ? "Deleting" : "Delete"}
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={Boolean(busyBreed)}
                    onClick={() => inputRefs.current[breed]?.click()}
                    className="text-sm font-semibold text-primary disabled:opacity-50"
                  >
                    {busy ? "Uploading" : "Upload"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_1.5fr_auto] rounded-xl border border-border p-3">
        <Label text="Additional breed">
          <input
            value={customBreed}
            onChange={(event) => setCustomBreed(event.target.value)}
            placeholder="e.g. Husky"
            className="input"
          />
        </Label>
        <Label text="GLB file">
          <input
            type="file"
            accept=".glb,model/gltf-binary"
            onChange={(event) => setCustomFile(event.target.files?.[0] ?? null)}
            className="input"
          />
        </Label>
        <div className="flex items-end">
          <button
            type="button"
            disabled={Boolean(busyBreed)}
            onClick={() => void upload(customBreed.trim(), customFile)}
            className="w-full py-2.5 text-sm font-semibold text-primary disabled:opacity-50"
          >
            Upload model
          </button>
        </div>
      </div>
    </section>
  );
}

function useObjectUrl(file: File | null) {
  const [url, setUrl] = useState<string | undefined>();
  useEffect(() => {
    if (!file) {
      setUrl(undefined);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);
  return url;
}
function productDraft(product: Product): Draft {
  return {
    name: product.name,
    category: product.category,
    price: product.price,
    description: product.description,
    image: product.image,
    images: product.images,
    featured: product.featured,
    inventory: product.inventory,
    sizeCharts: product.sizeCharts,
  };
}
function filenameFromPath(modelPath: string) {
  return modelPath.split("/").pop() || modelPath;
}
function Label({
  text,
  children,
}: {
  text: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5 text-xs font-bold text-muted-foreground">
      {text}
      {children}
    </label>
  );
}
