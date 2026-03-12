import { Receipt, UtensilsCrossed } from "lucide-react";
import type { Screen } from "../App";

interface BottomNavProps {
  activeScreen: "dashboard" | "billing" | "menuManagement";
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
}

export function BottomNav({
  activeScreen,
  onNavigate,
  darkMode,
}: BottomNavProps) {
  const tabs = [
    { id: "billing" as const, label: "Bill", Icon: Receipt },
    { id: "menuManagement" as const, label: "Menu", Icon: UtensilsCrossed },
  ];

  return (
    <nav
      data-ocid="bottomnav.panel"
      className={`fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center border-t ${
        darkMode ? "bg-gray-900 border-gray-700" : "bg-white border-gray-100"
      } shadow-lg`}
    >
      {tabs.map(({ id, label, Icon }) => {
        const isActive = activeScreen === id;
        return (
          <button
            key={id}
            type="button"
            data-ocid={`bottomnav.${id === "billing" ? "bill" : "menu"}.tab`}
            onClick={() => onNavigate(id)}
            className={`flex-1 flex flex-col items-center justify-center h-full gap-0.5 transition-colors ${
              isActive
                ? "text-orange-500"
                : darkMode
                  ? "text-gray-500"
                  : "text-gray-400"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span
              className={`text-xs font-semibold ${
                isActive
                  ? "text-orange-500"
                  : darkMode
                    ? "text-gray-500"
                    : "text-gray-400"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
