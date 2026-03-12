import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { Screen } from "./App.types";
import { AppSidebar } from "./components/AppSidebar";
import { MenuProvider } from "./context/MenuContext";
import { BillingScreen } from "./screens/BillingScreen";
import { DashboardScreen } from "./screens/DashboardScreen";
import { LoginSelectScreen } from "./screens/LoginSelectScreen";
import { MenuManagementScreen } from "./screens/MenuManagementScreen";
import { OwnerLoginScreen } from "./screens/OwnerLoginScreen";
import { PaymentScreen } from "./screens/PaymentScreen";
import { PrintBillScreen } from "./screens/PrintBillScreen";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = (next: Screen) => setScreen(next);
  const toggleDarkMode = () => setDarkMode((prev) => !prev);

  const handleLogout = () => {
    setScreen("loginSelect");
  };

  const handleCheckout = (cart: CartItem[]) => {
    setCartItems(cart);
    setScreen("payment");
  };

  const handlePaymentComplete = (data: PaymentData) => {
    setPaymentData(data);
    setScreen("printBill");
  };

  const isMainApp =
    screen === "dashboard" ||
    screen === "billing" ||
    screen === "menuManagement";

  const bgClass = darkMode ? "bg-gray-900" : "bg-gray-50";

  return (
    <MenuProvider>
      <div
        className={`min-h-screen flex flex-col ${
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
        {screen === "ownerLogin" && <OwnerLoginScreen onNavigate={navigate} />}
        {screen === "staffLogin" && <StaffLoginScreen onNavigate={navigate} />}
        {screen === "signUp" && <SignUpScreen onNavigate={navigate} />}

        {screen === "dashboard" && (
          <DashboardScreen
            onNavigate={navigate}
            darkMode={darkMode}
            toggleDarkMode={toggleDarkMode}
            onOpenSidebar={() => setSidebarOpen(true)}
          />
        )}

        {(screen === "billing" || screen === "menuManagement") && (
          <div className="flex flex-col min-h-screen">
            {screen === "billing" && (
              <BillingScreen
                onNavigate={navigate}
                onCheckout={handleCheckout}
                darkMode={darkMode}
                onOpenSidebar={() => setSidebarOpen(true)}
              />
            )}
            {screen === "menuManagement" && (
              <MenuManagementScreen
                onNavigate={navigate}
                darkMode={darkMode}
                toggleDarkMode={toggleDarkMode}
                onOpenSidebar={() => setSidebarOpen(true)}
              />
            )}
          </div>
        )}

        {isMainApp && (
          <AppSidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
            activeScreen={screen}
            onNavigate={navigate}
            onLogout={handleLogout}
            darkMode={darkMode}
          />
        )}

        {screen === "payment" && (
          <PaymentScreen
            cart={cartItems}
            onPaymentComplete={handlePaymentComplete}
            onBack={() => setScreen("billing")}
            darkMode={darkMode}
          />
        )}

        {screen === "printBill" && paymentData && (
          <PrintBillScreen
            paymentData={paymentData}
            onBack={() => setScreen("payment")}
            darkMode={darkMode}
          />
        )}
      </div>
    </MenuProvider>
  );
}
