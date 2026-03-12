import { Crown, UtensilsCrossed } from "lucide-react";
import type { Screen } from "../App";
import { BackButton } from "../components/BackButton";
import { Footer } from "../components/Footer";
import { GlowButton } from "../components/GlowButton";
import { Header } from "../components/Header";

interface LoginSelectScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function LoginSelectScreen({ onNavigate }: LoginSelectScreenProps) {
  return (
    <div className="screen-card min-h-screen flex flex-col px-6 md:px-8 md:min-h-0 md:py-4">
      <div className="flex items-center pt-6 md:pt-8">
        <BackButton
          onClick={() => onNavigate("welcome")}
          ocid="login_select.back_button"
        />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        <Header />

        <div className="w-full flex flex-col items-center gap-3 animate-fade-in">
          <h1 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2 text-center">
            Select Login
          </h1>

          <div className="w-full max-w-xs md:max-w-sm flex flex-col gap-4">
            <GlowButton
              size="lg"
              onClick={() => onNavigate("ownerLogin")}
              data-ocid="login_select.owner_button"
            >
              <span className="flex items-center justify-center gap-3">
                <Crown className="w-6 h-6 shrink-0" strokeWidth={1.8} />
                <span>Owner Login</span>
              </span>
            </GlowButton>
            <GlowButton
              size="lg"
              onClick={() => onNavigate("staffLogin")}
              data-ocid="login_select.staff_button"
            >
              <span className="flex items-center justify-center gap-3">
                <UtensilsCrossed
                  className="w-6 h-6 shrink-0"
                  strokeWidth={1.8}
                />
                <span>Staff Login</span>
              </span>
            </GlowButton>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
