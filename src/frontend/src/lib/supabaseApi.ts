// Supabase API stubs — all operations are no-ops when supabase is null.
// The actor (ICP backend) is the primary data source.

// ---- MENU ITEMS ----
export async function fetchMenuItems() {
  return null;
}

export async function insertMenuItem(_item: {
  name: string;
  price: number;
  category: string;
  available: boolean;
  image_url?: string;
}) {
  return null;
}

export async function updateMenuItem(
  _id: string,
  _updates: Partial<{
    name: string;
    price: number;
    category: string;
    available: boolean;
    image_url: string;
  }>,
) {
  return null;
}

export async function deleteMenuItem(_id: string) {
  return null;
}

// ---- ORDERS ----
export async function createOrder(_orderData: {
  items: unknown;
  total: number;
  payment_mode: string;
  payment_status: string;
}) {
  return null;
}

export async function updateOrderPaymentStatus(
  _orderId: string,
  _status: string,
) {
  return null;
}

// ---- PAYMENTS ----
export async function insertPayment(_payment: {
  order_id: string;
  amount: number;
  status: string;
  transaction_id?: string;
}) {
  return null;
}

// ---- ANALYTICS ----
export async function fetchTodayAnalytics() {
  return null;
}
