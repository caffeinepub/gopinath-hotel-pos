import type { MenuItem as BackendMenuItem } from "../backend.d";
import type { MenuCategory, MenuItem } from "../context/MenuContext";
import { useActor } from "../hooks/useActor";

function mapBackendMenuItem(item: BackendMenuItem): MenuItem {
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

export function useActorApi() {
  const { actor, isFetching } = useActor();

  const getMenu = async (): Promise<MenuItem[]> => {
    if (!actor) throw new Error("Actor not ready");
    const items = await actor.getMenu();
    return items.map(mapBackendMenuItem);
  };

  const addMenuItem = async (
    name: string,
    price: number,
    category: string,
    imageUrl: string,
  ): Promise<MenuItem> => {
    if (!actor) throw new Error("Actor not ready");
    const item = await actor.addMenuItem(
      name,
      BigInt(price),
      category,
      imageUrl,
    );
    return mapBackendMenuItem(item);
  };

  const updateMenuItem = async (
    id: string,
    name: string,
    price: number,
    category: string,
    imageUrl: string,
  ): Promise<MenuItem> => {
    if (!actor) throw new Error("Actor not ready");
    const item = await actor.updateMenuItem(
      BigInt(id),
      name,
      BigInt(price),
      category,
      imageUrl,
    );
    return mapBackendMenuItem(item);
  };

  const deleteMenuItem = async (id: string): Promise<void> => {
    if (!actor) throw new Error("Actor not ready");
    await actor.deleteMenuItem(BigInt(id));
  };

  const toggleAvailability = async (id: string): Promise<void> => {
    if (!actor) throw new Error("Actor not ready");
    await actor.toggleAvailability(BigInt(id));
  };

  const login = async (pin: string): Promise<[string, string]> => {
    if (!actor) throw new Error("Actor not ready");
    return actor.login(pin);
  };

  const createOrder = async (
    itemsJson: string,
    total: number,
    paymentMode: string,
  ): Promise<bigint> => {
    if (!actor) throw new Error("Actor not ready");
    return actor.createOrder(itemsJson, BigInt(total), paymentMode);
  };

  const startPayment = async (
    orderId: bigint,
    amount: number,
    upiId: string,
  ): Promise<string> => {
    if (!actor) throw new Error("Actor not ready");
    return actor.startPayment(orderId, BigInt(amount), upiId);
  };

  const getPaymentStatus = async (orderId: bigint): Promise<string> => {
    if (!actor) throw new Error("Actor not ready");
    return actor.getPaymentStatus(orderId);
  };

  const confirmPayment = async (orderId: bigint): Promise<void> => {
    if (!actor) throw new Error("Actor not ready");
    await actor.confirmPayment(orderId);
  };

  const getAnalytics = async () => {
    if (!actor) throw new Error("Actor not ready");
    const result = await actor.getAnalytics();
    return {
      todaySales: Number(result.todaySales),
      totalOrders: Number(result.totalOrders),
      topItem: result.topItem ?? "",
    };
  };

  return {
    actor,
    isFetching,
    getMenu,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    toggleAvailability,
    login,
    createOrder,
    startPayment,
    getPaymentStatus,
    confirmPayment,
    getAnalytics,
  };
}
