import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";
import type { Screen } from "../App";
import { BackButton } from "../components/BackButton";
import { Footer } from "../components/Footer";
import { GlowButton } from "../components/GlowButton";
import { Header } from "../components/Header";

interface SignUpScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function SignUpScreen({ onNavigate }: SignUpScreenProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    if (phone.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }
    if (pin.length !== 4) {
      toast.error("PIN must be 4 digits");
      return;
    }
    if (pin !== confirmPin) {
      toast.error("PINs do not match");
      return;
    }
    toast.success("Account created successfully!");
    setName("");
    setPhone("");
    setPin("");
    setConfirmPin("");
  };

  const inputClass =
    "h-12 md:h-14 text-base md:text-lg rounded-xl border-border focus:border-orange-start focus:ring-1 focus:ring-orange-start font-body";

  return (
    <div className="screen-card min-h-screen flex flex-col px-6 md:px-8 md:min-h-0 md:py-4">
      <div className="flex items-center pt-6 md:pt-8">
        <BackButton
          onClick={() => onNavigate("welcome")}
          ocid="signup.back_button"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-6 py-4">
        <Header />

        <div className="w-full max-w-xs md:max-w-sm animate-fade-in">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-6">
            Sign Up
          </h1>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="signup-name"
                className="text-sm font-medium text-foreground font-body"
              >
                Full Name
              </Label>
              <Input
                id="signup-name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={inputClass}
                data-ocid="signup.name_input"
                autoComplete="name"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="signup-phone"
                className="text-sm font-medium text-foreground font-body"
              >
                Phone Number
              </Label>
              <Input
                id="signup-phone"
                type="tel"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                data-ocid="signup.phone_input"
                autoComplete="tel"
                maxLength={15}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="signup-pin"
                className="text-sm font-medium text-foreground font-body"
              >
                4-Digit PIN
              </Label>
              <Input
                id="signup-pin"
                type="password"
                placeholder="••••"
                value={pin}
                onChange={(e) =>
                  setPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className={inputClass}
                data-ocid="signup.pin_input"
                inputMode="numeric"
                maxLength={4}
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="signup-confirm-pin"
                className="text-sm font-medium text-foreground font-body"
              >
                Confirm PIN
              </Label>
              <Input
                id="signup-confirm-pin"
                type="password"
                placeholder="••••"
                value={confirmPin}
                onChange={(e) =>
                  setConfirmPin(e.target.value.replace(/\D/g, "").slice(0, 4))
                }
                className={inputClass}
                inputMode="numeric"
                maxLength={4}
              />
            </div>

            <GlowButton
              type="submit"
              size="lg"
              className="mt-2"
              data-ocid="signup.submit_button"
            >
              Create Account
            </GlowButton>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  );
}
