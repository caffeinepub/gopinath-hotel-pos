import { ArrowLeft, Printer } from "lucide-react";
import { HeaderClock } from "../components/HeaderClock";
import type { PaymentData } from "../types/payment";

interface PrintBillScreenProps {
  paymentData: PaymentData;
  onBack: () => void;
  darkMode: boolean;
  hotelSettings: { hotelName: string };
}

function DashedDivider() {
  return <div className="border-t border-dashed border-gray-300 my-2" />;
}

function Row({
  label,
  value,
  bold,
  large,
}: { label: string; value: string; bold?: boolean; large?: boolean }) {
  return (
    <div
      className={`flex justify-between text-sm ${
        bold ? "font-bold" : ""
      } ${large ? "text-base" : ""}`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

export function PrintBillScreen({
  paymentData,
  onBack,
  darkMode,
  hotelSettings,
}: PrintBillScreenProps) {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, "0");
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, "0");
  const mins = String(now.getMinutes()).padStart(2, "0");
  const dateStr = `${day}/${month}/${year}  ${hours}:${mins}`;

  const bg = darkMode ? "bg-gray-900" : "bg-gray-50";
  const text = darkMode ? "text-white" : "text-gray-800";
  const headerBg = darkMode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-gray-100";

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      {/* Header — shows ONLY "Print Bill" centered, no hotel name/POS text */}
      <header
        className={`${headerBg} border-b px-6 py-0 flex items-center sticky top-0 z-10 shadow-xs print:hidden`}
      >
        <div className="flex items-center h-16 w-full">
          <button
            type="button"
            onClick={onBack}
            data-ocid="printbill.back.button"
            className={`w-9 h-9 mr-3 rounded-xl flex items-center justify-center transition-colors ${
              darkMode
                ? "hover:bg-gray-700 text-gray-300"
                : "hover:bg-gray-100 text-gray-600"
            }`}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className={`font-bold text-xl tracking-wider ${text}`}>
              Print Bill
            </h1>
          </div>
          <HeaderClock darkMode={darkMode} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-300" />
      </header>

      <div className="flex-1 flex flex-col items-center justify-start p-4 py-6">
        {/* Receipt Card */}
        <div
          id="print-receipt"
          className="w-full max-w-sm bg-white rounded-2xl shadow-lg border-2 border-dashed border-gray-200 p-5 font-mono text-gray-800"
        >
          {/* Hotel Header — hotel name stays in the receipt content */}
          <div className="text-center mb-3">
            <h1 className="text-xl font-bold tracking-widest">
              {hotelSettings.hotelName.toUpperCase()}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">
              Restaurant &amp; Catering
            </p>
          </div>

          <DashedDivider />

          <p className="text-xs text-center text-gray-500">{dateStr}</p>

          <DashedDivider />

          {/* Customer Information */}
          {(paymentData.customerName || paymentData.mobile) && (
            <>
              <p className="text-xs font-bold uppercase text-gray-400 mb-1">
                Customer
              </p>
              {paymentData.customerName && (
                <Row label="Name" value={paymentData.customerName} />
              )}
              {paymentData.mobile && (
                <Row label="Mobile" value={paymentData.mobile} />
              )}
              <DashedDivider />
            </>
          )}

          {/* Bill Details */}
          <div className="grid grid-cols-3 text-xs font-bold uppercase text-gray-400 mb-1">
            <span>Item</span>
            <span className="text-center">Qty</span>
            <span className="text-right">Price</span>
          </div>

          {paymentData.cart.map((c) => (
            <div
              key={c.item.id}
              className="grid grid-cols-3 text-xs mb-1 gap-x-1"
            >
              {/* Full item name — no truncation */}
              <span className="break-words col-span-1 leading-tight">
                {c.item.name}
              </span>
              <span className="text-center">{c.qty}</span>
              <span className="text-right">&#8377;{c.item.price * c.qty}</span>
            </div>
          ))}

          <DashedDivider />

          <Row label="Subtotal" value={`\u20B9${paymentData.subtotal}`} />
          {paymentData.gstEnabled && (
            <Row
              label={`GST (${paymentData.gstRate ?? 18}%)`}
              value={`\u20B9${paymentData.gstAmount}`}
            />
          )}

          <DashedDivider />

          <Row label="TOTAL" value={`\u20B9${paymentData.total}`} bold large />

          <DashedDivider />

          <Row
            label="Payment Mode"
            value={paymentData.paymentMode === "QR" ? "QR" : "Cash"}
          />

          <DashedDivider />

          <div className="text-center mt-2">
            <p className="text-xs text-gray-500">Thank you. Visit again.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full max-w-sm mt-5 print:hidden flex flex-col gap-3">
          <button
            type="button"
            data-ocid="printbill.print.primary_button"
            onClick={handlePrint}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold text-lg shadow-md hover:shadow-orange-200 hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] flex items-center justify-center gap-2"
          >
            <Printer className="w-5 h-5" />
            Print Bill
          </button>
        </div>
      </div>

      <style>{`
        @media print {
          body * { visibility: hidden; }
          #print-receipt, #print-receipt * { visibility: visible; }
          #print-receipt { position: fixed; left: 0; top: 0; width: 100%; }
        }
      `}</style>
    </div>
  );
}
