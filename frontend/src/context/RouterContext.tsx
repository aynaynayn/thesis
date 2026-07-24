import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Page = "home" | "shop" | "product" | "checkout" | "auth" | "account" | "admin" | "verify-email" | "reset-password";

type Route = { page: Page; productId: string | null };
type RouterContextType = Route & { navigate: (page: Page, productId?: string) => void };

const RouterContext = createContext<RouterContextType | null>(null);

function readRoute(): Route {
  const path = window.location.pathname;
  if (path === "/shop") return { page: "shop", productId: null };
  if (path === "/checkout") return { page: "checkout", productId: null };
  if (path === "/auth") return { page: "auth", productId: null };
  if (path === "/account") return { page: "account", productId: null };
  if (path === "/admin") return { page: "admin", productId: null };
  if (path === "/verify-email") return { page: "verify-email", productId: null };
  if (path === "/reset-password") return { page: "reset-password", productId: null };
  if (path.startsWith("/products/")) return { page: "product", productId: decodeURIComponent(path.slice(10)) };
  return { page: "home", productId: null };
}

function pathFor(page: Page, productId?: string) {
  if (page === "product" && productId) return `/products/${encodeURIComponent(productId)}`;
  return page === "home" ? "/" : `/${page}`;
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const onPopState = () => setRoute(readRoute());
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  const navigate = (page: Page, productId?: string) => {
    window.history.pushState({}, "", pathFor(page, productId));
    setRoute({ page, productId: productId ?? null });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return <RouterContext.Provider value={{ ...route, navigate }}>{children}</RouterContext.Provider>;
}

export function useRouter() {
  const context = useContext(RouterContext);
  if (!context) throw new Error("useRouter must be used within RouterProvider");
  return context;
}
