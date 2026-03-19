import { useState } from "react";
import { toast } from "sonner";
import type { Screen } from "../App";
import { BackButton } from "../components/BackButton";
import { Footer } from "../components/Footer";
import { PinKeypad } from "../components/PinKeypad";

interface StaffLoginScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin?: (user: string) => void;
}

const STAFF_PIN = "5678";
const LOGO_PATH = `${import.meta.env.BASE_URL}assets/uploads/homeScreenLogo-1.jpeg`;

export function StaffLoginScreen({
  onNavigate,
  onLogin,
}: StaffLoginScreenProps) {
  const [pin, setPin] = useState("");

  const handleKey = (k: string) => setPin((p) => (p.length < 4 ? p + k : p));
  const handleBackspace = () => setPin((p) => p.slice(0, -1));
  const handleClear = () => setPin("");
  const handleSubmit = () => {
    if (pin.length < 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }
    if (pin === STAFF_PIN) {
      toast.success("Staff login successful");
      setPin("");
      onLogin?.("Staff");
      onNavigate("dashboard");
    } else {
      toast.error("Incorrect PIN. Please try again.");
      setPin("");
    }
  };

  return (
    <div className="screen-card min-h-screen flex flex-col px-6 md:px-8 md:min-h-0 md:py-4">
      <div className="flex items-center pt-6 md:pt-8">
        <BackButton
          onClick={() => onNavigate("loginSelect")}
          ocid="staff_login.back_button"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-6">
        {/* Hotel Logo */}
        <div className="flex flex-col items-center gap-3 animate-scale-in">
          <div className="w-24 h-24 rounded-2xl overflow-hidden shadow-lg border-2 border-orange-100">
            <img
              src={LOGO_PATH}
              alt="Gopinath Hotel"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
          <div className="text-center">
            <p className="font-bold text-sm text-orange-500 uppercase tracking-widest">
              Gopinath Hotel
            </p>
          </div>
        </div>

        <div className="w-full flex flex-col items-center gap-6 animate-scale-in">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center">
            Staff Login
          </h1>

          <PinKeypad
            pin={pin}
            onKey={handleKey}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onSubmit={handleSubmit}
            inputOcid="staff_login.input"
            submitOcid="staff_login.submit_button"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
