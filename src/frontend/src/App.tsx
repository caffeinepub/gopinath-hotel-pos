import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { Screen } from "./App.types";
import { AppSidebar } from "./components/AppSidebar";
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

export default function App() {
  const [screen, setScreen] = useState<Screen>("welcome");
  const [darkMode, setDarkMode] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [loggedInUser, setLoggedInUser] = useState<string>("Owner");
  const { settings } = useSettings();
  const { addOrder } = useOrders();

  const navigate = (next: Screen) => setScreen(next);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleLogout = () => {
    setScreen("loginSelect");
    setLoggedInUser("");
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
            onLogin={(user) => setLoggedInUser(user)}
          />
        )}
        {screen === "staffLogin" && (
          <StaffLoginScreen
            onNavigate={navigate}
            onLogin={(user) => setLoggedInUser(user)}
          />
        )}
        {screen === "signUp" && <SignUpScreen onNavigate={navigate} />}

        {isMainApp && (
          <div className="flex min-h-screen">
            <AppSidebar
              activeScreen={screen}
              onNavigate={navigate}
              onLogout={handleLogout}
              darkMode={darkMode}
            />
            <div className="flex-1 ml-[250px] flex flex-col min-h-screen overflow-x-hidden">
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
                  onBack={() => setScreen("dashboard")}
                  onNavigate={navigate}
                  darkMode={darkMode}
                />
              )}
            </div>
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
