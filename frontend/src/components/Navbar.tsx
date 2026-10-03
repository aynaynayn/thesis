import { Search, ShoppingBag, UserRound, X, Menu } from "lucide-react";
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
  const [searchOpen, setSearchOpen] = useState(false);
  const navLinks = [
    { label: "Home", page: "home" as const },
    { label: "Shop", page: "shop" as const },
    { label: "About", page: "about" as const },
  ];
  const accountPage = user
    ? user.role === "admin"
      ? "admin"
      : "account"
    : "auth";
  return (
    <>
      <div className="announcement-marquee overflow-hidden border-b border-foreground bg-foreground py-2 text-background" aria-label="PawFit announcement"><div className="announcement-track"><span>Made for real dogs, measured for real life&nbsp;&nbsp;&nbsp; Free delivery on orders over PHP 2,000&nbsp;&nbsp;&nbsp;</span><span aria-hidden="true">Made for real dogs, measured for real life&nbsp;&nbsp;&nbsp; Free delivery on orders over PHP 2,000&nbsp;&nbsp;&nbsp;</span><span aria-hidden="true">Made for real dogs, measured for real life&nbsp;&nbsp;&nbsp; Free delivery on orders over PHP 2,000&nbsp;&nbsp;&nbsp;</span><span aria-hidden="true">Made for real dogs, measured for real life&nbsp;&nbsp;&nbsp; Free delivery on orders over PHP 2,000&nbsp;&nbsp;&nbsp;</span></div></div>
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <button onClick={() => navigate("home")} className="shrink-0" aria-label="PawFit home">
          <img src={pawfitLogo} alt="PawFit" className="h-10 w-auto" />
        </button>
        <nav className="hidden items-center gap-7 md:flex">
          {navLinks.map((link) => (
            <button
              key={link.page}
              onClick={() => navigate(link.page)}
              className={`text-xs font-bold uppercase tracking-[0.14em] ${page === link.page ? "text-primary" : "text-foreground hover:text-primary"}`}
            >
              {link.label}
            </button>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            aria-label="Search products"
            onClick={() => setSearchOpen(true)}
            className="p-2 text-foreground hover:text-primary"
          ><Search size={18} /></button>
          <button
            onClick={() => navigate(accountPage)}
            className={`hidden p-2 sm:block ${page === "account" ? "text-accent" : "text-foreground hover:text-primary"}`} aria-label={user ? "Open account" : "Sign in"}
          ><UserRound size={18} /></button>
          <button
            onClick={openCart}
            className="relative p-2 text-foreground hover:text-primary" aria-label={`Open cart, ${count} items`}
          ><ShoppingBag size={18} />{count > 0 && <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[9px] font-bold text-primary-foreground">{count}</span>}</button>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-2 text-foreground md:hidden" aria-label={menuOpen ? "Close menu" : "Open menu"}
          >{menuOpen ? <X size={20} /> : <Menu size={20} />}</button>
        </div>
      </div>
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 py-5 md:hidden">
          <nav className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <button
                key={link.page}
                onClick={() => {
                  navigate(link.page);
                  setMenuOpen(false);
                }}
                className="text-left text-xs font-bold uppercase tracking-[0.14em]"
              >
                {link.label}
              </button>
            ))}
            <button
              onClick={() => {
                navigate(accountPage);
                setMenuOpen(false);
              }}
              className="text-left text-xs font-bold uppercase tracking-[0.14em]"
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
      {searchOpen && <div className="fixed inset-0 z-50 bg-background p-5"><div className="mx-auto flex max-w-3xl items-center gap-3"><Search size={20} /><input autoFocus placeholder="Search the collection" onKeyDown={(event) => { if (event.key === "Enter") { navigate("shop"); setSearchOpen(false); } }} className="flex-1 border-b border-foreground bg-transparent py-3 text-lg outline-none" /><button onClick={() => setSearchOpen(false)} aria-label="Close search"><X size={22} /></button></div></div>}
    </>
  );
}
