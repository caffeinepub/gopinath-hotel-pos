import Array "mo:base/Array";
import Nat "mo:base/Nat";
import Time "mo:base/Time";
import Float "mo:base/Float";
import Text "mo:base/Text";

actor {

  type MenuItem = {
    id        : Text;
    name      : Text;
    price     : Float;
    category  : Text;
    available : Bool;
  };

  type OrderItem = {
    itemId : Text;
    name   : Text;
    price  : Float;
    qty    : Nat;
  };

  type Order = {
    id            : Text;
    items         : [OrderItem];
    total         : Float;
    paymentMode   : Text;
    paymentStatus : Text;
    createdAt     : Int;
  };

  type Payment = {
    id            : Text;
    orderId       : Text;
    amount        : Float;
    status        : Text;
    transactionId : Text;
  };

  type Settings = {
    upiId       : Text;
    accountName : Text;
  };

  type Analytics = {
    todaySales  : Float;
    todayOrders : Nat;
    topItem     : Text;
  };

  // Stable state -- persists across upgrades
  stable var menuItems : [MenuItem] = [];
  stable var orders    : [Order]    = [];
  stable var payments  : [Payment]  = [];
  stable var settings  : Settings   = { upiId = ""; accountName = "" };
  stable var nextId    : Nat        = 1;
  stable var seeded    : Bool       = false;

  // Seed default menu once
  if (not seeded) {
    menuItems := [
      { id = "1"; name = "Paneer Butter Masala"; price = 180.0; category = "Veg";       available = true },
      { id = "2"; name = "Chicken Biryani";      price = 250.0; category = "Non-Veg";   available = true },
      { id = "3"; name = "Masala Chai";          price = 40.0;  category = "Drinks";    available = true },
      { id = "4"; name = "Veg Spring Rolls";     price = 120.0; category = "Snacks";    available = true },
      { id = "5"; name = "Mutton Curry";         price = 320.0; category = "Non-Veg";   available = true },
      { id = "6"; name = "Mango Lassi";          price = 80.0;  category = "Drinks";    available = true },
      { id = "7"; name = "Vanilla Ice Cream";    price = 60.0;  category = "Ice Cream"; available = true },
    ];
    nextId := 8;
    seeded := true;
  };

  func newId() : Text {
    let id = nextId;
    nextId += 1;
    Nat.toText(id);
  };

  // ── MENU ──────────────────────────────────────────────────────────────────

  public query func getMenu() : async [MenuItem] { menuItems };

  public func addMenuItem(name : Text, price : Float, category : Text) : async Text {
    let id = newId();
    let item : MenuItem = { id; name; price; category; available = true };
    menuItems := Array.append<MenuItem>(menuItems, [item]);
    id;
  };

  public func updateMenuItem(id : Text, name : Text, price : Float, category : Text) : async Bool {
    var found = false;
    menuItems := Array.map<MenuItem, MenuItem>(menuItems, func(item : MenuItem) : MenuItem {
      if (item.id == id) {
        found := true;
        { id; name; price; category; available = item.available };
      } else {
        item;
      };
    });
    found;
  };

  public func deleteMenuItem(id : Text) : async Bool {
    let before = menuItems.size();
    menuItems := Array.filter<MenuItem>(menuItems, func(item : MenuItem) : Bool { item.id != id });
    menuItems.size() < before;
  };

  public func toggleAvailability(id : Text) : async Bool {
    var found = false;
    menuItems := Array.map<MenuItem, MenuItem>(menuItems, func(item : MenuItem) : MenuItem {
      if (item.id == id) {
        found := true;
        { id = item.id; name = item.name; price = item.price;
          category = item.category; available = not item.available };
      } else {
        item;
      };
    });
    found;
  };

  // ── ORDERS ────────────────────────────────────────────────────────────────

  public func createOrder(items : [OrderItem], total : Float, paymentMode : Text) : async Text {
    let id = newId();
    let order : Order = {
      id; items; total; paymentMode;
      paymentStatus = "pending";
      createdAt = Time.now();
    };
    orders := Array.append<Order>(orders, [order]);
    id;
  };

  public query func getOrders() : async [Order] { orders };

  public query func getOrderById(id : Text) : async ?Order {
    Array.find<Order>(orders, func(o : Order) : Bool { o.id == id });
  };

  // ── PAYMENTS ──────────────────────────────────────────────────────────────

  public func startPayment(orderId : Text, amount : Float) : async Text {
    let id = newId();
    let payment : Payment = { id; orderId; amount; status = "pending"; transactionId = "" };
    payments := Array.append<Payment>(payments, [payment]);
    id;
  };

  public query func getPaymentStatus(orderId : Text) : async Text {
    switch (Array.find<Payment>(payments, func(p : Payment) : Bool { p.orderId == orderId })) {
      case (?p) { p.status };
      case null  { "not_found" };
    };
  };

  public func confirmPayment(orderId : Text) : async Bool {
    var found = false;
    payments := Array.map<Payment, Payment>(payments, func(p : Payment) : Payment {
      if (p.orderId == orderId) {
        found := true;
        { id = p.id; orderId = p.orderId; amount = p.amount;
          status = "paid"; transactionId = "confirmed" };
      } else { p };
    });
    orders := Array.map<Order, Order>(orders, func(o : Order) : Order {
      if (o.id == orderId) {
        { id = o.id; items = o.items; total = o.total;
          paymentMode = o.paymentMode; paymentStatus = "paid"; createdAt = o.createdAt };
      } else { o };
    });
    found;
  };

  // ── ANALYTICS ─────────────────────────────────────────────────────────────

  public query func getAnalytics() : async Analytics {
    let oneDayNs : Int = 86_400_000_000_000;
    let cutoff   : Int = Time.now() - oneDayNs;

    var sales   : Float = 0.0;
    var count   : Nat   = 0;
    var topName : Text  = "";
    var topQty  : Nat   = 0;

    // Count item frequencies using parallel arrays
    var nameList : [Text] = [];
    var qtyList  : [Nat]  = [];

    for (o in orders.vals()) {
      if (o.createdAt >= cutoff and o.paymentStatus == "paid") {
        sales += o.total;
        count += 1;
        for (oi in o.items.vals()) {
          var matched = false;
          var newQtys : [Nat] = [];
          var i = 0;
          for (n in nameList.vals()) {
            if (n == oi.name) {
              matched := true;
              newQtys := Array.append<Nat>(newQtys, [qtyList[i] + oi.qty]);
            } else {
              newQtys := Array.append<Nat>(newQtys, [qtyList[i]]);
            };
            i += 1;
          };
          if (matched) {
            qtyList := newQtys;
          } else {
            nameList := Array.append<Text>(nameList, [oi.name]);
            qtyList  := Array.append<Nat>(qtyList, [oi.qty]);
          };
        };
      };
    };

    var j = 0;
    for (n in nameList.vals()) {
      if (qtyList[j] > topQty) {
        topQty  := qtyList[j];
        topName := n;
      };
      j += 1;
    };

    { todaySales = sales; todayOrders = count; topItem = topName };
  };

  // ── SETTINGS ──────────────────────────────────────────────────────────────

  public query func getSettings() : async Settings { settings };

  public func saveSettings(upiId : Text, accountName : Text) : async Bool {
    settings := { upiId; accountName };
    true;
  };

};
