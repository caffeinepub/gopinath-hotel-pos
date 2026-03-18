/* eslint-disable */
// @ts-nocheck

import type { ActorMethod } from '@icp-sdk/core/agent';
import type { IDL } from '@icp-sdk/core/candid';

export interface MenuItem {
  id: string;
  name: string;
  price: number;
  category: string;
  available: boolean;
}
export interface OrderItem {
  itemId: string;
  name: string;
  price: number;
  qty: bigint;
}
export interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  paymentMode: string;
  paymentStatus: string;
  createdAt: bigint;
}
export interface Settings {
  upiId: string;
  accountName: string;
}
export interface Analytics {
  todaySales: number;
  todayOrders: bigint;
  topItem: string;
}
export interface _SERVICE {
  getMenu: ActorMethod<[], MenuItem[]>;
  addMenuItem: ActorMethod<[string, number, string], string>;
  updateMenuItem: ActorMethod<[string, string, number, string], boolean>;
  deleteMenuItem: ActorMethod<[string], boolean>;
  toggleAvailability: ActorMethod<[string], boolean>;
  createOrder: ActorMethod<[OrderItem[], number, string], string>;
  getOrders: ActorMethod<[], Order[]>;
  getOrderById: ActorMethod<[string], [Order] | []>;
  startPayment: ActorMethod<[string, number], string>;
  getPaymentStatus: ActorMethod<[string], string>;
  confirmPayment: ActorMethod<[string], boolean>;
  getAnalytics: ActorMethod<[], Analytics>;
  getSettings: ActorMethod<[], Settings>;
  saveSettings: ActorMethod<[string, string], boolean>;
}
export declare const idlService: IDL.ServiceClass;
export declare const idlInitArgs: IDL.Type[];
export declare const idlFactory: IDL.InterfaceFactory;
export declare const init: (args: { IDL: typeof IDL }) => IDL.Type[];
