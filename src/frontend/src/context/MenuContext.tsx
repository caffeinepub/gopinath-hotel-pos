import { createContext, useContext, useEffect, useState } from "react";

export type MenuCategory = "Veg" | "Non-Veg" | "Drinks" | "Snacks";

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: MenuCategory;
  imageUrl: string;
}

interface MenuContextValue {
  items: MenuItem[];
  addItem: (item: MenuItem) => void;
  deleteItem: (id: string) => void;
  updateItem: (item: MenuItem) => void;
}

const MenuContext = createContext<MenuContextValue | null>(null);

const SAMPLE_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Paneer Butter Masala",
    price: 180,
    category: "Veg",
    imageUrl: "https://placehold.co/200x150/FF6B00/white?text=Paneer",
  },
  {
    id: "2",
    name: "Chicken Biryani",
    price: 250,
    category: "Non-Veg",
    imageUrl: "https://placehold.co/200x150/FFA500/white?text=Biryani",
  },
  {
    id: "3",
    name: "Masala Chai",
    price: 40,
    category: "Drinks",
    imageUrl: "https://placehold.co/200x150/FF8C00/white?text=Chai",
  },
  {
    id: "4",
    name: "Veg Spring Rolls",
    price: 120,
    category: "Snacks",
    imageUrl: "https://placehold.co/200x150/FF6B00/white?text=Rolls",
  },
  {
    id: "5",
    name: "Mutton Curry",
    price: 320,
    category: "Non-Veg",
    imageUrl: "https://placehold.co/200x150/FFA500/white?text=Mutton",
  },
  {
    id: "6",
    name: "Mango Lassi",
    price: 80,
    category: "Drinks",
    imageUrl: "https://placehold.co/200x150/FF8C00/white?text=Lassi",
  },
];

const STORAGE_KEY = "gopinath_menu_items";

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : SAMPLE_ITEMS;
    } catch {
      return SAMPLE_ITEMS;
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = (item: MenuItem) => {
    setItems((prev) => [...prev, item]);
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = (updated: MenuItem) => {
    setItems((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item)),
    );
  };

  return (
    <MenuContext.Provider value={{ items, addItem, deleteItem, updateItem }}>
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const ctx = useContext(MenuContext);
  if (!ctx) throw new Error("useMenu must be used inside MenuProvider");
  return ctx;
}
