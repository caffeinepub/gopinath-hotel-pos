import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type { backendInterface } from "../backend";
import { useActor } from "../hooks/useActor";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  fetchMenuItems,
  insertMenuItem,
  deleteMenuItem as supabaseDeleteMenuItem,
  updateMenuItem as supabaseUpdateMenuItem,
} from "../lib/supabaseApi";

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
  isBackendEnabled: boolean;
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

function loadFromLocalStorage(): MenuItem[] {
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

function mapSupabaseRow(row: Record<string, unknown>): MenuItem {
  return {
    id: row.id as string,
    name: row.name as string,
    price: row.price as number,
    category: row.category as MenuCategory,
    imageUrl:
      (row.image_url as string) ||
      `https://placehold.co/200x150/FF6B00/white?text=${encodeURIComponent((row.name as string).slice(0, 6))}`,
    available: row.available !== false,
  };
}

function mapActorMenuItem(item: {
  id: bigint;
  name: string;
  price: bigint;
  category: string;
  imageUrl: string;
  available: boolean;
}): MenuItem {
  return {
    id: item.id.toString(),
    name: item.name,
    price: Number(item.price),
    category: item.category as MenuCategory,
    imageUrl:
      item.imageUrl ||
      `https://placehold.co/200x150/FF6B00/white?text=${encodeURIComponent(item.name.slice(0, 6))}`,
    available: item.available,
  };
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<MenuItem[]>(loadFromLocalStorage);
  const [loading, setLoading] = useState(false);
  const { actor } = useActor();
  const isSupabase = isSupabaseConfigured();

  // actor is primary, supabase is secondary, localStorage is fallback
  const isBackendEnabled = !!actor || isSupabase;

  const fetchFromActor = useCallback(async (currentActor: backendInterface) => {
    setLoading(true);
    try {
      const data = await currentActor.getMenu();
      if (data && data.length > 0) {
        const mapped = data.map(mapActorMenuItem);
        setItems(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
    } catch (e) {
      console.error("Failed to fetch menu from actor", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchFromSupabase = useCallback(async () => {
    if (!isSupabase) return;
    setLoading(true);
    try {
      const rawData = await fetchMenuItems();
      const data = Array.isArray(rawData)
        ? (rawData as Record<string, unknown>[])
        : null;
      if (data && data.length > 0) {
        const mapped = (data as Record<string, unknown>[]).map(mapSupabaseRow);
        setItems(mapped);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
      }
    } catch (e) {
      console.error(
        "Failed to fetch menu from Supabase, using localStorage",
        e,
      );
    } finally {
      setLoading(false);
    }
  }, [isSupabase]);

  useEffect(() => {
    if (actor) {
      fetchFromActor(actor);
    } else {
      fetchFromSupabase();
    }
  }, [actor, fetchFromActor, fetchFromSupabase]);

  // Sync to localStorage when using offline mode
  useEffect(() => {
    if (!isBackendEnabled) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items, isBackendEnabled]);

  const addItem = async (item: MenuItem) => {
    if (actor) {
      try {
        const result = await actor.addMenuItem(
          item.name,
          BigInt(item.price),
          item.category,
          item.imageUrl,
        );
        const mapped = mapActorMenuItem(result);
        setItems((prev) => [...prev, mapped]);
        return;
      } catch (e) {
        console.error("Actor addMenuItem failed, falling back", e);
      }
    }
    if (isSupabase) {
      try {
        await insertMenuItem({
          name: item.name,
          price: item.price,
          category: item.category,
          available: item.available !== false,
          image_url: item.imageUrl,
        });
        await fetchFromSupabase();
        return;
      } catch (e) {
        console.error("Supabase insertMenuItem failed, falling back", e);
      }
    }
    setItems((prev) => [
      ...prev,
      { ...item, available: item.available !== false },
    ]);
  };

  const deleteItem = async (id: string) => {
    if (actor) {
      try {
        await actor.deleteMenuItem(BigInt(id));
      } catch (e) {
        console.error("Actor deleteMenuItem failed", e);
      }
    } else if (isSupabase) {
      try {
        await supabaseDeleteMenuItem(id);
      } catch (e) {
        console.error("Supabase deleteMenuItem failed", e);
      }
    }
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const updateItem = async (updated: MenuItem) => {
    if (actor) {
      try {
        await actor.updateMenuItem(
          BigInt(updated.id),
          updated.name,
          BigInt(updated.price),
          updated.category,
          updated.imageUrl,
        );
      } catch (e) {
        console.error("Actor updateMenuItem failed", e);
      }
    } else if (isSupabase) {
      try {
        await supabaseUpdateMenuItem(updated.id, {
          name: updated.name,
          price: updated.price,
          category: updated.category,
          available: updated.available !== false,
          image_url: updated.imageUrl,
        });
      } catch (e) {
        console.error("Supabase updateMenuItem failed", e);
      }
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === updated.id
          ? { ...updated, available: updated.available !== false }
          : item,
      ),
    );
  };

  const toggleAvailability = async (id: string) => {
    const current = items.find((i) => i.id === id);
    const newAvailable = !(current?.available !== false);
    if (actor) {
      try {
        await actor.toggleAvailability(BigInt(id));
      } catch (e) {
        console.error("Actor toggleAvailability failed", e);
      }
    } else if (isSupabase) {
      try {
        await supabaseUpdateMenuItem(id, { available: newAvailable });
      } catch (e) {
        console.error("Supabase toggleAvailability failed", e);
      }
    }
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, available: newAvailable } : item,
      ),
    );
  };

  return (
    <MenuContext.Provider
      value={{
        items,
        loading,
        isBackendEnabled,
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
