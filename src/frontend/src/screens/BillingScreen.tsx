import { Minus, Plus, Search, ShoppingCart, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Screen } from "../App";
import { Footer } from "../components/Footer";
import { GlowButton } from "../components/GlowButton";
import { HeaderClock } from "../components/HeaderClock";
import { type MenuItem, useMenu } from "../context/MenuContext";
import type { CartItem } from "../types/payment";

interface BillingScreenProps {
  onNavigate: (screen: Screen) => void;
  onCheckout: (cart: CartItem[]) => void;
  darkMode: boolean;
}

const categoryColors: Record<string, string> = {
  Veg: "bg-green-100 text-green-700",
  "Non-Veg": "bg-red-100 text-red-700",
  Drinks: "bg-blue-100 text-blue-700",
  Snacks: "bg-yellow-100 text-yellow-700",
  "Ice Cream": "bg-pink-100 text-pink-700",
};

export function BillingScreen({
  onNavigate: _onNavigate,
  onCheckout,
  darkMode,
}: BillingScreenProps) {
  const { items } = useMenu();
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");

  const filteredItems = items.filter(
    (item) =>
      item.available !== false &&
      item.name.toLowerCase().includes(search.toLowerCase()),
  );

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((c) => c.item.id === item.id);
      if (existing) {
        return prev.map((c) =>
          c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c,
        );
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((c) => (c.item.id === id ? { ...c, qty: c.qty + delta } : c))
        .filter((c) => c.qty > 0),
    );
  };

  const total = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const totalItems = cart.reduce((s, c) => s + c.qty, 0);

  const handleCheckout = () => {
    if (cart.length === 0) {
      toast.error("Cart is empty!");
      return;
    }
    onCheckout(cart);
  };

  const bg = darkMode ? "bg-gray-900" : "bg-gray-50";
  const text = darkMode ? "text-white" : "text-gray-800";
  const subText = darkMode ? "text-gray-400" : "text-gray-500";
  const headerBg = darkMode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-gray-100";
  const inputBg = darkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-200 text-gray-800 placeholder-gray-400";

  return (
    <div className={`flex-1 flex flex-col ${bg}`}>
      {/* Header */}
      <header
        className={`${headerBg} border-b px-6 py-0 sticky top-0 z-10 shadow-sm`}
      >
        <div className="flex items-center h-16">
          <div className="flex-1" />
          <h1 className={`font-bold text-xl tracking-wider ${text}`}>Bill</h1>
          <div className="flex-1 flex justify-end">
            <HeaderClock darkMode={darkMode} />
          </div>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 -mx-6" />
      </header>

      {/* Body */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Menu Items - Left */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search menu items..."
              data-ocid="billing.search.search_input"
              className={`w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors ${inputBg}`}
            />
          </div>

          <h2
            className={`font-semibold text-sm uppercase tracking-wide mb-3 ${subText}`}
          >
            Menu Items
          </h2>

          {filteredItems.length === 0 ? (
            <div
              data-ocid="billing.menu.empty_state"
              className={`text-center py-16 ${subText}`}
            >
              {search
                ? "No items match your search."
                : "No menu items. Add items in Menu tab."}
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
              {filteredItems.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => addToCart(item)}
                  data-ocid={`billing.menu.item.${idx + 1}`}
                  className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden text-left hover:shadow-md hover:border-orange-300 active:scale-[0.97] transition-all duration-150 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
                >
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-full aspect-[4/3] object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        `https://placehold.co/200x150/FF6B00/white?text=${encodeURIComponent(item.name.slice(0, 8))}`;
                    }}
                  />
                  <div className="p-2">
                    <p
                      className={`font-semibold text-xs leading-tight ${text}`}
                    >
                      {item.name}
                    </p>
                    <span
                      className={`inline-block text-xs px-1.5 py-0.5 rounded-full mt-1 font-medium ${categoryColors[item.category] ?? "bg-gray-100 text-gray-600"}`}
                    >
                      {item.category}
                    </span>
                    <p className="text-green-600 font-bold text-sm mt-1">
                      ₹{item.price}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cart - Right */}
        <div className="md:w-96 lg:w-[420px] bg-white border border-gray-200 rounded-l-2xl shadow-sm flex flex-col md:border-t-0 border-t">
          {/* Cart Header */}
          <div className="p-4 border-b border-gray-200">
            <h2 className={`font-bold text-lg flex items-center gap-2 ${text}`}>
              <ShoppingCart className="w-5 h-5 text-orange-500" />
              Cart
              {totalItems > 0 && (
                <span className="text-orange-500 font-bold">
                  ({totalItems})
                </span>
              )}
            </h2>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {cart.length === 0 ? (
              <div
                data-ocid="billing.cart.empty_state"
                className={`text-center py-12 ${subText}`}
              >
                <ShoppingCart className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p className="text-sm">No items added yet.</p>
                <p className="text-xs mt-1">Tap menu items to add to cart.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {cart.map((c, idx) => (
                  <div
                    key={c.item.id}
                    data-ocid={`billing.cart.item.${idx + 1}`}
                    className="flex items-center gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold text-sm truncate ${text}`}>
                        {c.item.name}
                      </p>
                      <p className={`text-xs ${subText}`}>
                        ₹{c.item.price} each
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateQty(c.item.id, -1)}
                        data-ocid={`billing.cart.minus.${idx + 1}`}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                          darkMode
                            ? "bg-gray-700 hover:bg-gray-600"
                            : "bg-gray-100 hover:bg-orange-100"
                        }`}
                      >
                        {c.qty === 1 ? (
                          <Trash2 className="w-3.5 h-3.5 text-red-500" />
                        ) : (
                          <Minus
                            className={`w-3.5 h-3.5 ${
                              darkMode ? "text-gray-300" : "text-gray-600"
                            }`}
                          />
                        )}
                      </button>
                      <span
                        className={`w-6 text-center text-sm font-bold ${text}`}
                      >
                        {c.qty}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQty(c.item.id, 1)}
                        data-ocid={`billing.cart.plus.${idx + 1}`}
                        className="w-7 h-7 rounded-lg bg-orange-500 hover:bg-orange-600 flex items-center justify-center transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                    <p className="w-16 text-right font-bold text-green-600 text-sm">
                      ₹{c.item.price * c.qty}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-4 border-t border-gray-200 space-y-3">
            <div className={`flex justify-between font-bold ${text}`}>
              <span>Total Amount</span>
              <span className="text-green-600 text-lg">₹{total}</span>
            </div>
            <GlowButton
              onClick={handleCheckout}
              data-ocid="billing.checkout.primary_button"
              className="mt-2 text-lg font-bold"
            >
              Checkout
            </GlowButton>
          </div>
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
