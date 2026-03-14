# Gopinath Hotel POS

## Current State
Full-stack ICP app with Motoko backend providing stable storage for users, menu_items, orders, payments, and analytics. Frontend React app uses canister API calls. All API calls are visible in the Network tab as ICP canister requests.

## Requested Changes (Diff)

### Add
- Explicit `/api/*` style fetch wrapper in the frontend that routes all calls through a clean `api.ts` service layer
- All screens must use this api service for: login, menu CRUD, order creation, payment start/status polling, analytics
- QR payment: create order first, then generate QR, poll every 3 seconds for PAID status, auto-redirect to Print Bill
- No manual cashier confirmation button on the payment screen

### Modify
- Frontend API calls must be explicit and readable (fetch to canister endpoints) so they show clearly in the Network tab
- QR payment flow: 1) create order 2) generate QR with UPI link + amount 3) poll payment status every 3s 4) on PAID -> show green tick -> navigate to Print Bill
- Dashboard analytics fetched from backend on load
- Menu items fetched from backend (not localStorage)
- Settings UPI ID persisted in backend

### Remove
- Any remaining localStorage-only data paths
- Supabase references
- Manual payment confirmation button

## Implementation Plan
1. Update Motoko backend to ensure all required endpoints exist: login, getMenu, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability, createOrder, getOrders, getOrder, startPayment, getPaymentStatus, getAnalytics, saveSettings, getSettings
2. Update frontend to use a centralized api.ts service calling canister methods
3. Fix QR payment flow: createOrder -> startPayment -> poll getPaymentStatus every 3s -> PAID -> navigate
4. Ensure all screens load data from backend on mount
5. Validate and deploy
