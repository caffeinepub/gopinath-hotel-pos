import { Switch } from "@/components/ui/switch";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { Footer } from "../components/Footer";
import type { CartItem, PaymentData } from "../types/payment";

interface PaymentScreenProps {
  cart: CartItem[];
  onPaymentComplete: (data: PaymentData) => void;
  onBack: () => void;
  darkMode: boolean;
}

export function PaymentScreen({
  cart,
  onPaymentComplete,
  onBack,
  darkMode,
}: PaymentScreenProps) {
  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState("18");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "QR">("Cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [qrSuccess, setQrSuccess] = useState(false);

  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const parsedGstRate = Math.max(0, Math.min(100, Number(gstRate) || 0));
  const gstAmount = gstEnabled
    ? Math.round((subtotal * parsedGstRate) / 100)
    : 0;
  const total = subtotal + gstAmount;
  const balance = amountReceived ? Number(amountReceived) - total : 0;

  const bg = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const text = darkMode ? "text-white" : "text-gray-800";
  const subText = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-200";
  const headerBg = darkMode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-gray-100";
  const inputBg = darkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-200 text-gray-800 placeholder-gray-400";

  const handleCashConfirm = () => {
    const received = Number(amountReceived);
    const data: PaymentData = {
      customerName,
      mobile,
      gstEnabled,
      gstRate: parsedGstRate,
      gstAmount,
      subtotal,
      total,
      paymentMode: "Cash",
      amountReceived: received,
      balance: received - total,
      cart,
    };
    onPaymentComplete(data);
  };

  const handleQrReceived = () => {
    setQrSuccess(true);
    setTimeout(() => {
      const data: PaymentData = {
        customerName,
        mobile,
        gstEnabled,
        gstRate: parsedGstRate,
        gstAmount,
        subtotal,
        total,
        paymentMode: "QR",
        amountReceived: total,
        balance: 0,
        cart,
      };
      onPaymentComplete(data);
    }, 1800);
  };

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      {/* Header */}
      <header
        className={`${headerBg} border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-xs`}
      >
        <button
          type="button"
          onClick={onBack}
          data-ocid="payment.back.button"
          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
            darkMode
              ? "hover:bg-gray-700 text-gray-300"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className={`font-display font-bold text-xl ${text}`}>Payment</h1>
        <div className="ml-auto">
          <span className="text-sm font-bold text-green-600">₹{total}</span>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4">
        {/* Bill Summary */}
        <div className={`${cardBg} rounded-2xl border ${border} p-4`}>
          <h2 className={`font-bold text-base mb-3 ${text}`}>Bill Summary</h2>
          <div className="space-y-2">
            {cart.map((c) => (
              <div key={c.item.id} className="flex justify-between text-sm">
                <span className={subText}>
                  {c.item.name} x {c.qty}
                </span>
                <span className="font-semibold text-green-600">
                  ₹{c.item.price * c.qty}
                </span>
              </div>
            ))}
          </div>
          <div
            className={`mt-3 pt-3 border-t ${border} flex justify-between text-sm font-semibold`}
          >
            <span className={text}>Subtotal</span>
            <span className="text-green-600">₹{subtotal}</span>
          </div>
        </div>

        {/* Customer Info */}
        <div className={`${cardBg} rounded-2xl border ${border} p-4 space-y-3`}>
          <h2 className={`font-bold text-base mb-1 ${text}`}>Customer Info</h2>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            placeholder="Customer Name (Optional)"
            data-ocid="payment.customer_name.input"
            className={`w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors ${inputBg}`}
          />
          <input
            type="tel"
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            placeholder="Mobile Number (Optional)"
            data-ocid="payment.mobile.input"
            className={`w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors ${inputBg}`}
          />
        </div>

        {/* GST */}
        <div className={`${cardBg} rounded-2xl border ${border} p-4 space-y-3`}>
          <div className="flex items-center justify-between">
            <p className={`font-semibold text-sm ${text}`}>Apply GST</p>
            <Switch
              checked={gstEnabled}
              onCheckedChange={setGstEnabled}
              data-ocid="payment.gst.toggle"
            />
          </div>
          {gstEnabled && (
            <>
              <div className="flex items-center gap-3">
                <label
                  htmlFor="gst-rate-input"
                  className={`text-sm ${subText} whitespace-nowrap`}
                >
                  GST %
                </label>
                <div className="flex items-center gap-2 flex-1">
                  <input
                    id="gst-rate-input"
                    type="number"
                    value={gstRate}
                    onChange={(e) => setGstRate(e.target.value)}
                    min="0"
                    max="100"
                    placeholder="e.g. 5, 12, 18"
                    data-ocid="payment.gst_rate.input"
                    className={`w-24 h-10 px-3 rounded-xl border text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors ${inputBg}`}
                  />
                  <div className="flex gap-1">
                    {["5", "12", "18"].map((rate) => (
                      <button
                        key={rate}
                        type="button"
                        onClick={() => setGstRate(rate)}
                        data-ocid="payment.gst_preset.button"
                        className={`px-3 h-8 rounded-lg text-xs font-semibold border transition-all ${
                          gstRate === rate
                            ? "bg-orange-500 text-white border-orange-500"
                            : darkMode
                              ? "bg-transparent border-gray-600 text-gray-300"
                              : "bg-transparent border-gray-200 text-gray-600"
                        }`}
                      >
                        {rate}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className={subText}>GST ({parsedGstRate}%)</span>
                <span className="text-green-600 font-semibold">
                  ₹{gstAmount}
                </span>
              </div>
              <div
                className={`pt-2 border-t ${border} flex justify-between font-bold`}
              >
                <span className={text}>Total (with GST)</span>
                <span className="text-green-600 text-lg">₹{total}</span>
              </div>
            </>
          )}
        </div>

        {/* Payment Mode */}
        <div className={`${cardBg} rounded-2xl border ${border} p-4`}>
          <h2 className={`font-bold text-base mb-3 ${text}`}>Payment Mode</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              data-ocid="payment.cash.button"
              onClick={() => setPaymentMode("Cash")}
              className={`h-14 rounded-xl font-semibold text-base border-2 transition-all ${
                paymentMode === "Cash"
                  ? "bg-orange-500 text-white border-orange-500"
                  : darkMode
                    ? "bg-transparent border-gray-600 text-gray-300"
                    : "bg-transparent border-gray-200 text-gray-600"
              }`}
            >
              Cash
            </button>
            <button
              type="button"
              data-ocid="payment.qr.button"
              onClick={() => setPaymentMode("QR")}
              className={`h-14 rounded-xl font-semibold text-base border-2 transition-all ${
                paymentMode === "QR"
                  ? "bg-orange-500 text-white border-orange-500"
                  : darkMode
                    ? "bg-transparent border-gray-600 text-gray-300"
                    : "bg-transparent border-gray-200 text-gray-600"
              }`}
            >
              QR Payment
            </button>
          </div>
        </div>

        {/* Cash Payment */}
        {paymentMode === "Cash" && (
          <div
            className={`${cardBg} rounded-2xl border ${border} p-4 space-y-3`}
          >
            <h2 className={`font-bold text-base ${text}`}>Cash Payment</h2>
            <input
              type="number"
              value={amountReceived}
              onChange={(e) => setAmountReceived(e.target.value)}
              placeholder="Enter Amount Received"
              min={total}
              data-ocid="payment.amount_received.input"
              className={`w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors ${inputBg}`}
            />
            {amountReceived && (
              <div className="flex justify-between text-sm font-semibold">
                <span className={text}>Balance</span>
                <span
                  className={balance >= 0 ? "text-green-600" : "text-red-500"}
                >
                  ₹{balance.toFixed(0)}
                </span>
              </div>
            )}
            <button
              type="button"
              data-ocid="payment.confirm.primary_button"
              onClick={handleCashConfirm}
              disabled={!amountReceived || Number(amountReceived) < total}
              className="w-full h-14 rounded-2xl bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold text-lg shadow-md hover:shadow-orange-200 hover:scale-[1.01] transition-all duration-200 active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              Confirm Payment
            </button>
          </div>
        )}

        {/* QR Payment */}
        {paymentMode === "QR" && (
          <div
            className={`${cardBg} rounded-2xl border ${border} p-4 space-y-4`}
          >
            <h2 className={`font-bold text-base ${text}`}>QR Payment</h2>
            {qrSuccess ? (
              <div
                data-ocid="payment.success.success_state"
                className="flex flex-col items-center gap-3 py-6"
              >
                <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircle className="w-12 h-12 text-green-500" />
                </div>
                <p className="text-green-600 font-bold text-xl">
                  Payment Received
                </p>
              </div>
            ) : (
              <>
                <div className="flex flex-col items-center gap-3">
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <QRCodeSVG
                      value={`PAY:GOPINATH:${total}`}
                      size={180}
                      level="H"
                    />
                  </div>
                  <p className={`text-center text-sm ${subText}`}>
                    Scan to pay
                  </p>
                  <p className="text-2xl font-bold text-green-600">₹{total}</p>
                </div>
                <button
                  type="button"
                  data-ocid="payment.qr_received.primary_button"
                  onClick={handleQrReceived}
                  className="w-full h-14 rounded-2xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg shadow-md hover:shadow-green-200 hover:scale-[1.01] transition-all duration-200 active:scale-[0.99]"
                >
                  Payment Received
                </button>
              </>
            )}
          </div>
        )}
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
