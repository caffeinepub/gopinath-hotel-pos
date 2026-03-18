import { useState } from "react";
import { toast } from "sonner";
import type { Screen } from "../App";
import { BackButton } from "../components/BackButton";
import { Footer } from "../components/Footer";
import { PinKeypad } from "../components/PinKeypad";

interface OwnerLoginScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin?: (user: string) => void;
}

const OWNER_PIN = "1234";

export function OwnerLoginScreen({
  onNavigate,
  onLogin,
}: OwnerLoginScreenProps) {
  const [pin, setPin] = useState("");

  const handleKey = (k: string) => setPin((p) => (p.length < 4 ? p + k : p));
  const handleBackspace = () => setPin((p) => p.slice(0, -1));
  const handleClear = () => setPin("");
  const handleSubmit = () => {
    if (pin.length < 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }
    if (pin === OWNER_PIN) {
      toast.success("Owner login successful");
      setPin("");
      onLogin?.("Owner");
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
          ocid="owner_login.back_button"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-6">
        <div className="w-full flex flex-col items-center gap-6 animate-scale-in">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center">
            Owner Login
          </h1>

          <PinKeypad
            pin={pin}
            onKey={handleKey}
            onBackspace={handleBackspace}
            onClear={handleClear}
            onSubmit={handleSubmit}
            inputOcid="owner_login.input"
            submitOcid="owner_login.submit_button"
          />
        </div>
      </div>

      <Footer />
    </div>
  );
}
