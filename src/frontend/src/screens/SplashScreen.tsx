import { useEffect, useState } from "react";

interface SplashScreenProps {
  onComplete: () => void;
}

export function SplashScreen({ onComplete }: SplashScreenProps) {
  const [phase, setPhase] = useState<"in" | "hold" | "out">("in");

  useEffect(() => {
    // Fade in: 0.6s, hold: 1s, fade out: 0.4s
    const holdTimer = setTimeout(() => setPhase("hold"), 600);
    const outTimer = setTimeout(() => setPhase("out"), 1600);
    const doneTimer = setTimeout(() => onComplete(), 2000);
    return () => {
      clearTimeout(holdTimer);
      clearTimeout(outTimer);
      clearTimeout(doneTimer);
    };
  }, [onComplete]);

  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center z-50"
      style={{
        background:
          "linear-gradient(135deg, #fff7ed 0%, #ffffff 60%, #fff7ed 100%)",
        transition: "opacity 0.4s ease",
        opacity: phase === "out" ? 0 : 1,
      }}
    >
      {/* Logo */}
      <div
        style={{
          transition: "opacity 0.6s ease, transform 0.6s ease",
          opacity: phase === "in" ? 0 : 1,
          transform: phase === "in" ? "scale(0.85)" : "scale(1)",
        }}
        className="flex flex-col items-center gap-4"
      >
        <img
          src={`${import.meta.env.BASE_URL}assets/uploads/homeScreenLogo-1.jpeg`}
          alt="Gopinath Hotel"
          className="w-32 h-32 rounded-2xl object-contain shadow-lg border-2 border-orange-100"
        />
        <div className="text-center">
          <h1 className="text-2xl font-bold text-orange-500 tracking-wide">
            Gopinath Hotel
          </h1>
          <p className="text-sm text-gray-400 mt-1">Point of Sale System</p>
        </div>
      </div>

      {/* Loading dots */}
      <div
        className="absolute bottom-16 flex gap-2"
        style={{
          transition: "opacity 0.6s ease",
          opacity: phase === "in" ? 0 : 1,
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-orange-400"
            style={{
              animation: "bounce 1s infinite",
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <p className="absolute bottom-8 text-xs text-gray-300">
        Powered By NextYU Solution
      </p>

      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-6px); }
        }
      `}</style>
    </div>
  );
}
