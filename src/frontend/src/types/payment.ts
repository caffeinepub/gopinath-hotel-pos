import type { MenuItem } from "../context/MenuContext";

export interface CartItem {
  item: MenuItem;
  qty: number;
}

export interface PaymentData {
  customerName: string;
  mobile: string;
  gstEnabled: boolean;
  gstRate: number;
  gstAmount: number;
  subtotal: number;
  total: number;
  paymentMode: "Cash" | "QR";
  amountReceived: number;
  balance: number;
  cart: CartItem[];
}
