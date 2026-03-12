import { ClipboardList, Menu, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import type { Screen } from "../App";
import { Footer } from "../components/Footer";

interface DashboardScreenProps {
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onOpenSidebar?: () => void;
}

export function DashboardScreen({
  onNavigate,
  darkMode,
  onOpenSidebar,
}: DashboardScreenProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formattedDate = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = time.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const bg = darkMode ? "bg-gray-900" : "bg-white";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const text = darkMode ? "text-white" : "text-gray-800";
  const subText = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-100";
  const headerBg = darkMode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-gray-100";

  return (
    <div
      className={`min-h-screen flex flex-col ${bg} max-w-2xl mx-auto w-full`}
    >
      {/* Header */}
      <header
        className={`${headerBg} border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-xs`}
      >
        <button
          type="button"
          onClick={onOpenSidebar}
          data-ocid="header.sidebar.open_modal_button"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            darkMode
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-orange-500">
            Gobinath Hotel
          </p>
          <h1
            className={`font-display font-bold text-xl leading-tight ${text}`}
          >
            Dashboard
          </h1>
        </div>
      </header>

      <div className="flex-1 flex flex-col px-5 gap-6 pt-6">
        {/* Date & Time Card */}
        <div
          data-ocid="dashboard.datetime.card"
          className={`rounded-2xl border ${border} ${cardBg} px-5 py-4 shadow-sm flex flex-col items-center text-center`}
        >
          <p className={`text-sm font-medium ${subText}`}>{formattedDate}</p>
          <p className="text-4xl font-bold font-display mt-1 text-orange-500 tracking-tight">
            {formattedTime}
          </p>
        </div>

        {/* Module Cards */}
        <div>
          <p
            className={`text-xs font-semibold uppercase tracking-widest ${subText} mb-3`}
          >
            Modules
          </p>
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => onNavigate("billing")}
              data-ocid="dashboard.bill.button"
              className={`${cardBg} rounded-2xl shadow-sm border ${border} p-6 flex flex-col items-center gap-4 min-h-[160px] cursor-pointer hover:shadow-md hover:border-orange-200 active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                <Receipt className="w-8 h-8 text-white" />
              </div>
              <span className={`font-display font-bold text-lg ${text}`}>
                Bill
              </span>
            </button>

            <button
              type="button"
              onClick={() => onNavigate("menuManagement")}
              data-ocid="dashboard.menu.button"
              className={`${cardBg} rounded-2xl shadow-sm border ${border} p-6 flex flex-col items-center gap-4 min-h-[160px] cursor-pointer hover:shadow-md hover:border-orange-200 active:scale-[0.97] transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400`}
            >
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center shadow-md">
                <ClipboardList className="w-8 h-8 text-white" />
              </div>
              <span className={`font-display font-bold text-lg ${text}`}>
                Menu
              </span>
            </button>
          </div>
        </div>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
