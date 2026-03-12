import {
  LayoutDashboard,
  LogOut,
  Menu,
  Receipt,
  Settings,
  UtensilsCrossed,
  X,
} from "lucide-react";
import type { Screen } from "../App";

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
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
    screen: "dashboard",
    label: "Settings",
    icon: <Settings className="w-5 h-5" />,
    ocid: "sidebar.settings.link",
  },
];

export function AppSidebar({
  isOpen,
  onClose,
  activeScreen,
  onNavigate,
  onLogout,
  darkMode,
}: AppSidebarProps) {
  const panelBg = darkMode ? "bg-gray-800" : "bg-white";
  const brandText = darkMode ? "text-white" : "text-gray-800";
  const subText = darkMode ? "text-gray-400" : "text-gray-500";
  const divider = darkMode ? "border-gray-700" : "border-gray-100";

  const handleNavClick = (s: Screen) => {
    onNavigate(s);
    onClose();
  };

  const handleLogout = () => {
    onLogout();
    onClose();
  };

  const handleBackdropKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" || e.key === "Enter") onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        role="button"
        tabIndex={-1}
        onClick={onClose}
        onKeyDown={handleBackdropKeyDown}
        aria-label="Close sidebar"
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ${
          isOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer */}
      <aside
        data-ocid="sidebar.panel"
        className={`fixed top-0 left-0 h-full w-64 z-50 shadow-xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } ${panelBg}`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between px-5 pt-6 pb-4 border-b ${divider}`}
        >
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center">
              <Menu className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className={`font-bold text-sm leading-tight ${brandText}`}>
                Gobinath Hotel
              </p>
              <p className={`text-xs ${subText}`}>POS System</p>
            </div>
          </div>
          <button
            type="button"
            data-ocid="sidebar.close.close_button"
            onClick={onClose}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-400"
                : "hover:bg-gray-100 text-gray-500"
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ screen, label, icon, ocid }) => {
            const isActive = activeScreen === screen && label !== "Settings";
            return (
              <button
                key={label}
                type="button"
                data-ocid={ocid}
                onClick={() => handleNavClick(screen)}
                className={`w-full flex items-center gap-3 py-3 px-4 rounded-r-xl text-left font-semibold text-sm transition-all duration-150 border-l-4 ${
                  isActive
                    ? "bg-orange-50 text-orange-500 border-orange-500"
                    : darkMode
                      ? "text-gray-300 border-transparent hover:bg-gray-700"
                      : "text-gray-600 border-transparent hover:bg-gray-50"
                }`}
              >
                <span className={isActive ? "text-orange-500" : ""}>
                  {icon}
                </span>
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
            onClick={handleLogout}
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
    </>
  );
}
