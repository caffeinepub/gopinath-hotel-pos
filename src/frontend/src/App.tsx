import { Toaster } from "@/components/ui/sonner";
import { useEffect, useState } from "react";
import type { Screen } from "./App.types";
import { AppSidebar } from "./components/AppSidebar";
import { BottomNav } from "./components/BottomNav";
import { MobileHeader } from "./components/MobileHeader";
import { MenuProvider } from "./context/MenuContext";
import { useOrders } from "./hooks/useOrders";
import { useSettings } from "./hooks/useSettings";
import { BillingScreen } from "./screens/BillingScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { LoginSelectScreen } from "./screens/LoginSelectScreen";
import { MenuManagementScreen } from "./screens/MenuManagementScreen";
import { OwnerLoginScreen } from "./screens/OwnerLoginScreen";
import { PaymentScreen } from "./screens/PaymentScreen";
import { PrintBillScreen } from "./screens/PrintBillScreen";
import { SettingsScreen } from "./screens/SettingsScreen";
import { SignUpScreen } from "./screens/SignUpScreen";
import { StaffLoginScreen } from "./screens/StaffLoginScreen";
import { WelcomeScreen } from "./screens/WelcomeScreen";
import type { CartItem, PaymentData } from "./types/payment";

export type { Screen };

const SESSION_KEY = "pos_session";

function loadSession(): { screen: Screen; user: string } | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function saveSession(screen: Screen, user: string) {
  const mainScreens: Screen[] = [
    "dashboard",
    "billing",
    "menuManagement",
    "settings",
  ];
  if (mainScreens.includes(screen) && user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ screen, user }));
  }
}

function clearSession() {
  localStorage.removeItem(SESSION_KEY);
}

export default function App() {
  const saved = loadSession();
  const [screen, setScreen] = useState<Screen>(saved?.screen ?? "welcome");
  const [darkMode, setDarkMode] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string>(
    saved?.user ?? "Owner",
  );
  const { settings } = useSettings();
  const { addOrder } = useOrders();

  const navigate = (next: Screen) => {
    setScreen(next);
    saveSession(next, loggedInUser);
  };
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  // Keep session in sync when user changes
  useEffect(() => {
    const mainScreens: Screen[] = [
      "dashboard",
      "billing",
      "menuManagement",
      "settings",
    ];
    if (mainScreens.includes(screen) && loggedInUser) {
      saveSession(screen, loggedInUser);
    }
  }, [screen, loggedInUser]);

  const handleLogout = () => {
    clearSession();
    setScreen("loginSelect");
    setLoggedInUser("");
  };

  const handleLogin = (user: string, nextScreen: Screen) => {
    setLoggedInUser(user);
    setScreen(nextScreen);
    saveSession(nextScreen, user);
  };

  const handleCheckout = (cart: CartItem[]) => {
    setCartItems(cart);
    setScreen("payment");
  };

  const handlePaymentComplete = (data: PaymentData) => {
    addOrder(data);
    setPaymentData(data);
    setScreen("printBill");
  };

  const isMainApp =
    screen === "dashboard" ||
    screen === "billing" ||
    screen === "menuManagement" ||
    screen === "settings";

  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";

  const hotelSettings = {
    hotelName: settings.hotelName,
    upiId: settings.upiId,
    accountName: settings.accountName,
  };

  return (
    <MenuProvider>
      <div
        className={`min-h-screen ${
          isMainApp || screen === "payment" || screen === "printBill"
            ? bgClass
            : "pos-background md:items-center md:justify-center md:p-6"
        }`}
      >
        <Toaster position="top-center" richColors />

        {screen === "welcome" && <WelcomeScreen onNavigate={navigate} />}
        {screen === "loginSelect" && (
          <LoginSelectScreen onNavigate={navigate} />
        )}
        {screen === "ownerLogin" && (
          <OwnerLoginScreen
            onNavigate={navigate}
            onLogin={(user) => handleLogin(user, "dashboard")}
          />
        )}
        {screen === "staffLogin" && (
          <StaffLoginScreen
            onNavigate={navigate}
            onLogin={(user) => handleLogin(user, "dashboard")}
          />
        )}
        {screen === "signUp" && <SignUpScreen onNavigate={navigate} />}

        {isMainApp && (
          <div className="flex min-h-screen">
            {/* Desktop/Tablet Sidebar - hidden on mobile */}
            <AppSidebar
              activeScreen={screen}
              onNavigate={navigate}
              onLogout={handleLogout}
              darkMode={darkMode}
            />

            {/* Mobile Top Header - visible only on mobile */}
            <MobileHeader loggedInUser={loggedInUser} darkMode={darkMode} />

            {/* Main Content */}
            <div
              className={`flex-1 flex flex-col min-h-screen overflow-x-hidden
                lg:ml-[250px]
                pt-[56px] pb-[72px]
                lg:pt-0 lg:pb-0
              `}
            >
              {screen === "dashboard" && (
                <DashboardScreen
                  onNavigate={navigate}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                  loggedInUser={loggedInUser}
                />
              )}
              {screen === "billing" && (
                <BillingScreen
                  onNavigate={navigate}
                  onCheckout={handleCheckout}
                  darkMode={darkMode}
                />
              )}
              {screen === "menuManagement" && (
                <MenuManagementScreen
                  onNavigate={navigate}
                  darkMode={darkMode}
                  toggleDarkMode={toggleDarkMode}
                />
              )}
              {screen === "settings" && (
                <SettingsScreen
                  onBack={() => navigate("dashboard")}
                  onNavigate={navigate}
                  darkMode={darkMode}
                />
              )}
            </div>

            {/* Mobile Bottom Nav - hidden on desktop */}
            <BottomNav
              activeScreen={screen}
              onNavigate={navigate}
              onLogout={handleLogout}
              darkMode={darkMode}
            />
          </div>
        )}

        {screen === "payment" && (
          <PaymentScreen
            cart={cartItems}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setScreen("billing")}
            darkMode={darkMode}
            hotelSettings={hotelSettings}
          />
        )}

        {screen === "printBill" && paymentData && (
          <PrintBillScreen
            paymentData={paymentData}
            onBack={() => setScreen("payment")}
            darkMode={darkMode}
            hotelSettings={{ hotelName: settings.hotelName }}
          />
        )}
      </div>
    </MenuProvider>
  );
}
