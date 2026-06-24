import { useRouter } from "../context/RouterContext";
import pawfitLogo from "../assets/logo";

export default function Footer() {
  const { navigate } = useRouter();

  return (
    <footer className="border-t border-border bg-card mt-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <img
              src={pawfitLogo}
              alt="PawFit"
              className="h-15 w-auto mb-3"
            />
            <p className="text-sm text-muted-foreground leading-relaxed">
              Breed-specific dog apparel with 3D fit visualization. Based in the Philippines.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm text-foreground mb-3">Quick Links</h4>
            <ul className="flex flex-col gap-2">
              {[
                { label: "Home", page: "home" as const },
                { label: "Shop", page: "shop" as const },
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
            <h4 className="font-bold text-sm text-foreground mb-3">We Accept</h4>
            <div className="flex flex-wrap gap-2">
              {["GCash", "Maya", "Cash on Delivery"].map((method) => (
                <span
                  key={method}
                  className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-xs font-semibold"
                >
                  {method}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              &copy; {new Date().getFullYear()} PawFit. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
