import { CartProvider } from "../context/CartContext";
import { RouterProvider, useRouter } from "../context/RouterContext";
import { AuthProvider } from "../context/AuthContext";
import Navbar from "../components/Navbar";
import CartSidebar from "../components/CartSidebar";
import Footer from "../components/Footer";
import HomePage from "../pages/HomePage";
import ShopPage from "../pages/ShopPage";
import ProductPage from "../pages/ProductPage";
import CheckoutPage from "../pages/CheckoutPage";
import AuthPage from "../pages/AuthPage";
import AdminPage from "../pages/AdminPage";
import VerifyEmailPage from "../pages/VerifyEmailPage";
import ResetPasswordPage from "../pages/ResetPasswordPage";
import AccountPage from "../pages/AccountPage";

function PageRenderer() {
  const { page, productId } = useRouter();

  if (page === "admin") return <AdminPage />;

  return (
    <div className="min-h-screen flex flex-col bg-background font-[Nunito,DM_Sans,sans-serif]">
      <Navbar />
      <CartSidebar />
      <div className="flex-1">
        {page === "home" && <HomePage />}
        {page === "shop" && <ShopPage />}
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
        </CartProvider>
      </AuthProvider>
    </RouterProvider>
  );
}
