import type { Screen } from "../App";
import { Footer } from "../components/Footer";
import { GlowButton } from "../components/GlowButton";
import { Header } from "../components/Header";

interface WelcomeScreenProps {
  onNavigate: (screen: Screen) => void;
}

export function WelcomeScreen({ onNavigate }: WelcomeScreenProps) {
  return (
    <div className="screen-card min-h-screen flex flex-col justify-between px-6 md:px-8 md:min-h-0 md:py-4">
      <div className="flex-1 flex flex-col items-center justify-center gap-10">
        <Header />

        <div className="w-full max-w-xs md:max-w-sm flex flex-col gap-4 animate-fade-in">
          <GlowButton
            size="lg"
            onClick={() => onNavigate("loginSelect")}
            data-ocid="welcome.login_button"
          >
            LOGIN
          </GlowButton>
          <GlowButton
            size="lg"
            onClick={() => onNavigate("signUp")}
            data-ocid="welcome.signup_button"
          >
            SIGN UP
          </GlowButton>
        </div>

        {/* Decorative divider */}
        <div className="flex items-center gap-3 w-full max-w-xs md:max-w-sm opacity-40">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-orange-300" />
          <span className="text-xs text-muted-foreground font-body tracking-widest uppercase">
            POS
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-orange-300" />
        </div>
      </div>

      <Footer />
    </div>
  );
}
