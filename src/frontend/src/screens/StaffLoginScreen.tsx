import { useState } from "react";
import { toast } from "sonner";
import type { Screen } from "../App";
import { BackButton } from "../components/BackButton";
import { Footer } from "../components/Footer";
import { PinKeypad } from "../components/PinKeypad";
import { useActor } from "../hooks/useActor";

interface StaffLoginScreenProps {
  onNavigate: (screen: Screen) => void;
  onLogin?: (user: string) => void;
}

const STAFF_PIN = "5678";

export function StaffLoginScreen({
  onNavigate,
  onLogin,
}: StaffLoginScreenProps) {
  const [pin, setPin] = useState("");
  const { actor } = useActor();

  const handleKey = (k: string) => setPin((p) => (p.length < 4 ? p + k : p));
  const handleBackspace = () => setPin((p) => p.slice(0, -1));
  const handleClear = () => setPin("");
  const handleSubmit = async () => {
    if (pin.length < 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    try {
      if (actor) {
        const [name, role] = await actor.login(pin);
        if (role === "staff" || role === "Staff") {
          toast.success("Staff login successful");
          setPin("");
          onLogin?.(name || "Staff");
          onNavigate("dashboard");
        } else if (role !== "") {
          toast.error("Access denied. Staff PIN required.");
          setPin("");
        } else {
          toast.error("Incorrect PIN. Please try again.");
          setPin("");
        }
      } else {
        // Fallback: check hardcoded PIN
        if (pin === STAFF_PIN) {
          toast.success("Staff login successful");
          setPin("");
          onLogin?.("Staff");
          onNavigate("dashboard");
        } else {
          toast.error("Incorrect PIN. Please try again.");
          setPin("");
        }
      }
    } catch (err) {
      console.error("Login error", err);
      // Fallback to hardcoded
      if (pin === STAFF_PIN) {
        toast.success("Staff login successful");
        setPin("");
        onLogin?.("Staff");
        onNavigate("dashboard");
      } else {
        toast.error("Incorrect PIN. Please try again.");
        setPin("");
      }
    } finally {
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

      <div className="flex-1 flex flex-col items-center justify-center gap-8 py-6">
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
