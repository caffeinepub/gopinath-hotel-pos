import {
  ClipboardList,
  Receipt,
  Settings2,
  ShoppingBag,
  TrendingUp,
  User,
  Utensils,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { Screen } from "../App";
import { Footer } from "../components/Footer";
import { HeaderClock } from "../components/HeaderClock";
import { useActor } from "../hooks/useActor";
import { useOrders } from "../hooks/useOrders";
import { useSupabaseAnalytics } from "../hooks/useSupabaseAnalytics";

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  loggedInUser?: string;
}

export function DashboardScreen({
  onNavigate,
  darkMode,
  loggedInUser = "Owner",
}: DashboardScreenProps) {
  const localOrders = useOrders();
  const supabaseAnalytics = useSupabaseAnalytics();
  const { actor } = useActor();

  const [actorAnalytics, setActorAnalytics] = useState<{
    todaySales: number;
    totalOrders: number;
    topItem: string;
  } | null>(null);
  const [actorLoading, setActorLoading] = useState(false);

  useEffect(() => {
    if (!actor) return;
    setActorLoading(true);
    actor
      .getAnalytics()
      .then((result) => {
        setActorAnalytics({
          todaySales: Number(result.todaySales),
          totalOrders: Number(result.totalOrders),
          topItem: result.topItem ?? "",
        });
      })
      .catch((e) => {
        console.error("Failed to fetch analytics from actor", e);
      })
      .finally(() => {
        setActorLoading(false);
      });
  }, [actor]);

  // Priority: actor > supabase > local
  const isActorEnabled = !!actor;
  const isSupabaseEnabled = supabaseAnalytics.isBackendEnabled;

  const todaySales = isActorEnabled
    ? (actorAnalytics?.todaySales ?? 0)
    : isSupabaseEnabled
      ? supabaseAnalytics.todaySales
      : localOrders.todaySales;

  const todayOrders = isActorEnabled
    ? (actorAnalytics?.totalOrders ?? 0)
    : isSupabaseEnabled
      ? supabaseAnalytics.todayOrders
      : localOrders.todayOrders;

  const topItem = isActorEnabled
    ? (actorAnalytics?.topItem ?? "")
    : isSupabaseEnabled
      ? supabaseAnalytics.topItem
      : localOrders.topItem;

  const analyticsLoading = isActorEnabled
    ? actorLoading
    : isSupabaseEnabled && supabaseAnalytics.loading;

  const backendLabel = isActorEnabled
    ? "ICP Backend"
    : isSupabaseEnabled
      ? "Supabase Connected"
      : "Offline Mode";

  const backendConnected = isActorEnabled || isSupabaseEnabled;

  const bg = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const text = darkMode ? "text-white" : "text-gray-800";
  const subText = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-200";
  const headerBg = darkMode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-gray-100";

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      {/* Header */}
      <header
        className={`${headerBg} border-b px-6 py-0 sticky top-0 z-10 shadow-sm`}
      >
        <div className="flex items-center h-16 gap-4">
          {/* Clock on left */}
          <div className="flex-1">
            <HeaderClock darkMode={darkMode} />
          </div>
          {/* User info on right */}
          <div
            data-ocid="header.user.panel"
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
              darkMode
                ? "border-gray-700 bg-gray-800"
                : "border-gray-200 bg-gray-50"
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
              <User className="w-4 h-4 text-orange-500" />
            </div>
            <span
              className={`text-sm font-semibold ${
                darkMode ? "text-white" : "text-gray-800"
              }`}
            >
              {loggedInUser}
            </span>
          </div>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 -mx-6" />
      </header>

      <div className="flex-1 flex flex-col px-5 gap-6 pt-6">
        {/* TODAY'S ANALYTICS — first section */}
        <div>
          <div className="flex items-center gap-3 mb-3">
            <p
              className={`text-xs font-semibold uppercase tracking-widest ${subText}`}
            >
              Today's Analytics
            </p>
            {backendConnected ? (
              <span
                data-ocid="dashboard.backend_status.panel"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                {backendLabel}
              </span>
            ) : (
              <span
                data-ocid="dashboard.backend_status.panel"
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                Offline Mode
              </span>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div
              data-ocid="dashboard.sales.card"
              className={`${cardBg} rounded-2xl border ${border} shadow-sm p-4 flex flex-col gap-2 transition-opacity ${
                analyticsLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-orange-500" />
              </div>
              <p className={`text-xs font-semibold ${subText}`}>
                Today's Sales
              </p>
              <p className={`text-xl font-bold ${text}`}>
                ₹{todaySales.toLocaleString("en-IN")}
              </p>
            </div>

            <div
              data-ocid="dashboard.orders.card"
              className={`${cardBg} rounded-2xl border ${border} shadow-sm p-4 flex flex-col gap-2 transition-opacity ${
                analyticsLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                <ShoppingBag className="w-4 h-4 text-orange-500" />
              </div>
              <p className={`text-xs font-semibold ${subText}`}>Total Orders</p>
              <p className={`text-xl font-bold ${text}`}>{todayOrders}</p>
            </div>

            <div
              data-ocid="dashboard.topitem.card"
              className={`${cardBg} rounded-2xl border ${border} shadow-sm p-4 flex flex-col gap-2 transition-opacity ${
                analyticsLoading ? "opacity-50" : "opacity-100"
              }`}
            >
              <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                <Utensils className="w-4 h-4 text-orange-500" />
              </div>
              <p className={`text-xs font-semibold ${subText}`}>Top Item</p>
              <p className={`text-sm font-bold ${text} truncate`}>
                {topItem || "N/A"}
              </p>
            </div>
          </div>
        </div>

        {/* MODULE CARDS — below analytics */}
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-widest ${subText} mb-3`}
          >
            Modules
          </p>
          <div className="grid grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => onNavigate("billing")}
              data-ocid="dashboard.bill.button"
              className={`${cardBg} rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col items-center gap-3 min-h-[140px] cursor-pointer hover:shadow-md hover:border-orange-200 active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                <Receipt className="w-7 h-7 text-white" />
              </div>
              <span className={`font-display font-bold text-base ${text}`}>
                Bill
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("menuManagement")}
              data-ocid="dashboard.menu.button"
              className={`${cardBg} rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col items-center gap-3 min-h-[140px] cursor-pointer hover:shadow-md hover:border-orange-200 active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                <ClipboardList className="w-7 h-7 text-white" />
              </div>
              <span className={`font-display font-bold text-base ${text}`}>
                Menu
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("settings")}
              data-ocid="dashboard.settings.button"
              className={`${cardBg} rounded-2xl shadow-sm border border-gray-200 p-4 flex flex-col items-center gap-3 min-h-[140px] cursor-pointer hover:shadow-md hover:border-orange-200 active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400`}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                <Settings2 className="w-7 h-7 text-white" />
              </div>
              <span className={`font-display font-bold text-base ${text}`}>
                Settings
              </span>
            </button>
          </div>
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
