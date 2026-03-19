import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { toast } from "sonner";
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
  mutating: boolean;
  addItem: (item: Omit<MenuItem, "id">) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  updateItem: (item: MenuItem) => Promise<void>;
  toggleAvailability: (id: string) => Promise<void>;
  refetch: () => Promise<MenuItem[]>;
}

const MenuContext = createContext<MenuContextValue | null>(null);

const STORAGE_KEY = "gopinath_menu_cache";

function placeholderImage(name: string): string {
  return `https://placehold.co/200x150/FF6B00/white?text=${encodeURIComponent(name.substring(0, 6))}`;
}

function mapRemoteItem(r: {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
}): MenuItem {
  return {
    id: r.id,
    name: r.name,
    price: r.price,
    category: r.category as MenuCategory,
    available: r.available,
    imageUrl: placeholderImage(r.name),
  };
}

function persistToLS(items: MenuItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

function loadCacheFromLS(): MenuItem[] {
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
  return [];
}

export function MenuProvider({ children }: { children: React.ReactNode }) {
  // Start with cached data for fast initial render, but always refetch from canister
  const [items, setItems] = useState<MenuItem[]>(loadCacheFromLS);
  const [loading, setLoading] = useState(true);
  const [mutating, setMutating] = useState(false);

  const fetchFromCanister = useCallback(async () => {
    try {
      const remoteItems = await api.getMenu();
      const mapped = remoteItems.map(mapRemoteItem);
      setItems(mapped);
      persistToLS(mapped);
      return mapped;
    } catch (e) {
      console.error("[MenuContext] getMenu failed", e);
      throw e;
    }
  }, []);

  // On mount: always load from canister (single source of truth)
  useEffect(() => {
    setLoading(true);
    fetchFromCanister()
      .catch(() => {
        // keep cached data as fallback
      })
      .finally(() => setLoading(false));
  }, [fetchFromCanister]);

  const addItem = async (item: Omit<MenuItem, "id">) => {
    setMutating(true);
    try {
      await api.addMenuItem(item.name, item.price, item.category);
      await fetchFromCanister();
      toast.success(`"${item.name}" added to menu!`);
    } catch (e) {
      console.error("[MenuContext] addItem failed", e);
      toast.error("Failed to save item. Please try again.");
      throw e;
    } finally {
      setMutating(false);
    }
  };

  const deleteItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    setMutating(true);
    try {
      await api.deleteMenuItem(id);
      await fetchFromCanister();
      toast.success(`"${item?.name ?? "Item"}" removed from menu.`);
    } catch (e) {
      console.error("[MenuContext] deleteItem failed", e);
      toast.error("Failed to delete item. Please try again.");
      throw e;
    } finally {
      setMutating(false);
    }
  };

  const updateItem = async (updated: MenuItem) => {
    setMutating(true);
    try {
      await api.updateMenuItem(
        updated.id,
        updated.name,
        updated.price,
        updated.category,
      );
      await fetchFromCanister();
      toast.success(`"${updated.name}" updated!`);
    } catch (e) {
      console.error("[MenuContext] updateItem failed", e);
      toast.error("Failed to update item. Please try again.");
      throw e;
    } finally {
      setMutating(false);
    }
  };

  const toggleAvailability = async (id: string) => {
    setMutating(true);
    try {
      await api.toggleAvailability(id);
      await fetchFromCanister();
    } catch (e) {
      console.error("[MenuContext] toggleAvailability failed", e);
      toast.error("Failed to update availability. Please try again.");
      throw e;
    } finally {
      setMutating(false);
    }
  };

  return (
    <MenuContext.Provider
      value={{
        items,
        loading,
        mutating,
        addItem,
        deleteItem,
        updateItem,
        toggleAvailability,
        refetch: fetchFromCanister,
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
