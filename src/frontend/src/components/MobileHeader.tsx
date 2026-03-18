import { useEffect, useState } from "react";

const LOGO_PATH = `${import.meta.env.BASE_URL}assets/uploads/homeScreenLogo-1.jpeg`;

interface MobileHeaderProps {
  loggedInUser: string;
  darkMode: boolean;
}

export function MobileHeader({ loggedInUser, darkMode }: MobileHeaderProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const timeStr = time.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const bg = darkMode
    ? "bg-gray-800 border-gray-700"
    : "bg-white border-gray-200";
  const text = darkMode ? "text-white" : "text-gray-800";
  const sub = darkMode ? "text-gray-400" : "text-gray-500";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-30 border-b ${bg} flex items-center justify-between px-4 py-2 lg:hidden`}
      style={{ paddingTop: "env(safe-area-inset-top, 8px)" }}
    >
      {/* Logo + Name */}
      <div className="flex items-center gap-2">
        <img
          src={LOGO_PATH}
          alt="Logo"
          className="w-10 h-10 object-contain rounded-lg"
        />
        <div>
          <p className={`font-bold text-xs uppercase tracking-wide ${text}`}>
            Gopinath Hotel
          </p>
          <p className={`text-[10px] ${sub}`}>POS System</p>
        </div>
      </div>

      {/* Date/Time + User */}
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className={`text-[10px] font-semibold ${text}`}>{timeStr}</p>
          <p className={`text-[10px] ${sub}`}>{dateStr}</p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
            <span className="text-orange-600 font-bold text-xs">
              {loggedInUser.charAt(0).toUpperCase()}
            </span>
          </div>
          <span
            className={`text-xs font-semibold ${text} max-w-[60px] truncate`}
          >
            {loggedInUser}
          </span>
        </div>
      </div>
    </header>
  );
}
