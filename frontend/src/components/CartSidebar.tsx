import { X, Trash2, ShoppingBag, Plus, Minus } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useRouter } from "../context/RouterContext";

export default function CartSidebar() {
  const { isOpen, closeCart, items, removeItem, updateQuantity, total, clearCart } = useCart();
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
        className={`fixed top-0 right-0 h-full w-full max-w-sm z-50 bg-card shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-primary" />
            <h2 className="font-bold text-lg text-foreground">Your Cart</h2>
          </div>
          <button
            onClick={closeCart}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center px-6">
            <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
              <ShoppingBag size={32} className="text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">Your cart is empty</p>
            <button
              onClick={() => { navigate("shop"); closeCart(); }}
              className="px-5 py-2.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Browse Products
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-4">
              {items.map((item) => (
                <div
                  key={`${item.product.id}-${item.size}`}
                  className="flex gap-3"
                >
                  <div className="w-20 h-20 rounded-xl overflow-hidden bg-muted shrink-0">
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
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity - 1)}
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
                      >
                        <Minus size={12} />
                      </button>
                      <span className="text-sm font-semibold w-5 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.size, item.quantity + 1)}
                        className="w-6 h-6 rounded-full bg-muted flex items-center justify-center hover:bg-border transition-colors"
                      >
                        <Plus size={12} />
                      </button>
                    </div>
                  </div>
                  <button
                    onClick={() => removeItem(item.product.id, item.size)}
                    className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 size={14} />
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
                className="w-full py-3 rounded-full bg-primary text-primary-foreground font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Proceed to Checkout
              </button>
              <button
                onClick={() => { navigate("shop"); closeCart(); }}
                className="w-full py-2.5 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Continue Shopping
              </button>
              <button
                onClick={clearCart}
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
