import { useCallback, useEffect, useState } from "react";
import { api } from "../api";
import type { PaymentData } from "../types/payment";

interface AnalyticsState {
  todaySales: number;
  todayOrders: number;
  topItem: string;
  dbConnected: boolean;
  loading: boolean;
}

export function useOrders() {
  const [analytics, setAnalytics] = useState<AnalyticsState>({
    todaySales: 0,
    todayOrders: 0,
    topItem: "",
    dbConnected: false,
    loading: true,
  });

  const refreshAnalytics = useCallback(async () => {
    try {
      const data = await api.getAnalytics();
      setAnalytics({
        todaySales: data.todaySales,
        todayOrders: Number(data.todayOrders),
        topItem: data.topItem,
        dbConnected: true,
        loading: false,
      });
    } catch (e) {
      console.error("[useOrders] getAnalytics failed", e);
      setAnalytics((prev) => ({ ...prev, dbConnected: false, loading: false }));
    }
  }, []);

  // Load analytics from canister on mount
  useEffect(() => {
    refreshAnalytics();
  }, [refreshAnalytics]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const addOrder = (_data: PaymentData) => {
    // Session-only: paymentData is passed directly to PrintBillScreen via App state
    // Refresh analytics from canister after short delay (allow canister to process)
    setTimeout(() => {
      refreshAnalytics();
    }, 1500);
  };

  return {
    addOrder,
    refreshAnalytics,
    todaySales: analytics.todaySales,
    todayOrders: analytics.todayOrders,
    topItem: analytics.topItem,
    dbConnected: analytics.dbConnected,
    analyticsLoading: analytics.loading,
  };
}
