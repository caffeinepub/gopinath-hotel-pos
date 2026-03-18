import { useEffect, useState } from "react";
import { api } from "../api";
import type { PaymentData } from "../types/payment";

function todayKey() {
  const d = new Date();
  return `gopinath_orders_${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function loadOrdersFromLS(): PaymentData[] {
  try {
    const raw = localStorage.getItem(todayKey());
    if (raw) return JSON.parse(raw) as PaymentData[];
  } catch {
    // ignore
  }
  return [];
}

function saveOrdersToLS(orders: PaymentData[]) {
  localStorage.setItem(todayKey(), JSON.stringify(orders));
}

export function useOrders() {
  const [orders, setOrders] = useState<PaymentData[]>(loadOrdersFromLS);
  const [remoteSales, setRemoteSales] = useState<number | null>(null);
  const [remoteOrders, setRemoteOrders] = useState<number | null>(null);
  const [remoteTopItem, setRemoteTopItem] = useState<string | null>(null);

  // Fetch analytics from canister
  useEffect(() => {
    api
      .getAnalytics()
      .then((analytics) => {
        setRemoteSales(analytics.todaySales);
        setRemoteOrders(Number(analytics.todayOrders));
        setRemoteTopItem(analytics.topItem);
      })
      .catch(() => {
        // fallback to local
      });
  }, []);

  const addOrder = (data: PaymentData) => {
    const next = [...orders, data];
    saveOrdersToLS(next);
    setOrders(next);
    // Refresh analytics from canister after a short delay
    setTimeout(() => {
      api
        .getAnalytics()
        .then((analytics) => {
          setRemoteSales(analytics.todaySales);
          setRemoteOrders(Number(analytics.todayOrders));
          setRemoteTopItem(analytics.topItem);
        })
        .catch(() => {});
    }, 1500);
  };

  // Compute local fallbacks
  const localSales = orders.reduce((sum, o) => sum + o.total, 0);
  const localOrders = orders.length;
  const localTopItem = (() => {
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

  const todaySales = remoteSales !== null ? remoteSales : localSales;
  const todayOrders = remoteOrders !== null ? remoteOrders : localOrders;
  const topItem = remoteTopItem !== null ? remoteTopItem : localTopItem;

  return { addOrder, todaySales, todayOrders, topItem };
}
