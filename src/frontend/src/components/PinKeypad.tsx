import { cn } from "@/lib/utils";

interface PinKeypadProps {
  pin: string;
  maxLength?: number;
  onKey: (key: string) => void;
  onBackspace: () => void;
  onClear: () => void;
  onSubmit: () => void;
  inputOcid?: string;
  submitOcid?: string;
}

const PIN_POSITIONS = [0, 1, 2, 3];

export function PinKeypad({
  pin,
  maxLength = 4,
  onKey,
  onBackspace,
  onClear,
  onSubmit,
  inputOcid,
  submitOcid,
}: PinKeypadProps) {
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9"];
  const positions = PIN_POSITIONS.slice(0, maxLength);

  return (
    <div
      className="flex flex-col items-center gap-6 w-full"
      data-ocid={inputOcid}
    >
      {/* PIN circles */}
      <div className="flex gap-3 justify-center">
        {positions.map((pos) => (
          <div
            key={pos}
            className={cn(
              "rounded-full border-2 transition-all duration-200 flex items-center justify-center",
              "w-8 h-8",
              pin.length > pos
                ? "border-orange-400 bg-white"
                : "border-gray-300 bg-white",
            )}
          >
            {pin.length > pos && (
              <div className="w-3 h-3 rounded-full bg-orange-500" />
            )}
          </div>
        ))}
      </div>

      {/* Keypad grid */}
      <div className="grid grid-cols-3 gap-3 w-full max-w-[280px] md:max-w-[320px]">
        {keys.map((k) => (
          <button
            key={k}
            onClick={() => pin.length < maxLength && onKey(k)}
            className="keypad-btn rounded-xl h-16 md:h-18 text-xl md:text-2xl font-semibold text-foreground shadow-xs font-body"
            type="button"
          >
            {k}
          </button>
        ))}
        {/* Bottom row: X, 0, C */}
        <button
          onClick={onBackspace}
          className="keypad-btn rounded-xl h-16 md:h-18 flex items-center justify-center text-xl md:text-2xl font-semibold text-muted-foreground shadow-xs font-body"
          type="button"
          aria-label="Delete last digit"
        >
          X
        </button>
        <button
          onClick={() => pin.length < maxLength && onKey("0")}
          className="keypad-btn rounded-xl h-16 md:h-18 text-xl md:text-2xl font-semibold text-foreground shadow-xs font-body"
          type="button"
        >
          0
        </button>
        <button
          onClick={onClear}
          className="keypad-btn rounded-xl h-16 md:h-18 flex items-center justify-center text-xl md:text-2xl font-semibold text-muted-foreground shadow-xs font-body"
          type="button"
          aria-label="Clear all digits"
        >
          C
        </button>
      </div>

      {/* Submit button */}
      <button
        onClick={onSubmit}
        data-ocid={submitOcid}
        className="btn-glow w-full max-w-[280px] md:max-w-[320px] h-14 md:h-16 rounded-2xl text-white font-semibold text-lg font-body shadow-md"
        type="button"
      >
        Submit
      </button>
    </div>
  );
}
