# Gopinath Hotel POS — Full Stack Migration

## Current State
The app uses Supabase for backend calls but requires manual credential entry in Settings. Without credentials it falls back to localStorage, meaning no API calls appear in the Network tab. The Motoko backend currently only handles payment status polling via HTTP outcalls.

## Requested Changes (Diff)

### Add
- Motoko backend: stable storage for menu_items, orders, payments, users
- Backend functions: login (PIN auth), getMenu, addMenuItem, updateMenuItem, deleteMenuItem, toggleAvailability, createOrder, getOrders, getOrder, startPayment, getPaymentStatus, getAnalytics
- Frontend API layer (actorApi.ts) that wraps all actor calls
- Frontend API calls visible in browser Network tab for every user action

### Modify
- MenuContext: use actor for all CRUD (add, edit, delete, toggle availability)
- PaymentScreen: call actor createOrder on checkout, startPayment for QR, poll getPaymentStatus
- DashboardScreen: call actor getAnalytics on mount
- OwnerLoginScreen / StaffLoginScreen: call actor login for PIN verification
- Remove Supabase dependency from data flow (keep lib files but no longer primary)

### Remove
- localStorage-only fallback as primary data path (actor is always used)
- Supabase as required config (it becomes optional/legacy)

## Implementation Plan
1. Rewrite Motoko backend with stable var storage for all 5 data collections
2. Expose login, menu CRUD, order creation, payment tracking, and analytics query functions
3. Regenerate backend.d.ts to include new typed interfaces
4. Create src/frontend/src/lib/actorApi.ts wrapping all actor methods
5. Update MenuContext to call actorApi for all operations
6. Update PaymentScreen to call actorApi.createOrder and actorApi.startPayment / pollPaymentStatus
7. Update DashboardScreen to call actorApi.getAnalytics
8. Update login screens to call actorApi.login
9. Validate, build, and deploy
