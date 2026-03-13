import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type User = {
    id : Nat;
    name : Text;
    role : Text;
    pin : Text;
  };

  type MenuItem = {
    id : Nat;
    name : Text;
    price : Nat;
    category : Text;
    available : Bool;
    imageUrl : Text;
    createdAt : Int;
  };

  type Order = {
    id : Nat;
    items : Text;
    total : Nat;
    paymentMode : Text;
    paymentStatus : Text;
    createdAt : Int;
  };

  type Payment = {
    id : Nat;
    orderId : Nat;
    amount : Nat;
    status : Text;
    transactionId : Text;
    createdAt : Int;
  };

  type OldActor = {
    transactionCounter : Nat;
    paymentStatusUrl : ?Text;
  };

  type NewActor = {
    users : Map.Map<Nat, User>;
    menuItems : Map.Map<Nat, MenuItem>;
    orders : Map.Map<Nat, Order>;
    payments : Map.Map<Nat, Payment>;
    transactionCounter : Nat;
    paymentStatusUrl : ?Text;
  };

  public func run(old : OldActor) : NewActor {
    let newUsers = Map.empty<Nat, User>();
    let newMenuItems = Map.empty<Nat, MenuItem>();
    let newOrders = Map.empty<Nat, Order>();
    let newPayments = Map.empty<Nat, Payment>();

    // Add initial data to users for owner and staff
    let owner : User = {
      id = 1;
      name = "Owner";
      role = "owner";
      pin = "1234";
    };

    let staff : User = {
      id = 2;
      name = "Staff";
      role = "staff";
      pin = "5678";
    };

    newUsers.add(1, owner);
    newUsers.add(2, staff);

    // Add initial data for menu items
    let menuItem1 : MenuItem = {
      id = 1;
      name = "Paneer Butter Masala";
      price = 180;
      category = "veg";
      available = true;
      imageUrl = "";
      createdAt = 0;
    };

    let menuItem2 : MenuItem = {
      id = 2;
      name = "Chicken Biryani";
      price = 250;
      category = "non_veg";
      available = true;
      imageUrl = "";
      createdAt = 0;
    };

    let menuItem3 : MenuItem = {
      id = 3;
      name = "Masala Chai";
      price = 40;
      category = "drinks";
      available = true;
      imageUrl = "";
      createdAt = 0;
    };

    let menuItem4 : MenuItem = {
      id = 4;
      name = "Veg Spring Rolls";
      price = 120;
      category = "snacks";
      available = true;
      imageUrl = "";
      createdAt = 0;
    };

    let menuItem5 : MenuItem = {
      id = 5;
      name = "Mutton Curry";
      price = 320;
      category = "non_veg";
      available = true;
      imageUrl = "";
      createdAt = 0;
    };

    let menuItem6 : MenuItem = {
      id = 6;
      name = "Mango Lassi";
      price = 80;
      category = "drinks";
      available = true;
      imageUrl = "";
      createdAt = 0;
    };

    let menuItem7 : MenuItem = {
      id = 7;
      name = "Vanilla Ice Cream";
      price = 60;
      category = "ice_cream";
      available = true;
      imageUrl = "";
      createdAt = 0;
    };

    newMenuItems.add(1, menuItem1);
    newMenuItems.add(2, menuItem2);
    newMenuItems.add(3, menuItem3);
    newMenuItems.add(4, menuItem4);
    newMenuItems.add(5, menuItem5);
    newMenuItems.add(6, menuItem6);
    newMenuItems.add(7, menuItem7);

    {
      users = newUsers;
      menuItems = newMenuItems;
      orders = newOrders;
      payments = newPayments;
      transactionCounter = old.transactionCounter;
      paymentStatusUrl = old.paymentStatusUrl;
    };
  };
};
