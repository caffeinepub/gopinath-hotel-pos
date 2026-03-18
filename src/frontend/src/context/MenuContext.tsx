import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api";

export type MenuCategory =
  | "Veg"
  | "Non-Veg"
  | "Drinks"
  | "Snacks"
  | "Ice Cream";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
  available?: boolean;
}

interface MenuContextValue {
  items: MenuItem[];
  loading: boolean;
  addItem: (item: MenuItem) => void;
  deleteItem: (id: string) => void;
  updateItem: (item: MenuItem) => void;
  toggleAvailability: (id: string) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

const SAMPLE_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Paneer Butter Masala",
    price: 180,
    category: "Veg",
    imageUrl: "https://placehold.co/200x150/FF6B00/white?text=Paneer",
    available: true,
  },
  {
    id: "2",
    name: "Chicken Biryani",
    price: 250,
    category: "Non-Veg",
    imageUrl: "https://placehold.co/200x150/FFA500/white?text=Biryani",
    available: true,
  },
  {
    id: "3",
    name: "Masala Chai",
    price: 40,
    category: "Drinks",
    imageUrl: "https://placehold.co/200x150/FF8C00/white?text=Chai",
    available: true,
  },
  {
    id: "4",
    name: "Veg Spring Rolls",
    price: 120,
    category: "Snacks",
    imageUrl: "https://placehold.co/200x150/FF6B00/white?text=Rolls",
    available: true,
  },
  {
    id: "5",
    name: "Mutton Curry",
    price: 320,
    category: "Non-Veg",
    imageUrl: "https://placehold.co/200x150/FFA500/white?text=Mutton",
    available: true,
  },
  {
    id: "6",
    name: "Mango Lassi",
    price: 80,
    category: "Drinks",
    imageUrl: "https://placehold.co/200x150/FF8C00/white?text=Lassi",
    available: true,
  },
  {
    id: "7",
    name: "Vanilla Ice Cream",
    price: 60,
    category: "Ice Cream",
    imageUrl: "https://placehold.co/200x150/FFB6C1/white?text=IceCream",
    available: true,
  },
];

const STORAGE_KEY = "gopinath_menu_items";

function placeholderImage(name: string): string {
  return `https://placehold.co/200x150/FF6B00/white?text=${encodeURIComponent(name.substring(0, 6))}`;
}

function persistToLS(items: MenuItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function loadFromLS(): MenuItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed: MenuItem[] = JSON.parse(stored);
      return parsed.map((item) => ({
        ...item,
        available: item.available !== false,
      }));
    }
  } catch {
    // ignore
  }
  return SAMPLE_ITEMS;
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>(loadFromLS);
  const [loading, setLoading] = useState(false);

  // Load from canister on mount
  useEffect(() => {
    setLoading(true);
    api
      .getMenu()
      .then((remoteItems) => {
        if (remoteItems.length > 0) {
          const mapped: MenuItem[] = remoteItems.map((r) => ({
            id: r.id,
            name: r.name,
            price: r.price,
            category: r.category as MenuCategory,
            available: r.available,
            imageUrl: placeholderImage(r.name),
          }));
          setItems(mapped);
          persistToLS(mapped);
        }
      })
      .catch(() => {
        // keep localStorage fallback
      })
      .finally(() => setLoading(false));
  }, []);

  const addItem = (item: MenuItem) => {
    const localItem: MenuItem = {
      ...item,
      available: item.available !== false,
    };
    setItems((prev) => {
      const next = [...prev, localItem];
      persistToLS(next);
      return next;
    });
    // Persist to canister and replace temp id with canonical id
    api
      .addMenuItem(item.name, item.price, item.category)
      .then((canonicalId) => {
        setItems((prev) => {
          const next = prev.map((i) =>
            i.id === localItem.id ? { ...i, id: canonicalId } : i,
          );
          persistToLS(next);
          return next;
        });
      })
      .catch(() => {
        // Keep local item as-is
      });
  };

  const deleteItem = (id: string) => {
    api.deleteMenuItem(id).catch(() => {});
    setItems((prev) => {
      const next = prev.filter((item) => item.id !== id);
      persistToLS(next);
      return next;
    });
  };

  const updateItem = (updated: MenuItem) => {
    api
      .updateMenuItem(updated.id, updated.name, updated.price, updated.category)
      .catch(() => {});
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === updated.id
          ? { ...updated, available: updated.available !== false }
          : item,
      );
      persistToLS(next);
      return next;
    });
  };

  const toggleAvailability = (id: string) => {
    api.toggleAvailability(id).catch(() => {});
    setItems((prev) => {
      const next = prev.map((item) =>
        item.id === id
          ? { ...item, available: !(item.available !== false) }
          : item,
      );
      persistToLS(next);
      return next;
    });
  };

  return (
    <MenuContext.Provider
      value={{
        items,
        loading,
        addItem,
        deleteItem,
        updateItem,
        toggleAvailability,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside MenuProvider");
  return ctx;
}
