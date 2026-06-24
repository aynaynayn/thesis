import { createContext, useContext, useState, ReactNode } from "react";

export type Page =
  | "home"
  | "shop"
  | "product"
  | "checkout"
  | "auth"
  | "account"
  | "admin";

type RouterContextType = {
  page: Page;
  productId: string | null;
  navigate: (page: Page, productId?: string) => void;
};

const RouterContext = createContext<RouterContextType | null>(null);

export function RouterProvider({ children }: { children: ReactNode }) {
  const [page, setPage] = useState<Page>("home");
  const [productId, setProductId] = useState<string | null>(null);

  const navigate = (p: Page, id?: string) => {
    setPage(p);
    setProductId(id ?? null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <RouterContext.Provider value={{ page, productId, navigate }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRouter() {
  const ctx = useContext(RouterContext);
  if (!ctx) throw new Error("useRouter must be used within RouterProvider");
  return ctx;
}
