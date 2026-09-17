import { useCart } from "../context/CartContext";
import { useRouter } from "../context/RouterContext";

export default function CartSidebar() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, total, clearCart, error } = useCart();
  const { navigate } = useRouter();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-50"
          onClick={closeCart}
        />
      )}

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 border-l border-border bg-card flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Bag / {items.length} items</p>
          <button
            onClick={closeCart}
            className="border-b border-foreground pb-0.5 text-xs font-bold uppercase tracking-[0.12em] hover:text-primary"
            aria-label="Close bag"
          >
            Close
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-start justify-center gap-4 px-6">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Nothing selected</p>
            <p className="font-serif text-4xl leading-none text-foreground">Your bag is empty.</p>
            <button
              onClick={() => { navigate("shop"); closeCart(); }}
              className="border-b border-primary pb-1 text-xs font-bold uppercase tracking-[0.12em] text-primary"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3"
                >
                  <div className="w-20 h-20 overflow-hidden bg-muted shrink-0">
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-foreground truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.breed} · Size {item.size}
                    </p>
                    <p className="text-sm font-bold text-primary mt-1">
                      ₱{(item.product.price * item.quantity).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <button
                        onClick={() => void updateQuantity(item.id, item.quantity - 1)}
                        className="h-7 w-7 border border-border text-sm hover:bg-muted"
                        aria-label={`Decrease ${item.product.name} quantity`}
                      >
                        −
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => void updateQuantity(item.id, item.quantity + 1)}
                        className="h-7 w-7 border border-border text-sm hover:bg-muted"
                        aria-label={`Increase ${item.product.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => void removeItem(item.id)}
                    className="shrink-0 border-b border-transparent pb-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground hover:border-destructive hover:text-destructive"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <div className="border-t border-border px-5 py-5 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground text-sm">Subtotal</span>
                <span className="font-bold text-lg text-foreground">
                  ₱{total.toLocaleString()}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Shipping calculated at checkout
              </p>
              <button
                onClick={() => { navigate("checkout"); closeCart(); }}
                className="w-full border border-primary bg-primary py-3 text-xs font-bold uppercase tracking-[0.12em] text-primary-foreground"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => { navigate("shop"); closeCart(); }}
                className="w-full border border-border py-3 text-xs font-bold uppercase tracking-[0.12em] text-foreground hover:bg-muted"
              >
                Continue Shopping
              </button>
              {error && <p className="text-xs text-destructive">{error}</p>}
              <button
                onClick={() => void clearCart()}
                className="text-xs text-muted-foreground hover:text-destructive transition-colors text-center"
              >
                Clear cart
              </button>
            </div>
          </>
        )}
      </aside>
    </>
  );
}
