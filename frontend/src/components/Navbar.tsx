import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "../context/RouterContext";
import { useAuth } from "../context/AuthContext";
import pawfitLogo from "../assets/logo";

export default function Navbar() {
  const { count, openCart } = useCart();
  const { navigate, page } = useRouter();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navLinks = [
    { label: "Home", page: "home" as const },
    { label: "Shop", page: "shop" as const },
  ];
  const accountPage = user
    ? user.role === "admin"
      ? "admin"
      : "account"
    : "auth";
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <button onClick={() => navigate("home")} className="shrink-0">
          <img src={pawfitLogo} alt="PawFit" className="h-25 w-auto" />
        </button>
        <nav className="hidden items-center gap-7 sm:flex">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              className={`border-b pb-0.5 test-base font-bold uppercase tracking-[0.14em] ${page === link.page ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(accountPage)}
            className="hidden test-base font-bold uppercase tracking-[0.12em] text-muted-foreground hover:text-foreground sm:block"
          >
            {user ? user.name : "Sign in"}
          </button>
          <button
            onClick={openCart}
            className=" border-foreground test-base font-bold uppercase tracking-[0.12em] text-muted-foreground"
          >
            Cart {count ? `(${count})` : ""}
          </button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="border-b border-foreground pb-0.5 test-base font-bold uppercase tracking-[0.12em] sm:hidden"
          >
            {menuOpen ? "Close" : "Menu"}
          </button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-5 sm:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  navigate(link.page);
                  setMenuOpen(false);
                }}
                className="text-left text-sm font-bold uppercase tracking-[0.12em]"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate(accountPage);
                setMenuOpen(false);
              }}
              className="text-left text-sm font-bold uppercase tracking-[0.12em]"
            >
              {user ? user.name : "Sign in"}
            </button>
            {user && (
              <button
                onClick={() => {
                  void logout().finally(() => {
                    navigate("home");
                    setMenuOpen(false);
                  });
                }}
                className="text-left text-sm text-muted-foreground"
              >
                Sign out
              </button>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
