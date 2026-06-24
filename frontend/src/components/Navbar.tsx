import { ShoppingBag, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useRouter } from "../context/RouterContext";
import pawfitLogo from "../assets/logo";

export default function Navbar() {
  const { count, openCart } = useCart();
  const { navigate, page } = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = [
    { label: "Home", page: "home" as const },
    { label: "Shop", page: "shop" as const },
  ];

  return (
    <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <button
          onClick={() => navigate("home")}
          className="flex items-center gap-2 shrink-0"
        >
          <img
            src={pawfitLogo}
            alt="PawFit"
            className="h-20 w-auto"
          />
        </button>

        <nav className="hidden sm:flex items-center gap-6">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              className={`text-sm font-semibold transition-colors ${
                page === link.page
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate("auth")}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <User size={16} />
            <span>Sign In</span>
          </button>

          <button
            onClick={openCart}
            className="relative flex items-center justify-center w-10 h-10 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
          >
            <ShoppingBag size={18} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-foreground text-background text-xs font-bold flex items-center justify-center">
                {count}
              </span>
            )}
          </button>

          <button
            className="sm:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="sm:hidden border-t border-border bg-background px-4 py-4 flex flex-col gap-3">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => { navigate(link.page); setMenuOpen(false); }}
              className={`text-left text-base font-semibold py-1 transition-colors ${
                page === link.page ? "text-primary" : "text-foreground"
              }`}
            >
              {link.label}
            </button>
          ))}
          <button
            onClick={() => { navigate("auth"); setMenuOpen(false); }}
            className="text-left text-base font-semibold py-1 text-muted-foreground"
          >
            Sign In
          </button>
        </div>
      )}
    </header>
  );
}
