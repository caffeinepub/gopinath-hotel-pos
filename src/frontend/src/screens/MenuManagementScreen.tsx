import {
  ArrowLeft,
  Menu,
  Moon,
  Pencil,
  Plus,
  Search,
  Sun,
  Tag,
  Trash2,
  UtensilsCrossed,
} from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { Screen } from "../App";
import { Footer } from "../components/Footer";
import { GlowButton } from "../components/GlowButton";
import {
  type MenuCategory,
  type MenuItem,
  useMenu,
} from "../context/MenuContext";

const CATEGORIES: MenuCategory[] = ["Veg", "Non-Veg", "Drinks", "Snacks"];
const FILTERS = ["All", ...CATEGORIES] as const;
type Filter = (typeof FILTERS)[number];

const categoryColors: Record<string, string> = {
  Veg: "bg-green-100 text-green-700",
  "Non-Veg": "bg-red-100 text-red-700",
  Drinks: "bg-blue-100 text-blue-700",
  Snacks: "bg-yellow-100 text-yellow-700",
};

interface MenuManagementScreenProps {
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  onOpenSidebar?: () => void;
}

type FormMode = "add" | "edit";

export function MenuManagementScreen({
  onNavigate: _onNavigate,
  darkMode,
  toggleDarkMode,
  onOpenSidebar,
}: MenuManagementScreenProps) {
  const { items, addItem, deleteItem, updateItem } = useMenu();
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("add");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState<MenuCategory>("Veg");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const fileRef = useRef<HTMLInputElement>(null);

  const bg = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const text = darkMode ? "text-white" : "text-gray-800";
  const subText = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-100";
  const headerBg = darkMode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-gray-100";
  const inputBg = darkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-200 text-gray-800 placeholder-gray-400";
  const labelText = darkMode ? "text-gray-300" : "text-gray-700";

  const filteredItems = items.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchFilter =
      activeFilter === "All" || item.category === activeFilter;
    return matchSearch && matchFilter;
  });

  const resetForm = () => {
    setName("");
    setPrice("");
    setCategory("Veg");
    setImagePreview(null);
    setEditingId(null);
    setFormMode("add");
    if (fileRef.current) fileRef.current.value = "";
  };

  const openAddForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (item: MenuItem) => {
    setFormMode("edit");
    setEditingId(item.id);
    setName(item.name);
    setPrice(String(item.price));
    setCategory(item.category);
    setImagePreview(item.imageUrl);
    setShowForm(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setImagePreview(url);
  };

  const handleSave = () => {
    if (!name.trim()) {
      toast.error("Item name is required.");
      return;
    }
    const parsedPrice = Number.parseFloat(price);
    if (!price || Number.isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Enter a valid price.");
      return;
    }

    if (formMode === "edit" && editingId) {
      const updatedItem: MenuItem = {
        id: editingId,
        name: name.trim(),
        price: parsedPrice,
        category,
        imageUrl:
          imagePreview ??
          `https://placehold.co/200x150/FF6B00/white?text=${encodeURIComponent(name.trim().slice(0, 8))}`,
      };
      updateItem(updatedItem);
      toast.success(`"${updatedItem.name}" updated!`);
    } else {
      const newItem: MenuItem = {
        id: `item_${Date.now()}`,
        name: name.trim(),
        price: parsedPrice,
        category,
        imageUrl:
          imagePreview ??
          `https://placehold.co/200x150/FF6B00/white?text=${encodeURIComponent(name.trim().slice(0, 8))}`,
      };
      addItem(newItem);
      toast.success(`"${newItem.name}" added to menu!`);
    }
    resetForm();
    setShowForm(false);
  };

  const handleCancel = () => {
    resetForm();
    setShowForm(false);
  };

  const handleDelete = (item: MenuItem) => {
    deleteItem(item.id);
    toast.success(`"${item.name}" removed from menu.`);
  };

  return (
    <div className={`flex-1 flex flex-col ${bg}`}>
      {/* Header */}
      <header
        className={`${headerBg} border-b px-4 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-xs`}
      >
        <button
          type="button"
          onClick={onOpenSidebar}
          data-ocid="header.sidebar.open_modal_button"
          className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            darkMode
              ? "text-gray-300 hover:bg-gray-700"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className={`font-display font-bold text-xl ${text}`}>Menu</h1>
        <button
          type="button"
          onClick={toggleDarkMode}
          className={`ml-auto w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
            darkMode
              ? "hover:bg-gray-700 text-yellow-300"
              : "hover:bg-gray-100 text-gray-600"
          }`}
        >
          {darkMode ? (
            <Sun className="w-4 h-4" />
          ) : (
            <Moon className="w-4 h-4" />
          )}
        </button>
      </header>

      <div className="flex-1 overflow-y-auto p-4 max-w-2xl mx-auto w-full">
        {/* Form */}
        {showForm ? (
          <div
            data-ocid="menu.form.panel"
            className={`${cardBg} rounded-2xl shadow-sm border ${border} p-6 mb-6`}
          >
            {/* Back button in form */}
            <button
              type="button"
              onClick={handleCancel}
              className={`flex items-center gap-1 text-sm font-semibold mb-4 ${
                darkMode
                  ? "text-gray-300 hover:text-white"
                  : "text-gray-600 hover:text-gray-900"
              } transition-colors`}
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <h2 className={`font-display font-bold text-lg ${text} mb-4`}>
              {formMode === "edit" ? "Edit Menu Item" : "New Menu Item"}
            </h2>
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="menu-item-name"
                  className={`block text-sm font-semibold ${labelText} mb-1`}
                >
                  Item Name
                </label>
                <input
                  id="menu-item-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dal Makhani"
                  data-ocid="menu.name.input"
                  className={`w-full h-12 px-4 rounded-xl border focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-colors ${inputBg}`}
                />
              </div>
              <div>
                <label
                  htmlFor="menu-item-price"
                  className={`block text-sm font-semibold ${labelText} mb-1`}
                >
                  Item Price (₹)
                </label>
                <input
                  id="menu-item-price"
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="e.g. 150"
                  min="1"
                  data-ocid="menu.price.input"
                  className={`w-full h-12 px-4 rounded-xl border focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-colors ${inputBg}`}
                />
              </div>
              <div>
                <label
                  htmlFor="menu-item-category"
                  className={`block text-sm font-semibold ${labelText} mb-1`}
                >
                  Category
                </label>
                <select
                  id="menu-item-category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value as MenuCategory)}
                  data-ocid="menu.category.select"
                  className={`w-full h-12 px-4 rounded-xl border focus:border-orange-400 focus:ring-2 focus:ring-orange-100 outline-none transition-colors ${inputBg}`}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label
                  htmlFor="menu-item-image"
                  className={`block text-sm font-semibold ${labelText} mb-1`}
                >
                  Item Image
                </label>
                <button
                  type="button"
                  data-ocid="menu.image.dropzone"
                  className={`w-full border-2 border-dashed rounded-xl p-4 text-center hover:border-orange-300 transition-colors cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400 ${
                    darkMode ? "border-gray-600" : "border-gray-200"
                  }`}
                  onClick={() => fileRef.current?.click()}
                >
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-32 h-24 object-cover rounded-lg mx-auto"
                    />
                  ) : (
                    <div className="py-4">
                      <Tag className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className={`text-sm ${subText}`}>
                        Tap to upload image
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        JPG, PNG supported
                      </p>
                    </div>
                  )}
                </button>
                <input
                  ref={fileRef}
                  id="menu-item-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  data-ocid="menu.image.upload_button"
                  className="hidden"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSave}
                  data-ocid="menu.save.primary_button"
                  className="px-6 py-2 text-sm rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 text-white font-semibold shadow-md hover:shadow-orange-200 hover:scale-[1.02] transition-all duration-200 active:scale-[0.98]"
                >
                  {formMode === "edit" ? "Update Item" : "Save Item"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  data-ocid="menu.cancel.cancel_button"
                  className="px-6 py-2 text-sm rounded-xl border-2 border-orange-400 text-orange-500 font-semibold hover:bg-orange-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Add Button */}
            <GlowButton
              onClick={openAddForm}
              data-ocid="menu.add.primary_button"
              className="max-w-xs mb-6"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Add Menu Item
            </GlowButton>

            {/* Search */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search menu items..."
                data-ocid="menu.search.search_input"
                className={`w-full h-10 pl-10 pr-4 rounded-xl border text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors ${inputBg}`}
              />
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap mb-4">
              {FILTERS.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  data-ocid="menu.filter.tab"
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${
                    activeFilter === filter
                      ? "bg-orange-500 text-white border-orange-500"
                      : darkMode
                        ? "bg-gray-700 text-gray-300 border-gray-600 hover:border-orange-400"
                        : "bg-white text-gray-600 border-gray-200 hover:border-orange-400"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>

            <h2
              className={`font-semibold text-sm uppercase tracking-wide mb-3 ${subText}`}
            >
              All Menu Items ({filteredItems.length})
            </h2>

            {filteredItems.length === 0 ? (
              <div
                data-ocid="menu.items.empty_state"
                className={`text-center py-16 ${subText}`}
              >
                <UtensilsCrossed className="w-10 h-10 mx-auto mb-3 text-gray-300" />
                <p>
                  {search || activeFilter !== "All"
                    ? "No items match your filters."
                    : "No menu items yet."}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredItems.map((item, idx) => (
                  <div
                    key={item.id}
                    data-ocid={`menu.items.item.${idx + 1}`}
                    className={`${cardBg} rounded-2xl shadow-xs border ${border} p-3 flex items-center gap-3 hover:shadow-sm transition-shadow`}
                  >
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-14 h-14 rounded-xl object-cover flex-shrink-0"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          `https://placehold.co/56x56/FF6B00/white?text=${encodeURIComponent(item.name.slice(0, 2))}`;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className={`font-semibold truncate ${text}`}>
                        {item.name}
                      </p>
                      <span
                        className={`inline-block text-xs px-2 py-0.5 rounded-full mt-0.5 font-medium ${
                          categoryColors[item.category] ??
                          "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {item.category}
                      </span>
                    </div>
                    <p className="font-bold text-green-600 text-base flex-shrink-0">
                      ₹{item.price}
                    </p>
                    <button
                      type="button"
                      onClick={() => openEditForm(item)}
                      data-ocid={`menu.edit.edit_button.${idx + 1}`}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-orange-400 hover:bg-orange-50 hover:text-orange-600 transition-colors flex-shrink-0"
                      title="Edit item"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(item)}
                      data-ocid={`menu.delete.delete_button.${idx + 1}`}
                      className="w-9 h-9 rounded-xl flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors flex-shrink-0"
                      title="Delete item"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
