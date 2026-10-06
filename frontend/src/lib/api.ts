import type { Product } from "../data/products";

const API_URL = import.meta.env.VITE_API_URL || "/api";

export const AUTH_TOKEN_STORAGE_KEY = "pawfit_auth_token";

type ApiProduct = Omit<Product, "id" | "stock"> & { _id: string };

function toProduct(product: ApiProduct): Product {
  const colorVariants = product.colorVariants?.length
    ? product.colorVariants
    : [{ name: "Default", hex: "#C96D48", models: product.models || [] }];
  return {
    ...product,
    colorVariants,
    models: product.models?.length ? product.models : colorVariants[0].models,
    id: product._id,
    stock: product.inventory.reduce((total, item) => total + item.stock, 0),
  };
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window === "undefined" ? null : window.localStorage.getItem(AUTH_TOKEN_STORAGE_KEY);
  const isFormData = options.body instanceof FormData;
  const response = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: {
      ...(!isFormData ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });
  if (response.status === 204) return undefined as T;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Request failed");
  return data as T;
}

export type PetProfile = { id: string; name: string; breed: string; neckGirthCm: number; chestGirthCm: number; backLengthCm: number };
export type PetProfileInput = Omit<PetProfile, "id">;
export type User = { id: string; name: string; email: string; phone?: string; role: "user" | "admin" | "superadmin"; isActive?: boolean; isOwner?: boolean; mustChangePassword?: boolean; petProfiles: PetProfile[] };

export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string }) => request<{ message: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) => request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/auth/me"),
  createPetProfile: (petProfile: PetProfileInput) => request<{ user: User }>("/auth/pet-profiles", { method: "POST", body: JSON.stringify(petProfile) }),
  updatePetProfile: (id: string, petProfile: PetProfileInput) => request<{ user: User }>(`/auth/pet-profiles/${encodeURIComponent(id)}`, { method: "PATCH", body: JSON.stringify(petProfile) }),
  deletePetProfile: (id: string) => request<{ user: User }>(`/auth/pet-profiles/${encodeURIComponent(id)}`, { method: "DELETE" }),
  verifyEmail: (token: string) => request<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  resendVerification: (email: string) => request<{ message: string }>("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),
  forgotPassword: (email: string) => request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) => request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),
  changePassword: (body: { currentPassword: string; newPassword: string; confirmPassword: string }) => request<{ message: string }>("/auth/password", { method: "PATCH", body: JSON.stringify(body) }),
};

export type AdminAccount = { id: string; name: string; email: string; role: "user" | "admin" | "superadmin"; isActive: boolean; isOwner: boolean; pets: number; createdAt: string };
export const superAdminApi = {
  overview: () => request<{ stats: { totalUsers: number; activeAdmins: number; totalProducts: number; totalOrders: number; revenueThisMonth: number }; bestSelling: { _id: string; name: string; quantity: number }[]; lowStock: Product[]; pending: { orderNumber: string; createdAt: string }[] }>("/superadmin/overview"),
  accounts: (params = "") => request<{ accounts: AdminAccount[]; total: number; page: number; pages: number }>(`/superadmin/accounts${params ? `?${params}` : ""}`),
  createAdmin: (body: { name: string; email: string; temporaryPassword: string }) => request<{ account: AdminAccount; temporaryPassword: string }>("/superadmin/accounts", { method: "POST", body: JSON.stringify(body) }),
  updateAccount: (id: string, body: Partial<Pick<AdminAccount, "role" | "isActive">>) => request<{ account: AdminAccount }>(`/superadmin/accounts/${id}`, { method: "PATCH", body: JSON.stringify(body) }),
  categories: () => request<{ categories: { id: string; name: string; productCount: number }[] }>("/superadmin/categories"),
  createCategory: (name: string) => request("/superadmin/categories", { method: "POST", body: JSON.stringify({ name }) }),
  renameCategory: (id: string, name: string) => request(`/superadmin/categories/${id}`, { method: "PATCH", body: JSON.stringify({ name }) }),
  deleteCategory: (id: string) => request<void>(`/superadmin/categories/${id}`, { method: "DELETE" }),
  settings: () => request<{ settings: { storeName: string; supportEmail: string; announcement: string } }>("/superadmin/settings"),
  updateSettings: (body: { storeName: string; supportEmail: string; announcement: string }) => request<{ settings: { storeName: string; supportEmail: string; announcement: string } }>("/superadmin/settings", { method: "PATCH", body: JSON.stringify(body) }),
  transferOwnership: (body: { accountId: string; phrase: string; currentPassword: string }) => request<{ message: string }>("/superadmin/settings/transfer-ownership", { method: "POST", body: JSON.stringify(body) }),
  audit: (params = "") => request<{ items: { _id: string; actorName: string; action: string; targetLabel: string; details: Record<string, { from?: string; to?: string }>; createdAt: string }[]; total: number; page: number; pages: number }>(`/superadmin/audit${params ? `?${params}` : ""}`),
  products: () => request<{ products: (Product & { modelCoverage: { uploaded: number; total: number } })[] }>("/superadmin/products"),
  toggleProduct: (id: string) => request(`/superadmin/products/${id}/toggle`, { method: "PATCH" }),
  deleteProduct: (id: string) => request<void>(`/superadmin/products/${id}`, { method: "DELETE" }),
  orders: () => request<{ orders: Order[] }>("/superadmin/orders"),
  orderTimeline: (id: string) => request<{ logs: { _id: string; actorName: string; action: string; details: { from?: string; to?: string }; createdAt: string }[] }>(`/superadmin/orders/${id}/timeline`),
};

export const storeSettingsApi = {
  get: () => request<{ settings: { storeName: string; supportEmail: string; announcement: string } }>("/settings"),
};

export const productsApi = {
  async list(params: Record<string, string | boolean | undefined> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => value !== undefined && value !== "" && query.set(key, String(value)));
    const data = await request<{ products: ApiProduct[] }>(`/products${query.size ? `?${query}` : ""}`);
    return data.products.map(toProduct);
  },
  async get(idOrSlug: string) {
    const data = await request<{ product: ApiProduct }>(`/products/${encodeURIComponent(idOrSlug)}`);
    return toProduct(data.product);
  },
  async listAdmin() {
    const data = await request<{ products: ApiProduct[] }>("/products/admin/all");
    return data.products.map(toProduct);
  },
  async create(product: Omit<Product, "id" | "slug" | "stock" | "availableBreeds" | "isActive" | "models">) {
    const data = await request<{ product: ApiProduct }>("/products", { method: "POST", body: JSON.stringify(product) });
    return toProduct(data.product);
  },
  async update(id: string, product: Partial<Omit<Product, "id" | "stock" | "availableBreeds">>) {
    const data = await request<{ product: ApiProduct }>(`/products/${id}`, { method: "PATCH", body: JSON.stringify(product) });
    return toProduct(data.product);
  },
  async adjustInventory(id: string, body: { size: string; quantity: number; reason: string }) {
    const data = await request<{ product: ApiProduct }>(`/products/${id}/inventory`, { method: "PATCH", body: JSON.stringify(body) });
    return toProduct(data.product);
  },
  async uploadModel(id: string, breed: string, file: File, colorName?: string) {
    const formData = new FormData();
    formData.append("breed", breed);
    formData.append("model", file);
    if (colorName) formData.append("colorName", colorName);
    const data = await request<{ product: ApiProduct }>(`/products/${id}/models`, { method: "POST", body: formData });
    return toProduct(data.product);
  },
  async deleteModel(id: string, breed: string, colorName?: string) {
    const query = colorName ? `?colorName=${encodeURIComponent(colorName)}` : "";
    const data = await request<{ product: ApiProduct }>(`/products/${id}/models/${encodeURIComponent(breed)}${query}`, { method: "DELETE" });
    return toProduct(data.product);
  },
  async uploadImage(id: string, file: File) {
    const formData = new FormData();
    formData.append("image", file);
    const data = await request<{ product: ApiProduct }>(`/products/${id}/image`, { method: "POST", body: formData });
    return toProduct(data.product);
  },
  async uploadPendingImage(file: File) {
    const formData = new FormData();
    formData.append("image", file);
    return request<{ imagePath: string; imageCloudinaryPublicId: string }>("/products/image-upload", { method: "POST", body: formData });
  },
  remove: (id: string) => request<void>(`/products/${id}`, { method: "DELETE" }),
};

export type CartItem = { id: string; product: Product; petBreed?: string; colorName?: string; colorHex?: string; size: string; quantity: number };
type ApiCartItem = { id: string; _id?: string; product: ApiProduct; petBreed?: string; colorName?: string; colorHex?: string; size: string; quantity: number };
function toCartItems(items: ApiCartItem[]): CartItem[] { return items.map((item) => ({ id: item.id || item._id || "", product: toProduct(item.product), petBreed: item.petBreed, colorName: item.colorName, colorHex: item.colorHex, size: item.size, quantity: item.quantity })); }

export const cartApi = {
  async get() { const data = await request<{ cart: { items: ApiCartItem[] } }>("/cart"); return toCartItems(data.cart.items); },
  async add(productId: string, size: string, petBreed?: string, colorName?: string, quantity = 1) { const data = await request<{ cart: { items: ApiCartItem[] } }>("/cart/items", { method: "POST", body: JSON.stringify({ productId, size, petBreed, colorName, quantity }) }); return toCartItems(data.cart.items); },
  async update(itemId: string, quantity: number) { const data = await request<{ cart: { items: ApiCartItem[] } }>(`/cart/items/${itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }); return toCartItems(data.cart.items); },
  async remove(itemId: string) { const data = await request<{ cart: { items: ApiCartItem[] } }>(`/cart/items/${itemId}`, { method: "DELETE" }); return toCartItems(data.cart.items); },
  clear: () => request<void>("/cart", { method: "DELETE" }),
};

export type Order = { id: string; _id: string; orderNumber: string; items: { product: string; name: string; image: string; breed?: string; colorName?: string; colorHex?: string; size: string; sku: string; quantity: number; unitPrice: number }[]; deliveryAddress: { firstName: string; lastName: string; email: string; phone: string; line1: string; barangay?: string; city: string; province: string; postalCode?: string }; paymentMethod: "cod" | "gcash" | "maya"; paymentReference?: string; paymentStatus: "pending" | "paid" | "failed" | "refunded"; status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"; cancellationReason?: string; cancelledBy?: "customer" | "admin"; cancelledAt?: string; subtotal: number; shippingFee: number; total: number; createdAt: string };
export const ordersApi = {
  create: (body: { deliveryAddress: Order["deliveryAddress"]; paymentMethod: "cod" }) => request<{ order: Order }>("/orders", { method: "POST", body: JSON.stringify(body) }),
  mine: () => request<{ orders: Order[] }>("/orders"),
  cancel: (id: string) => request<{ order: Order }>(`/orders/${id}/cancel`, { method: "PATCH" }),
  admin: () => request<{ orders: Order[] }>("/orders/admin/all"),
  updateStatus: (id: string, status: Order["status"], paymentStatus?: Order["paymentStatus"], cancellationReason?: string) => request<{ order: Order }>(`/orders/admin/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, paymentStatus, cancellationReason }) }),
};
