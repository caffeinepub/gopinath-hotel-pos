import { Switch } from "@/components/ui/switch";
import {
  AlertTriangle,
  ArrowLeft,
  ClipboardList,
  CreditCard,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Footer } from "../components/Footer";
import { HeaderClock } from "../components/HeaderClock";
import { QRCodeImage } from "../components/QRCodeImage";
import { useActor } from "../hooks/useActor";
import { isSupabaseConfigured } from "../lib/supabase";
import {
  insertPayment,
  createOrder as supabaseCreateOrder,
  updateOrderPaymentStatus,
} from "../lib/supabaseApi";
import type { CartItem, PaymentData } from "../types/payment";

interface HotelSettingsProps {
  hotelName: string;
  upiId: string;
  accountName: string;
}

interface PaymentScreenProps {
  cart: CartItem[];
  onPaymentComplete: (data: PaymentData) => void;
  onBack: () => void;
  darkMode: boolean;
  hotelSettings: HotelSettingsProps;
}

export function PaymentScreen({
  cart,
  onPaymentComplete,
  onBack,
  darkMode,
  hotelSettings,
}: PaymentScreenProps) {
  const { actor } = useActor();

  const [customerName, setCustomerName] = useState("");
  const [mobile, setMobile] = useState("");
  const [gstEnabled, setGstEnabled] = useState(false);
  const [gstRate, setGstRate] = useState("18");
  const [paymentMode, setPaymentMode] = useState<"Cash" | "QR">("Cash");
  const [amountReceived, setAmountReceived] = useState("");
  const [qrSuccess, setQrSuccess] = useState(false);
  const [transactionId, setTransactionId] = useState<string>("");
  const [isPolling, setIsPolling] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<bigint | null>(null);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const successFiredRef = useRef(false);
  const actorRef = useRef(actor);

  const latestPaymentRef = useRef({
    customerName,
    mobile,
    gstEnabled,
    gstRate: 0,
    gstAmount: 0,
    subtotal: 0,
    total: 0,
    cart,
    onPaymentComplete,
    upiId: hotelSettings.upiId,
  });

  const subtotal = cart.reduce((sum, c) => sum + c.item.price * c.qty, 0);
  const parsedGstRate = Math.max(0, Math.min(100, Number(gstRate) || 0));
  const gstAmount = gstEnabled
    ? Math.round((subtotal * parsedGstRate) / 100)
    : 0;
  const total = subtotal + gstAmount;
  const balance = amountReceived ? Number(amountReceived) - total : 0;

  actorRef.current = actor;
  latestPaymentRef.current = {
    customerName,
    mobile,
    gstEnabled,
    gstRate: parsedGstRate,
    gstAmount,
    subtotal,
    total,
    cart,
    onPaymentComplete,
    upiId: hotelSettings.upiId,
  };

  const upiQrValue = hotelSettings.upiId
    ? `upi://pay?pa=${hotelSettings.upiId}&pn=GopinathHotel&am=${total}`
    : "";

  const clearPollingInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsPolling(false);
  }, []);

  useEffect(() => {
    if (paymentMode !== "QR" || !hotelSettings.upiId) {
      clearPollingInterval();
      setQrSuccess(false);
      setTransactionId("");
      setCurrentOrderId(null);
      successFiredRef.current = false;
      return;
    }

    successFiredRef.current = false;

    const startPolling = (orderId: bigint | null, txnId: string) => {
      setIsPolling(true);
      intervalRef.current = setInterval(async () => {
        if (successFiredRef.current) return;
        const currentActor = actorRef.current;
        const { total: amt, upiId } = latestPaymentRef.current;

        try {
          let paymentConfirmed = false;

          // Primary: use actor getPaymentStatus if we have an orderId
          if (currentActor && orderId !== null) {
            const status = await currentActor.getPaymentStatus(orderId);
            if (status === "paid" || status === "completed") {
              paymentConfirmed = true;
            }
          } else if (currentActor && txnId) {
            // Fallback: check via checkPaymentStatus
            const result = await currentActor.checkPaymentStatus(
              txnId,
              BigInt(amt),
              upiId,
            );
            if (result.status === "success") {
              paymentConfirmed = true;
            }
          }

          if (paymentConfirmed && !successFiredRef.current) {
            successFiredRef.current = true;
            clearPollingInterval();
            // Confirm payment in actor
            if (currentActor && orderId !== null) {
              try {
                await currentActor.confirmPayment(orderId);
              } catch (e) {
                console.error("confirmPayment failed", e);
              }
            }
            setQrSuccess(true);
            setTimeout(async () => {
              const p = latestPaymentRef.current;
              const data: PaymentData = {
                customerName: p.customerName,
                mobile: p.mobile,
                gstEnabled: p.gstEnabled,
                gstRate: p.gstRate,
                gstAmount: p.gstAmount,
                subtotal: p.subtotal,
                total: p.total,
                paymentMode: "QR",
                amountReceived: p.total,
                balance: 0,
                cart: p.cart,
              };

              p.onPaymentComplete(data);
            }, 1500);
          }
        } catch {
          // keep polling on error
        }
      }, 3000);
    };

    const initQrPayment = async () => {
      const currentActor = actorRef.current;
      const { total: amt, upiId, cart: currentCart } = latestPaymentRef.current;

      let orderId: bigint | null = null;
      let txnId = `txn_${Date.now()}`;

      if (currentActor) {
        try {
          // Create order in actor
          const itemsJson = JSON.stringify(
            currentCart.map((c) => ({
              name: c.item.name,
              qty: c.qty,
              price: c.item.price,
            })),
          );
          orderId = await currentActor.createOrder(
            itemsJson,
            BigInt(amt),
            "QR",
          );
          setCurrentOrderId(orderId);

          // Start payment
          const returnedTxn = await currentActor.startPayment(
            orderId,
            BigInt(amt),
            upiId,
          );
          txnId = returnedTxn || txnId;
        } catch (e) {
          console.error("Actor createOrder/startPayment failed", e);
          // Fallback: generate txn id
          try {
            txnId = await currentActor.generateTransactionId();
          } catch {
            txnId = `txn_${Date.now()}`;
          }
        }
      }

      setTransactionId(txnId);
      startPolling(orderId, txnId);
    };

    initQrPayment();

    return () => {
      clearPollingInterval();
    };
  }, [paymentMode, hotelSettings.upiId, clearPollingInterval]);

  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

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

  const handleCashConfirm = async () => {
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

    // Primary: use actor to create and confirm order
    if (actor) {
      try {
        const itemsJson = JSON.stringify(
          cart.map((c) => ({
            name: c.item.name,
            qty: c.qty,
            price: c.item.price,
          })),
        );
        const orderId = await actor.createOrder(
          itemsJson,
          BigInt(total),
          "Cash",
        );
        await actor.confirmPayment(orderId);
      } catch (e) {
        console.error("Actor createOrder/confirmPayment failed (Cash)", e);
      }
    }

    onPaymentComplete(data);
  };

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      <style>{`
        @keyframes tickBounce {
          0% { transform: scale(0); opacity: 0; }
          60% { transform: scale(1.2); opacity: 1; }
          80% { transform: scale(0.9); }
          100% { transform: scale(1); opacity: 1; }
        }
        .tick-bounce { animation: tickBounce 0.6s cubic-bezier(0.36,0.07,0.19,0.97) forwards; }
        @keyframes spinAnim { to { transform: rotate(360deg); } }
        .spin-slow { animation: spinAnim 1.5s linear infinite; }
      `}</style>

      {/* Header */}
      <header
        className={`${headerBg} border-b px-6 py-0 flex items-center sticky top-0 z-10 shadow-xs`}
      >
        <div className="flex items-center h-16 w-full">
          <button
            type="button"
            onClick={onBack}
            data-ocid="payment.back.button"
            className="flex items-center gap-1 text-orange-500 font-semibold text-sm hover:text-orange-600 transition-colors mr-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <div className="flex-1 flex justify-center">
            <h1 className={`font-bold text-xl tracking-wider ${text}`}>
              Payment
            </h1>
          </div>
          <HeaderClock darkMode={darkMode} />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-orange-300" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-lg mx-auto w-full space-y-4">
        {/* Total Amount - Top */}
        <div
          className={`${cardBg} rounded-2xl border ${border} p-5 flex items-center justify-between`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-orange-500" />
            </div>
            <span className={`font-bold text-base ${text}`}>Total Amount</span>
          </div>
          <span className="text-2xl font-extrabold text-green-600">
            &#8377;{total}
          </span>
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
                  &#8377;{gstAmount}
                </span>
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

        {/* Bill Summary */}
        <div className={`${cardBg} rounded-2xl border ${border} p-4`}>
          <h2
            className={`font-bold text-base mb-3 flex items-center gap-2 ${text}`}
          >
            <ClipboardList className="w-5 h-5 text-orange-500" />
            Bill Summary
          </h2>
          <div className="space-y-2">
            {cart.map((c) => (
              <div key={c.item.id} className="flex justify-between text-sm">
                <span className={subText}>
                  {c.item.name} x {c.qty}
                </span>
                <span className="font-semibold text-green-600">
                  &#8377;{c.item.price * c.qty}
                </span>
              </div>
            ))}
          </div>
          {gstEnabled && (
            <div
              className={`mt-3 pt-3 border-t ${border} flex justify-between text-sm font-semibold`}
            >
              <span className={subText}>GST ({parsedGstRate}%)</span>
              <span className="text-green-600">&#8377;{gstAmount}</span>
            </div>
          )}
          <div
            className={`mt-3 pt-3 border-t ${border} flex justify-between font-bold`}
          >
            <span className={text}>Total</span>
            <span className="text-green-600 text-lg">&#8377;{total}</span>
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
                  &#8377;{balance.toFixed(0)}
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
                <div
                  className="tick-bounce w-20 h-20 rounded-full bg-green-100 flex items-center justify-center"
                  style={{ boxShadow: "0 0 0 8px rgba(34,197,94,0.15)" }}
                >
                  <svg
                    viewBox="0 0 52 52"
                    className="w-12 h-12"
                    fill="none"
                    role="img"
                    aria-label="Payment success"
                  >
                    <circle cx="26" cy="26" r="25" fill="#22c55e" />
                    <path
                      d="M14 27l8 8 16-16"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-green-600 font-bold text-xl">
                  Payment Received
                </p>
                <p className={`text-sm ${subText}`}>Navigating to bill...</p>
              </div>
            ) : !hotelSettings.upiId ? (
              <div
                data-ocid="payment.upi_warning.error_state"
                className="flex items-start gap-3 rounded-xl bg-orange-50 border border-orange-200 p-4"
              >
                <AlertTriangle className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-orange-700 text-sm">
                    UPI not configured
                  </p>
                  <p className="text-xs text-orange-600 mt-0.5">
                    Please set Owner UPI ID in Settings.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 py-2">
                <div className="p-3 bg-white rounded-2xl shadow-sm border border-gray-100">
                  <QRCodeImage value={upiQrValue} size={180} />
                </div>
                <p className="text-orange-500 font-semibold text-sm text-center">
                  Customer Scan QR to Pay
                </p>
                <p className={`text-center text-xs ${subText}`}>
                  Scan using Google Pay / PhonePe / Paytm / BHIM
                </p>
                <div
                  data-ocid="payment.qr_status.panel"
                  className="flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 border border-gray-200"
                  aria-live="polite"
                >
                  <svg
                    className="w-4 h-4 spin-slow text-orange-400"
                    viewBox="0 0 24 24"
                    fill="none"
                    role="img"
                    aria-label="Waiting"
                  >
                    <title>Waiting</title>
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeDasharray="40"
                      strokeDashoffset="10"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-xs font-semibold text-gray-500 select-none">
                    {isPolling
                      ? "Waiting for customer payment..."
                      : "Initializing payment..."}
                  </span>
                </div>
                {transactionId && (
                  <span className="sr-only">
                    Transaction ID: {transactionId}
                  </span>
                )}
                {currentOrderId !== null && (
                  <span className="sr-only">
                    Order ID: {currentOrderId.toString()}
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
