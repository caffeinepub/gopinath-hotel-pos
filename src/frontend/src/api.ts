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
  // Menu
  getMenu: async (): Promise<MenuItem[]> => {
    try {
      const a = await getRawActor();
      return await a.getMenu();
    } catch (e) {
      console.error("[api.getMenu]", e);
      return [];
    }
  },
  addMenuItem: async (
    name: string,
    price: number,
    category: string,
  ): Promise<string> => {
    const a = await getRawActor();
    return a.addMenuItem(name, price, category);
  },
  updateMenuItem: async (
    id: string,
    name: string,
    price: number,
    category: string,
  ): Promise<boolean> => {
    const a = await getRawActor();
    return a.updateMenuItem(id, name, price, category);
  },
  deleteMenuItem: async (id: string): Promise<boolean> => {
    const a = await getRawActor();
    return a.deleteMenuItem(id);
  },
  toggleAvailability: async (id: string): Promise<boolean> => {
    const a = await getRawActor();
    return a.toggleAvailability(id);
  },
  // Orders
  createOrder: async (
    items: OrderItem[],
    total: number,
    paymentMode: string,
  ): Promise<string> => {
    const a = await getRawActor();
    return a.createOrder(items, total, paymentMode);
  },
  // Payments
  startPayment: async (orderId: string, amount: number): Promise<string> => {
    const a = await getRawActor();
    return a.startPayment(orderId, amount);
  },
  getPaymentStatus: async (orderId: string): Promise<string> => {
    const a = await getRawActor();
    return a.getPaymentStatus(orderId);
  },
  confirmPayment: async (orderId: string): Promise<boolean> => {
    const a = await getRawActor();
    return a.confirmPayment(orderId);
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
      const a = await getRawActor();
      return await a.saveSettings(upiId, accountName);
    } catch (e) {
      console.error("[api.saveSettings]", e);
      return false;
    }
  },
};
