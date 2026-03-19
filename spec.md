# Gopinath Hotel POS - Database Persistence Fix

## Current State
- MenuContext uses localStorage as primary storage; canister is secondary
- addItem assigns a temp ID locally, then replaces with canister ID -- causes mismatch on refresh
- Orders stored only in localStorage by date key; canister analytics may not match
- Dashboard analytics fetched from canister but may diverge from local state

## Requested Changes (Diff)

### Add
- Loading spinner while canister data loads on mount
- DB Status indicator (green/red dot) in header showing canister connectivity

### Modify
- MenuContext: canister is single source of truth. On mount, load from canister only. On add/edit/delete/toggle -- await canister call, then re-fetch full list from canister to sync UI. Remove localStorage as primary; keep only as loading cache.
- useOrders: Remove localStorage order storage. Dashboard analytics always from canister getAnalytics(). addOrder triggers re-fetch of analytics after payment.
- PaymentScreen: After cash/QR payment confirmed, call api.getAnalytics() to refresh dashboard.

### Remove
- localStorage as primary data store for menu items
- Temp ID pattern in addItem
- localStorage order storage (STORAGE_KEY for orders by date)

## Implementation Plan
1. Rewrite MenuContext: canister-first, await all mutations, re-fetch after each mutation
2. Rewrite useOrders: remove localStorage orders; analytics always from canister; expose refreshAnalytics
3. Add DBStatusIndicator component (green dot = connected)
4. Update DashboardScreen to show DB status
5. Validate and deploy
