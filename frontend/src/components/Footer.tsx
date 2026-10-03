import { useRouter } from "../context/RouterContext";
import pawfitLogo from "../assets/logo";

export default function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="mt-16 border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <img
              src={pawfitLogo}
              alt="PawFit"
              className="mb-3 h-12 w-auto"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Breed-specific dog apparel with 3D fit visualization. Based in the Philippines.
            </p>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground">Shop</h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Home", page: "home" as const },
                { label: "Shop", page: "shop" as const },
                { label: "About", page: "about" as const },
                { label: "My Account", page: "account" as const },
              ].map((link) => (
                <li key={link.page}>
                  <button
                    onClick={() => navigate(link.page)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground">Help</h4>
            <div className="flex flex-wrap gap-2">
              {["Shipping & Returns", "Sizing guide", "Contact", "Privacy"].map((method) => (
                <span
                  key={method}
                  className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold"
                >
                  {method}
                </span>
              ))}
            </div>
          </div>
          <div><h4 className="mb-3 text-xs font-bold uppercase tracking-[0.14em] text-foreground">Stay in the loop</h4><p className="text-sm leading-6 text-muted-foreground">New drops, practical fit notes, and the occasional treat.</p><div className="mt-4 flex border-b border-foreground"><input aria-label="Email for newsletter" placeholder="Your email" className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none" /><button className="text-xs font-bold uppercase tracking-[0.12em]">Join</button></div></div>
        </div>
        <p className="mt-12 border-t border-border pt-5 text-xs text-muted-foreground">&copy; {new Date().getFullYear()} PawFit. All rights reserved.</p>
      </div>
    </footer>
  );
}
