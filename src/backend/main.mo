import Map "mo:core/Map";
import List "mo:core/List";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import OutCall "http-outcalls/outcall";
import Migration "migration";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";

(with migration = Migration.run)
actor {
  type User = {
    id : Nat;
    name : Text;
    role : Text; // "owner" or "staff"
    pin : Text;
  };

  type MenuItem = {
    id : Nat;
    name : Text;
    price : Nat;
    category : Text; // veg, non_veg, drinks, etc.
    available : Bool;
    imageUrl : Text;
    createdAt : Int;
  };

  type Order = {
    id : Nat;
    items : Text; // JSON string of menu items
    total : Nat;
    paymentMode : Text;
    paymentStatus : Text; // "pending", "paid", "failed"
    createdAt : Int;
  };

  type Payment = {
    id : Nat;
    orderId : Nat;
    amount : Nat;
    status : Text; // "pending", "paid", "failed"
    transactionId : Text;
    createdAt : Int;
  };

  type Analytics = {
    todaySales : Nat;
    totalOrders : Nat;
    topItem : ?Text;
  };

  type PaymentStatusResponse = {
    status : Text;
    message : Text;
  };

  let users = Map.empty<Nat, User>();
  let menuItems = Map.empty<Nat, MenuItem>();
  let orders = Map.empty<Nat, Order>();
  let payments = Map.empty<Nat, Payment>();
  var transactionCounter = 0;
  var paymentStatusUrl : ?Text = null;

  public shared ({ caller }) func login(pin : Text) : async (Text, Text) {
    let matchingUser = users.values().find(
      func(user) {
        user.pin == pin;
      }
    );
    switch (matchingUser) {
      case (null) { Runtime.trap("Invalid PIN") };
      case (?user) {
        (user.name, user.role);
      };
    };
  };

  public query ({ caller }) func getMenu() : async [MenuItem] {
    menuItems.toArray().map(func((_, item)) { item });
  };

  public shared ({ caller }) func addMenuItem(
    name : Text,
    price : Nat,
    category : Text,
    imageUrl : Text,
  ) : async MenuItem {
    let id = menuItems.size() + 1;
    let newItem : MenuItem = {
      id;
      name;
      price;
      category;
      available = true;
      imageUrl;
      createdAt = Time.now();
    };
    menuItems.add(id, newItem);
    newItem;
  };

  public shared ({ caller }) func updateMenuItem(
    id : Nat,
    name : Text,
    price : Nat,
    category : Text,
    imageUrl : Text,
  ) : async MenuItem {
    let existingItem = menuItems.get(id);
    switch (existingItem) {
      case (null) { Runtime.trap("Item not found") };
      case (?item) {
        let updatedItem : MenuItem = {
          id;
          name;
          price;
          category;
          available = item.available;
          imageUrl;
          createdAt = item.createdAt;
        };
        menuItems.add(id, updatedItem);
        updatedItem;
      };
    };
  };

  public shared ({ caller }) func deleteMenuItem(id : Nat) : async () {
    switch (menuItems.get(id)) {
      case (null) { Runtime.trap("Item not found") };
      case (?_) {
        menuItems.remove(id);
      };
    };
  };

  public shared ({ caller }) func toggleAvailability(id : Nat) : async () {
    let item = menuItems.get(id);
    switch (item) {
      case (null) { Runtime.trap("Item not found") };
      case (?menuItem) {
        let updatedItem : MenuItem = {
          id = menuItem.id;
          name = menuItem.name;
          price = menuItem.price;
          category = menuItem.category;
          available = not menuItem.available;
          imageUrl = menuItem.imageUrl;
          createdAt = menuItem.createdAt;
        };
        menuItems.add(id, updatedItem);
      };
    };
  };

  public shared ({ caller }) func createOrder(
    itemsJson : Text,
    total : Nat,
    paymentMode : Text,
  ) : async Nat {
    let id = orders.size() + 1;
    let newOrder : Order = {
      id;
      items = itemsJson;
      total;
      paymentMode;
      paymentStatus = "pending";
      createdAt = Time.now();
    };
    orders.add(id, newOrder);
    id;
  };

  public query ({ caller }) func getOrders() : async [Order] {
    orders.toArray().map(func((_, order)) { order });
  };

  public query ({ caller }) func getOrder(id : Nat) : async Order {
    switch (orders.get(id)) {
      case (null) { Runtime.trap("Order not found") };
      case (?order) { order };
    };
  };

  public shared ({ caller }) func startPayment(
    orderId : Nat,
    amount : Nat,
    upiId : Text,
  ) : async Text {
    let transactionId = await generateTransactionId();
    let id = payments.size() + 1;
    let newPayment : Payment = {
      id;
      orderId;
      amount;
      status = "pending";
      transactionId;
      createdAt = Time.now();
    };
    payments.add(id, newPayment);
    transactionId;
  };

  public query ({ caller }) func getPaymentStatus(orderId : Nat) : async Text {
    let payment = payments.values().find(
      func(p) { p.orderId == orderId }
    );
    switch (payment) {
      case (null) { "not found" };
      case (?p) { p.status };
    };
  };

  public shared ({ caller }) func confirmPayment(orderId : Nat) : async () {
    let payment = payments.values().find(
      func(p) { p.orderId == orderId }
    );
    switch (payment) {
      case (null) { Runtime.trap("Payment not found") };
      case (?_) {
        let order = orders.get(orderId);
        switch (order) {
          case (null) { Runtime.trap("Order not found") };
          case (?o) {
            let updatedOrder : Order = {
              id = o.id;
              items = o.items;
              total = o.total;
              paymentMode = o.paymentMode;
              paymentStatus = "completed";
              createdAt = o.createdAt;
            };
            orders.add(orderId, updatedOrder);
          };
        };
      };
    };
  };

  public shared ({ caller }) func generateTransactionId() : async Text {
    let timestamp = Time.now();
    transactionCounter += 1;
    let id = timestamp.toText() # "_" # transactionCounter.toText();
    id;
  };

  public shared ({ caller }) func setPaymentStatusUrl(url : ?Text) : async () {
    paymentStatusUrl := url;
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  public shared ({ caller }) func checkPaymentStatus(
    transactionId : Text,
    expectedAmount : Nat,
    upiId : Text,
  ) : async PaymentStatusResponse {
    switch (paymentStatusUrl) {
      case (null) {
        {
          status = "pending";
          message = "Gateway not configured";
        };
      };
      case (?url) {
        let requestUrl = url # "?transactionId=" # transactionId # "&amount=" # expectedAmount.toText() # "&upiId=" # upiId;
        try {
          let responseText = await OutCall.httpGetRequest(requestUrl, [], transform);
          if (responseText.contains(#text "success")) {
            {
              status = "success";
              message = "Payment successful";
            };
          } else if (responseText.contains(#text "failed")) {
            {
              status = "failed";
              message = "Payment failed";
            };
          } else {
            {
              status = "pending";
              message = "Payment pending";
            };
          };
        } catch (e) {
          {
            status = "pending";
            message = "HTTP outcall failed";
          };
        };
      };
    };
  };

  public query ({ caller }) func getAnalytics() : async Analytics {
    let today = Time.now() / 1000000000 / 86400 * 86400 * 1000000000;
    var todaySales = 0;
    var totalOrders = 0;
    let itemCounts = Map.empty<Text, Nat>();

    for ((_, order) in orders.entries()) {
      if (order.createdAt >= today) {
        todaySales += order.total;
        totalOrders += 1;

        let items = order.items;
        let count = switch (itemCounts.get(items)) {
          case (null) { 1 };
          case (?c) { c + 1 };
        };
        itemCounts.add(items, count);
      };
    };

    var topItem : ?Text = null;
    var topCount = 0;

    let itemCountsIter = itemCounts.entries();
    for ((item, count) in itemCountsIter) {
      if (count > topCount) {
        topItem := ?item;
        topCount := count;
      };
    };

    {
      todaySales;
      totalOrders;
      topItem;
    };
  };
};
