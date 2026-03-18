/* eslint-disable */
// @ts-nocheck

import { IDL } from '@icp-sdk/core/candid';

const MenuItem = IDL.Record({
  id: IDL.Text,
  name: IDL.Text,
  price: IDL.Float64,
  category: IDL.Text,
  available: IDL.Bool,
});

const OrderItem = IDL.Record({
  itemId: IDL.Text,
  name: IDL.Text,
  price: IDL.Float64,
  qty: IDL.Nat,
});

const Order = IDL.Record({
  id: IDL.Text,
  items: IDL.Vec(OrderItem),
  total: IDL.Float64,
  paymentMode: IDL.Text,
  paymentStatus: IDL.Text,
  createdAt: IDL.Int,
});

const Settings = IDL.Record({
  upiId: IDL.Text,
  accountName: IDL.Text,
});

const Analytics = IDL.Record({
  todaySales: IDL.Float64,
  todayOrders: IDL.Nat,
  topItem: IDL.Text,
});

export const idlService = IDL.Service({
  getMenu: IDL.Func([], [IDL.Vec(MenuItem)], ['query']),
  addMenuItem: IDL.Func([IDL.Text, IDL.Float64, IDL.Text], [IDL.Text], []),
  updateMenuItem: IDL.Func([IDL.Text, IDL.Text, IDL.Float64, IDL.Text], [IDL.Bool], []),
  deleteMenuItem: IDL.Func([IDL.Text], [IDL.Bool], []),
  toggleAvailability: IDL.Func([IDL.Text], [IDL.Bool], []),
  createOrder: IDL.Func([IDL.Vec(OrderItem), IDL.Float64, IDL.Text], [IDL.Text], []),
  getOrders: IDL.Func([], [IDL.Vec(Order)], ['query']),
  getOrderById: IDL.Func([IDL.Text], [IDL.Opt(Order)], ['query']),
  startPayment: IDL.Func([IDL.Text, IDL.Float64], [IDL.Text], []),
  getPaymentStatus: IDL.Func([IDL.Text], [IDL.Text], ['query']),
  confirmPayment: IDL.Func([IDL.Text], [IDL.Bool], []),
  getAnalytics: IDL.Func([], [Analytics], ['query']),
  getSettings: IDL.Func([], [Settings], ['query']),
  saveSettings: IDL.Func([IDL.Text, IDL.Text], [IDL.Bool], []),
});

export const idlInitArgs = [];

export const idlFactory = ({ IDL: _IDL }) => idlService;

export const init = ({ IDL: _IDL }) => { return []; };
