import { useState } from "react";
import type { PaymentData } from "../types/payment";

function todayKey() {
  const d = new Date();
  return `gopinath_orders_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadOrders(): PaymentData[] {
  try {
    const raw = localStorage.getItem(todayKey());
    if (raw) return JSON.parse(raw) as PaymentData[];
  } catch {
    // ignore
  }
  return [];
}

function saveOrders(orders: PaymentData[]) {
  localStorage.setItem(todayKey(), JSON.stringify(orders));
}

export function useOrders() {
  const [orders, setOrders] = useState<PaymentData[]>(loadOrders);

  const addOrder = (data: PaymentData) => {
    const next = [...orders, data];
    saveOrders(next);
    setOrders(next);
  };

  const todaySales = orders.reduce((sum, o) => sum + o.total, 0);
  const todayOrders = orders.length;

  const topItem = (() => {
    const counts: Record<string, number> = {};
    for (const o of orders) {
      for (const c of o.cart) {
        counts[c.item.name] = (counts[c.item.name] ?? 0) + c.qty;
      }
    }
    let best = "";
    let max = 0;
    for (const [name, qty] of Object.entries(counts)) {
      if (qty > max) {
        max = qty;
        best = name;
      }
    }
    return best;
  })();

  return { addOrder, todaySales, todayOrders, topItem };
}
