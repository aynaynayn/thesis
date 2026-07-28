import type { Product } from "../data/products";

const API_URL = import.meta.env.VITE_API_URL || "/api";
export const AUTH_TOKEN_STORAGE_KEY = "pawfit_auth_token";

type ApiProduct = Omit<Product, "id" | "stock"> & { _id: string };

function toProduct(product: ApiProduct): Product {
  return {
    ...product,
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

export type User = { id: string; name: string; email: string; phone?: string; role: "user" | "admin" };

export const authApi = {
  register: (body: { name: string; email: string; password: string; phone?: string }) => request<{ message: string; user: User }>("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) => request<{ token: string; user: User }>("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request<void>("/auth/logout", { method: "POST" }),
  me: () => request<{ user: User }>("/auth/me"),
  verifyEmail: (token: string) => request<{ message: string }>(`/auth/verify-email?token=${encodeURIComponent(token)}`),
  resendVerification: (email: string) => request<{ message: string }>("/auth/resend-verification", { method: "POST", body: JSON.stringify({ email }) }),
  forgotPassword: (email: string) => request<{ message: string }>("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) }),
  resetPassword: (token: string, password: string) => request<{ message: string }>("/auth/reset-password", { method: "POST", body: JSON.stringify({ token, password }) }),
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
  async adjustInventory(id: string, body: { breed: string; size: string; quantity: number; reason: string }) {
    const data = await request<{ product: ApiProduct }>(`/products/${id}/inventory`, { method: "PATCH", body: JSON.stringify(body) });
    return toProduct(data.product);
  },
  async uploadModel(id: string, breed: string, file: File) {
    const formData = new FormData();
    formData.append("breed", breed);
    formData.append("model", file);
    const data = await request<{ product: ApiProduct }>(`/products/${id}/models`, { method: "POST", body: formData });
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
    return request<{ imagePath: string }>("/products/image-upload", { method: "POST", body: formData });
  },
  remove: (id: string) => request<void>(`/products/${id}`, { method: "DELETE" }),
};

export type CartItem = { id: string; product: Product; breed: string; size: string; quantity: number };
type ApiCartItem = { id: string; _id?: string; product: ApiProduct; breed: string; size: string; quantity: number };
function toCartItems(items: ApiCartItem[]): CartItem[] { return items.map((item) => ({ id: item.id || item._id || "", product: toProduct(item.product), breed: item.breed, size: item.size, quantity: item.quantity })); }

export const cartApi = {
  async get() { const data = await request<{ cart: { items: ApiCartItem[] } }>("/cart"); return toCartItems(data.cart.items); },
  async add(productId: string, breed: string, size: string, quantity = 1) { const data = await request<{ cart: { items: ApiCartItem[] } }>("/cart/items", { method: "POST", body: JSON.stringify({ productId, breed, size, quantity }) }); return toCartItems(data.cart.items); },
  async update(itemId: string, quantity: number) { const data = await request<{ cart: { items: ApiCartItem[] } }>(`/cart/items/${itemId}`, { method: "PATCH", body: JSON.stringify({ quantity }) }); return toCartItems(data.cart.items); },
  async remove(itemId: string) { const data = await request<{ cart: { items: ApiCartItem[] } }>(`/cart/items/${itemId}`, { method: "DELETE" }); return toCartItems(data.cart.items); },
  clear: () => request<void>("/cart", { method: "DELETE" }),
};

export type Order = { id: string; _id: string; orderNumber: string; items: { product: string; name: string; image: string; breed: string; size: string; sku: string; quantity: number; unitPrice: number }[]; deliveryAddress: { firstName: string; lastName: string; email: string; phone: string; line1: string; barangay?: string; city: string; province: string; postalCode?: string }; paymentMethod: "cod" | "gcash" | "maya"; paymentReference?: string; paymentStatus: "pending" | "paid" | "failed" | "refunded"; status: "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled"; subtotal: number; shippingFee: number; total: number; createdAt: string };
export const ordersApi = {
  create: (body: { deliveryAddress: Order["deliveryAddress"]; paymentMethod: Order["paymentMethod"]; paymentReference?: string }) => request<{ order: Order }>("/orders", { method: "POST", body: JSON.stringify(body) }),
  mine: () => request<{ orders: Order[] }>("/orders"),
  cancel: (id: string) => request<{ order: Order }>(`/orders/${id}/cancel`, { method: "PATCH" }),
  admin: () => request<{ orders: Order[] }>("/orders/admin/all"),
  updateStatus: (id: string, status: Order["status"], paymentStatus?: Order["paymentStatus"]) => request<{ order: Order }>(`/orders/admin/${id}/status`, { method: "PATCH", body: JSON.stringify({ status, paymentStatus }) }),
};
