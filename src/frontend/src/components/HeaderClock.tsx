import { useEffect, useState } from "react";

interface HeaderClockProps {
  darkMode?: boolean;
}

export function HeaderClock({ darkMode = false }: HeaderClockProps) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const dateStr = time.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const timeStr = time.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const textCls = darkMode ? "text-gray-400" : "text-gray-500";

  return (
    <div className={`flex flex-col items-end leading-tight ${textCls}`}>
      <span className="text-xs font-medium">{dateStr}</span>
      <span className="text-xs font-bold tabular-nums">{timeStr}</span>
    </div>
  );
}
