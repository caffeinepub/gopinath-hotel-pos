import { useCallback, useEffect, useState } from "react";
import { isSupabaseConfigured } from "../lib/supabase";
import { fetchTodayAnalytics } from "../lib/supabaseApi";

export function useSupabaseAnalytics() {
  const [todaySales, setTodaySales] = useState(0);
  const [todayOrders, setTodayOrders] = useState(0);
  const [topItem, setTopItem] = useState("");
  const [loading, setLoading] = useState(false);
  const [isBackendEnabled] = useState(isSupabaseConfigured);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured()) return;
    setLoading(true);
    try {
      const data = await fetchTodayAnalytics();
      if (data) {
        setTodaySales((data as { total_sales: number }).total_sales ?? 0);
        setTodayOrders((data as { total_orders: number }).total_orders ?? 0);
        setTopItem((data as { top_item: string }).top_item ?? "");
      }
    } catch (e) {
      console.error("Analytics fetch failed", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    todaySales,
    todayOrders,
    topItem,
    loading,
    isBackendEnabled,
    refresh,
  };
}
