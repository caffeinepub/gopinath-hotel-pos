import Array "mo:core/Array";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Float "mo:core/Float";

actor {

  // ─── TYPES ───────────────────────────────────────────────────────────────

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

  // ─── STABLE STATE (persists across upgrades and refreshes) ───────────────

  stable var menuItems : [MenuItem] = [];
  stable var orders    : [Order]    = [];
  stable var payments  : [Payment]  = [];
  stable var settings  : Settings   = { upiId = ""; accountName = "" };
  stable var nextId    : Nat        = 1;
  stable var seeded    : Bool       = false;

  // ─── SEED (only once, never resets) ──────────────────────────────────────

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
    id.toText();
  };

  // ─── MENU ─────────────────────────────────────────────────────────────────

  public query func getMenu() : async [MenuItem] { menuItems };

  public func addMenuItem(name : Text, price : Float, category : Text) : async Text {
    let id = newId();
    menuItems := menuItems.concat([{ id; name; price; category; available = true }]);
    id;
  };

  public func updateMenuItem(id : Text, name : Text, price : Float, category : Text) : async Bool {
    var found = false;
    menuItems := menuItems.map(func(item : MenuItem) : MenuItem {
      if (item.id == id) { found := true; { id; name; price; category; available = item.available } }
      else item;
    });
    found;
  };

  public func deleteMenuItem(id : Text) : async Bool {
    let before = menuItems.size();
    menuItems := menuItems.filter(func(item : MenuItem) : Bool { item.id != id });
    menuItems.size() < before;
  };

  public func toggleAvailability(id : Text) : async Bool {
    var found = false;
    menuItems := menuItems.map(func(item : MenuItem) : MenuItem {
      if (item.id == id) {
        found := true;
        { id = item.id; name = item.name; price = item.price;
          category = item.category; available = not item.available }
      } else item;
    });
    found;
  };

  // ─── ORDERS ───────────────────────────────────────────────────────────────

  public func createOrder(items : [OrderItem], total : Float, paymentMode : Text) : async Text {
    let id = newId();
    orders := orders.concat([{
      id; items; total; paymentMode;
      paymentStatus = "pending";
      createdAt = Time.now();
    }]);
    id;
  };

  public query func getOrders() : async [Order] { orders };

  public query func getOrderById(id : Text) : async ?Order {
    orders.find(func(o : Order) : Bool { o.id == id });
  };

  // ─── PAYMENTS ─────────────────────────────────────────────────────────────

  public func startPayment(orderId : Text, amount : Float) : async Text {
    let id = newId();
    payments := payments.concat([{ id; orderId; amount; status = "pending"; transactionId = "" }]);
    id;
  };

  public query func getPaymentStatus(orderId : Text) : async Text {
    switch (payments.find(func(p : Payment) : Bool { p.orderId == orderId })) {
      case (?p) { p.status };
      case null { "not_found" };
    };
  };

  public func confirmPayment(orderId : Text) : async Bool {
    var found = false;
    payments := payments.map(func(p : Payment) : Payment {
      if (p.orderId == orderId) {
        found := true;
        { id = p.id; orderId = p.orderId; amount = p.amount;
          status = "paid"; transactionId = "confirmed" }
      } else p;
    });
    orders := orders.map(func(o : Order) : Order {
      if (o.id == orderId) {
        { id = o.id; items = o.items; total = o.total;
          paymentMode = o.paymentMode; paymentStatus = "paid"; createdAt = o.createdAt }
      } else o;
    });
    found;
  };

  // ─── ANALYTICS ────────────────────────────────────────────────────────────

  public query func getAnalytics() : async Analytics {
    let oneDayNs : Int = 86_400_000_000_000;
    let cutoff : Int = Time.now() - oneDayNs;

    var sales : Float = 0.0;
    var count : Nat = 0;
    var topItemName : Text = "";
    var topItemQty  : Nat  = 0;

    var names : [Text] = [];
    var qtys  : [Nat]  = [];

    for (o in orders.values()) {
      if (o.createdAt >= cutoff and o.paymentStatus == "paid") {
        sales += o.total;
        count += 1;
        for (oi in o.items.values()) {
          var idx : ?Nat = null;
          var i : Nat = 0;
          for (n in names.values()) {
            if (n == oi.name) { idx := ?i };
            i += 1;
          };
          switch idx {
            case (?j) {
              qtys := qtys.mapEntries(func(q : Nat, k : Nat) : Nat {
                if (k == j) q + oi.qty else q
              });
            };
            case null {
              names := names.concat([oi.name]);
              qtys  := qtys.concat([oi.qty]);
            };
          };
        };
      };
    };

    var i : Nat = 0;
    for (n in names.values()) {
      if (qtys[i] > topItemQty) {
        topItemQty  := qtys[i];
        topItemName := n;
      };
      i += 1;
    };

    { todaySales = sales; todayOrders = count; topItem = topItemName };
  };

  // ─── SETTINGS ─────────────────────────────────────────────────────────────

  public query func getSettings() : async Settings { settings };

  public func saveSettings(upiId : Text, accountName : Text) : async Bool {
    settings := { upiId; accountName };
    true;
  };

};
