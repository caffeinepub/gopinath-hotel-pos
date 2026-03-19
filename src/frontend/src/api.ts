import { Actor, HttpAgent } from "@icp-sdk/core/agent";
import { loadConfig } from "./config";
import { idlFactory } from "./declarations/backend.did";
import type {
  Analytics,
  MenuItem,
  OrderItem,
  Settings,
  _SERVICE,
} from "./declarations/backend.did";

export type { MenuItem, OrderItem, Analytics, Settings };

let _actorInstance: _SERVICE | null = null;

async function getRawActor(): Promise<_SERVICE> {
  if (_actorInstance) return _actorInstance;
  const config = await loadConfig();
  const agent = new HttpAgent({ host: config.backend_host });
  if (config.backend_host?.includes("localhost")) {
    await agent.fetchRootKey().catch(console.error);
  }
  _actorInstance = Actor.createActor<_SERVICE>(idlFactory, {
    agent,
    canisterId: config.backend_canister_id,
  }) as unknown as _SERVICE;
  return _actorInstance;
}

export const api = {
  // Menu -- raw throws on error (for proper error handling in context)
  getMenuRaw: async (): Promise<MenuItem[]> => {
    const a = await getRawActor();
    const result = await a.getMenu();
    console.log("[api.getMenuRaw] returned", result.length, "items");
    return result;
  },
  // Menu -- safe version for one-off calls
  getMenu: async (): Promise<MenuItem[]> => {
    try {
      const a = await getRawActor();
      const result = await a.getMenu();
      console.log("[api.getMenu] returned", result.length, "items");
      return result;
    } catch (e) {
      console.error("[api.getMenu] error:", e);
      return [];
    }
  },
  addMenuItem: async (
    name: string,
    price: number,
    category: string,
  ): Promise<string> => {
    console.log(
      "[api.addMenuItem] name:",
      name,
      "price:",
      price,
      "category:",
      category,
    );
    const a = await getRawActor();
    const id = await a.addMenuItem(name, price, category);
    console.log("[api.addMenuItem] saved with id:", id);
    return id;
  },
  updateMenuItem: async (
    id: string,
    name: string,
    price: number,
    category: string,
  ): Promise<boolean> => {
    console.log("[api.updateMenuItem] id:", id, "name:", name);
    const a = await getRawActor();
    const ok = await a.updateMenuItem(id, name, price, category);
    console.log("[api.updateMenuItem] result:", ok);
    return ok;
  },
  deleteMenuItem: async (id: string): Promise<boolean> => {
    console.log("[api.deleteMenuItem] id:", id);
    const a = await getRawActor();
    const ok = await a.deleteMenuItem(id);
    console.log("[api.deleteMenuItem] result:", ok);
    return ok;
  },
  toggleAvailability: async (id: string): Promise<boolean> => {
    console.log("[api.toggleAvailability] id:", id);
    const a = await getRawActor();
    const ok = await a.toggleAvailability(id);
    console.log("[api.toggleAvailability] result:", ok);
    return ok;
  },
  // Orders
  createOrder: async (
    items: OrderItem[],
    total: number,
    paymentMode: string,
  ): Promise<string> => {
    console.log(
      "[api.createOrder] items:",
      items.length,
      "total:",
      total,
      "mode:",
      paymentMode,
    );
    const a = await getRawActor();
    const id = await a.createOrder(items, total, paymentMode);
    console.log("[api.createOrder] order id:", id);
    return id;
  },
  // Payments
  startPayment: async (orderId: string, amount: number): Promise<string> => {
    console.log("[api.startPayment] orderId:", orderId, "amount:", amount);
    const a = await getRawActor();
    const id = await a.startPayment(orderId, amount);
    console.log("[api.startPayment] payment id:", id);
    return id;
  },
  getPaymentStatus: async (orderId: string): Promise<string> => {
    const a = await getRawActor();
    return a.getPaymentStatus(orderId);
  },
  confirmPayment: async (orderId: string): Promise<boolean> => {
    console.log("[api.confirmPayment] orderId:", orderId);
    const a = await getRawActor();
    const ok = await a.confirmPayment(orderId);
    console.log("[api.confirmPayment] result:", ok);
    return ok;
  },
  // Analytics
  getAnalytics: async (): Promise<Analytics> => {
    try {
      const a = await getRawActor();
      return await a.getAnalytics();
    } catch (e) {
      console.error("[api.getAnalytics]", e);
      return { todaySales: 0, todayOrders: BigInt(0), topItem: "" };
    }
  },
  // Settings
  getSettings: async (): Promise<Settings> => {
    try {
      const a = await getRawActor();
      return await a.getSettings();
    } catch (e) {
      console.error("[api.getSettings]", e);
      return { upiId: "", accountName: "" };
    }
  },
  saveSettings: async (
    upiId: string,
    accountName: string,
  ): Promise<boolean> => {
    try {
      console.log("[api.saveSettings] upiId:", upiId);
      const a = await getRawActor();
      const ok = await a.saveSettings(upiId, accountName);
      console.log("[api.saveSettings] result:", ok);
      return ok;
    } catch (e) {
      console.error("[api.saveSettings]", e);
      return false;
    }
  },
};
