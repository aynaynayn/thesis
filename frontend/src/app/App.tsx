import { CartProvider } from "../context/CartContext";
import { RouterProvider, useRouter } from "../context/RouterContext";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import CartSidebar from "../components/CartSidebar";
import Footer from "../components/Footer";
import HomePage from "../pages/HomePage";
import AboutPage from "../pages/AboutPage";
import ShopPage from "../pages/ShopPage";
import ProductPage from "../pages/ProductPage";
import CheckoutPage from "../pages/CheckoutPage";
import AuthPage from "../pages/AuthPage";
import AdminPage from "../pages/AdminPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AccountPage from "../pages/AccountPage";
import SuperAdminPage from "../pages/SuperAdminPage";
import { Toaster } from "sonner";
import { toast } from "sonner";
import { useEffect } from "react";

function PageRenderer() {
  const { page, productId } = useRouter();
  useEffect(() => { const notice = window.sessionStorage.getItem("pawfit-auth-notice"); if (notice) { window.sessionStorage.removeItem("pawfit-auth-notice"); toast.success(notice === "signed-out" ? "You've been signed out." : "Your session has ended. Please sign in again."); } }, [page]);

  if (page === "admin") return <AdminPage />;
  if (page === "superadmin") return <SuperAdminPage />;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <CartSidebar />
      <div className="flex-1">
        {page === "home" && <HomePage />}
        {page === "shop" && <ShopPage />}
        {page === "about" && <AboutPage />}
        {page === "product" && <ProductPage productId={productId ?? ""} />}
        {page === "checkout" && <CheckoutPage />}
        {page === "auth" && <AuthPage />}
        {page === "account" && <AccountPage />}
        {page === "verify-email" && <VerifyEmailPage />}
        {page === "reset-password" && <ResetPasswordPage />}
      </div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <RouterProvider>
      <AuthProvider>
        <CartProvider>
          <PageRenderer />
          <Toaster position="top-center" closeButton toastOptions={{ className: "border border-border bg-surface text-foreground" }} />
        </CartProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
