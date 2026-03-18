import {
  LayoutDashboard,
  LogOut,
  Receipt,
  Settings2,
  UtensilsCrossed,
} from "lucide-react";
import type { Screen } from "../App";

const LOGO_PATH = `${import.meta.env.BASE_URL}assets/uploads/homeScreenLogo-1.jpeg`;

interface AppSidebarProps {
  activeScreen: Screen;
  onNavigate: (screen: Screen) => void;
  onLogout: () => void;
  darkMode: boolean;
}

const navItems: {
  screen: Screen;
  label: string;
  icon: React.ReactNode;
  ocid: string;
}[] = [
  {
    screen: "dashboard",
    label: "Dashboard",
    icon: <LayoutDashboard className="w-5 h-5" />,
    ocid: "sidebar.dashboard.link",
  },
  {
    screen: "billing",
    label: "Bill",
    icon: <Receipt className="w-5 h-5" />,
    ocid: "sidebar.bill.link",
  },
  {
    screen: "menuManagement",
    label: "Menu",
    icon: <UtensilsCrossed className="w-5 h-5" />,
    ocid: "sidebar.menu.link",
  },
  {
    screen: "settings",
    label: "Settings",
    icon: <Settings2 className="w-5 h-5" />,
    ocid: "sidebar.settings.link",
  },
];

export function AppSidebar({
  activeScreen,
  onNavigate,
  onLogout,
  darkMode,
}: AppSidebarProps) {
  const panelBg = darkMode ? "bg-gray-800" : "bg-white";
  const brandText = darkMode ? "text-white" : "text-gray-900";
  const divider = darkMode ? "border-gray-700" : "border-gray-100";
  const borderRight = darkMode
    ? "border-r border-gray-700"
    : "border-r border-gray-200";

  return (
    <aside
      data-ocid="sidebar.panel"
      className={`fixed top-0 left-0 h-full w-[250px] z-30 shadow-lg flex-col ${panelBg} ${borderRight} hidden lg:flex`}
    >
      {/* Hotel Branding */}
      <div
        className={`px-5 pt-5 pb-4 border-b ${divider} flex flex-col items-center gap-2`}
      >
        <img
          src={LOGO_PATH}
          alt="Gopinath Hotel Logo"
          className="w-28 h-28 object-contain rounded-xl"
        />
        <p
          className={`font-bold text-sm leading-tight tracking-widest uppercase text-center ${brandText}`}
        >
          Gopinath Hotel
        </p>
        <div className="h-0.5 w-full bg-gradient-to-r from-orange-500 to-orange-300 mt-1 rounded-full" />
      </div>

      {/* Nav Items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ screen, label, icon, ocid }) => {
          const isActive = activeScreen === screen;
          return (
            <button
              key={label}
              type="button"
              data-ocid={ocid}
              onClick={() => onNavigate(screen)}
              className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl text-left font-semibold text-sm transition-all duration-150 ${
                isActive
                  ? "bg-orange-500 text-white shadow-md shadow-orange-200"
                  : darkMode
                    ? "text-gray-300 hover:bg-gray-700"
                    : "text-gray-600 hover:bg-orange-50 hover:text-orange-600"
              }`}
            >
              <span className={isActive ? "text-white" : ""}>{icon}</span>
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className={`px-3 pb-6 pt-4 border-t ${divider}`}>
        <button
          type="button"
          data-ocid="sidebar.logout.button"
          onClick={onLogout}
          className={`w-full flex items-center gap-3 py-3 px-4 rounded-xl border border-orange-200 font-semibold text-sm transition-colors ${
            darkMode
              ? "bg-gray-800 hover:bg-orange-950/30"
              : "bg-white hover:bg-orange-50"
          }`}
        >
          <LogOut className="w-5 h-5 text-orange-500" />
          <span className="text-orange-500">Logout</span>
        </button>
      </div>
    </aside>
  );
}
