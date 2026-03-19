import {
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings2,
  UtensilsCrossed,
} from "lucide-react";
import type { Screen } from "../App";

interface BottomNavProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
  userRole: "owner" | "staff";
}

const allNavItems: {
  screen: Screen;
  label: string;
  icon: React.ReactNode;
  ownerOnly?: boolean;
}[] = [
  {
    screen: "dashboard",
    label: "Home",
    icon: <LayoutDashboard className="w-6 h-6" />,
  },
  {
    screen: "billing",
    label: "Bill",
    icon: <Receipt className="w-6 h-6" />,
  },
  {
    screen: "menuManagement",
    label: "Menu",
    icon: <UtensilsCrossed className="w-6 h-6" />,
  },
  {
    screen: "settings",
    label: "Settings",
    icon: <Settings2 className="w-6 h-6" />,
    ownerOnly: true,
  },
];

export function BottomNav({
  activeScreen,
  onNavigate,
  onLogout,
  darkMode,
  userRole,
}: BottomNavProps) {
  const bg = darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";

  const navItems = allNavItems.filter(
    (item) => !(item.ownerOnly && userRole === "staff"),
  );

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 z-40 border-t ${bg} flex items-center justify-around px-1 py-1 lg:hidden`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 8px)" }}
    >
      {navItems.map(({ screen, label, icon }) => {
        const isActive = activeScreen === screen;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onNavigate(screen)}
            className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 rounded-xl transition-all ${
              isActive
                ? "text-orange-500"
                : darkMode
                  ? "text-gray-400"
                  : "text-gray-500"
            }`}
          >
            <span
              className={`p-1.5 rounded-xl transition-all ${
                isActive ? "bg-orange-50" : ""
              }`}
            >
              {icon}
            </span>
            <span
              className={`text-[10px] font-semibold ${
                isActive ? "text-orange-500" : ""
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
      {/* Logout button */}
      <button
        type="button"
        onClick={onLogout}
        className={`flex flex-col items-center justify-center flex-1 py-2 gap-0.5 rounded-xl ${
          darkMode ? "text-gray-400" : "text-gray-500"
        }`}
      >
        <span className="p-1.5 rounded-xl">
          <LogOut className="w-6 h-6" />
        </span>
        <span className="text-[10px] font-semibold">Logout</span>
      </button>
    </nav>
  );
}
