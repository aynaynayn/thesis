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
import { Toaster } from "sonner";

function PageRenderer() {
  const { page, productId } = useRouter();

  if (page === "admin") return <AdminPage />;

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
      <NewsletterModal />
    </div>
  );
}

function NewsletterModal() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (window.sessionStorage.getItem("pawfit-newsletter-seen")) return;
    const timer = window.setTimeout(() => setOpen(true), 1800);
    return () => window.clearTimeout(timer);
  }, []);
  const close = () => {
    window.sessionStorage.setItem("pawfit-newsletter-seen", "true");
    setOpen(false);
  };
  if (!open) return null;
  return <div className="fixed inset-0 z-50 grid place-items-center bg-black/35 p-4" role="dialog" aria-modal="true" aria-labelledby="newsletter-title"><div className="relative w-full max-w-md bg-card p-8 shadow-2xl"><button onClick={close} className="absolute right-4 top-4 text-xs font-bold uppercase tracking-[0.12em] text-muted-foreground" aria-label="Close newsletter sign up">Close</button><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-muted-foreground">PawFit friends</p><h2 id="newsletter-title" className="mt-3 text-4xl text-foreground">A little something for your first order.</h2><p className="mt-3 text-sm leading-6 text-muted-foreground">Sign up for fit notes and a welcome discount.</p><div className="mt-6 flex border-b border-foreground"><input aria-label="Email for newsletter" type="email" placeholder="Your email" className="min-w-0 flex-1 bg-transparent py-3 text-sm outline-none" /><button onClick={close} className="text-xs font-bold uppercase tracking-[0.12em]">Join</button></div><button onClick={close} className="mt-5 text-xs text-muted-foreground underline underline-offset-4">No, thank you</button></div></div>;
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
import { useEffect, useState } from "react";
