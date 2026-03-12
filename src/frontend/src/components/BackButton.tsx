import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  onClick: () => void;
  ocid?: string;
  className?: string;
}

export function BackButton({ onClick, ocid, className }: BackButtonProps) {
  return (
    <button
      onClick={onClick}
      data-ocid={ocid}
      type="button"
      aria-label="Go back"
      className={cn(
        "w-10 h-10 md:w-12 md:h-12 rounded-full border-2 border-border",
        "flex items-center justify-center bg-white",
        "hover:border-orange-start hover:bg-orange-50 transition-colors",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-start",
        className,
      )}
    >
      <ArrowLeft className="w-5 h-5 md:w-6 md:h-6 text-foreground" />
    </button>
  );
}
