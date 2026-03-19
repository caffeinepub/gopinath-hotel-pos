# Gopinath Hotel POS

## Current State
- Payment screen shows QR with UPI amount, auto-polls every 3s, auto-confirms after ~15s simulation
- All users (Owner and Staff) see all nav items including Settings
- No role-based access restrictions in navigation or screens
- loggedInUser stored as string name only (no role)

## Requested Changes (Diff)

### Add
- Role tracking: save `userRole` ("owner" | "staff") in session alongside user name
- Role-based nav: Settings item hidden in AppSidebar and BottomNav for staff role
- Route guard: if staff tries to navigate to settings screen, redirect to dashboard

### Modify
- Login flow: OwnerLoginScreen sets role "owner", StaffLoginScreen sets role "staff" when calling handleLogin
- App.tsx handleLogin accepts role param, saves to state and session
- AppSidebar: filter out Settings nav item when role is staff
- BottomNav: filter out Settings nav item when role is staff
- Payment screen QR: ensure bill amount is clearly displayed above QR code with total amount
- Payment auto-confirm simulation: keep current 15s auto-confirm (no manual button)

### Remove
- Nothing removed

## Implementation Plan
1. Update App.tsx: add `userRole` state ("owner"|"staff"), update session save/load, update handleLogin to accept role
2. Update OwnerLoginScreen and StaffLoginScreen to pass role in onLogin callback
3. Update AppSidebar: accept `userRole` prop, filter Settings from navItems for staff
4. Update BottomNav: accept `userRole` prop, filter Settings for staff
5. In App.tsx navigate function: if staff tries to go to settings, redirect to dashboard
6. Payment screen: add clear amount display above QR code showing "Pay ₹{total}"
