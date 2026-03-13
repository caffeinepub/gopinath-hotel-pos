import { Check, CreditCard, Database, Info, Settings2, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { Screen } from "../App";
import { Footer } from "../components/Footer";
import { HeaderClock } from "../components/HeaderClock";
import { QRCodeImage } from "../components/QRCodeImage";
import type { HotelSettings } from "../hooks/useSettings";
import { useSettings } from "../hooks/useSettings";
import {
  getSupabaseConfig,
  isSupabaseConfigured,
  saveSupabaseConfig,
} from "../lib/supabase";

interface SettingsScreenProps {
  onBack: () => void;
  onNavigate: (screen: Screen) => void;
  darkMode: boolean;
}

const UPI_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

export function SettingsScreen({
  onBack: _onBack,
  darkMode,
}: SettingsScreenProps) {
  const { settings, saveSettings } = useSettings();
  const [form, setForm] = useState<HotelSettings>({ ...settings });

  const [supabaseUrl, setSupabaseUrl] = useState(getSupabaseConfig().url);
  const [supabaseKey, setSupabaseKey] = useState(getSupabaseConfig().key);
  const [isConnected] = useState(isSupabaseConfigured);

  const bg = darkMode ? "bg-gray-900" : "bg-gray-50";
  const cardBg = darkMode ? "bg-gray-800" : "bg-white";
  const text = darkMode ? "text-white" : "text-gray-800";
  const subText = darkMode ? "text-gray-400" : "text-gray-500";
  const border = darkMode ? "border-gray-700" : "border-gray-200";
  const headerBg = darkMode
    ? "bg-gray-900 border-gray-700"
    : "bg-white border-gray-100";
  const inputCls = darkMode
    ? "bg-gray-700 border-gray-600 text-white placeholder-gray-400"
    : "bg-white border-gray-200 text-gray-800 placeholder-gray-400";

  const set = (key: keyof HotelSettings, val: string) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const upiHasValue = form.upiId.trim() !== "";
  const upiIsValid = upiHasValue && UPI_REGEX.test(form.upiId.trim());
  const upiIsInvalid = upiHasValue && !UPI_REGEX.test(form.upiId.trim());

  const handleSave = () => {
    if (upiIsInvalid) {
      toast.error("Please fix the UPI ID before saving.");
      return;
    }
    saveSettings(form);
    toast.success("Settings saved successfully");
  };

  const upiPreviewValue = form.upiId
    ? `upi://pay?pa=${form.upiId}&pn=GopinathHotel&am=`
    : "";

  return (
    <div className={`min-h-screen flex flex-col ${bg}`}>
      {/* Header */}
      <header
        className={`${headerBg} border-b px-6 py-0 sticky top-0 z-10 shadow-sm`}
      >
        <div className="flex items-center h-16">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-orange-500" />
            <h1 className={`font-bold text-lg tracking-wide ${text}`}>
              Settings
            </h1>
          </div>
          <div className="flex-1 flex justify-end">
            <HeaderClock darkMode={darkMode} />
          </div>
        </div>
        <div className="h-0.5 bg-gradient-to-r from-orange-500 to-orange-300 -mx-6" />
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* Backend Connection Section */}
        <section className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center">
              <Database className="w-4 h-4 text-green-600" />
            </div>
            <h2 className={`font-bold text-base ${text}`}>
              Backend Connection
            </h2>
            {isConnected ? (
              <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                Connected
              </span>
            ) : (
              <span className="ml-auto inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 text-xs font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-gray-400 inline-block" />
                Not Connected
              </span>
            )}
          </div>

          <div
            className={`${cardBg} rounded-2xl border ${border} p-4 md:p-6 space-y-4`}
          >
            <p className={`text-sm ${subText}`}>
              Enter your Supabase project credentials to enable database
              storage, API calls, and realtime updates.
            </p>

            <div className="space-y-1">
              <label
                htmlFor="supabase-url"
                className={`text-xs font-semibold uppercase tracking-wide ${subText}`}
              >
                Supabase Project URL
              </label>
              <input
                id="supabase-url"
                type="url"
                value={supabaseUrl}
                onChange={(e) => setSupabaseUrl(e.target.value)}
                placeholder="https://xxxxxxxxxxxx.supabase.co"
                data-ocid="settings.supabase_url.input"
                className={`w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors ${inputCls}`}
              />
            </div>

            <div className="space-y-1">
              <label
                htmlFor="supabase-key"
                className={`text-xs font-semibold uppercase tracking-wide ${subText}`}
              >
                Supabase Anon Key
              </label>
              <input
                id="supabase-key"
                type="password"
                value={supabaseKey}
                onChange={(e) => setSupabaseKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                data-ocid="settings.supabase_key.input"
                className={`w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors ${inputCls}`}
              />
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  if (supabaseUrl && supabaseKey) {
                    saveSupabaseConfig(supabaseUrl, supabaseKey);
                  }
                }}
                disabled={!supabaseUrl || !supabaseKey}
                data-ocid="settings.supabase_connect.primary_button"
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-sm shadow-md hover:shadow-green-200 hover:scale-[1.02] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Connect &amp; Save
              </button>
              <p className={`text-xs ${subText}`}>
                The page will reload to apply the connection.
              </p>
            </div>

            <div className="rounded-xl bg-orange-50 border border-orange-100 p-3">
              <p className="text-xs text-orange-700 font-semibold mb-1">
                Setup Instructions
              </p>
              <ol className="text-xs text-orange-600 space-y-0.5 list-decimal list-inside">
                <li>Create a free project at supabase.com</li>
                <li>Go to Project Settings → API</li>
                <li>Copy "Project URL" and "anon/public" key</li>
                <li>
                  Run the SQL schema from{" "}
                  <code className="bg-orange-100 px-1 rounded">
                    supabase-schema.sql
                  </code>
                </li>
                <li>Paste credentials above and click Connect</li>
              </ol>
            </div>
          </div>
        </section>

        {/* Payment Settings */}
        <section className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 rounded-lg bg-orange-100 flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-orange-500" />
            </div>
            <h2 className={`font-bold text-base ${text}`}>Payment Settings</h2>
          </div>

          <div className={`${cardBg} rounded-2xl border ${border} p-4 md:p-6`}>
            <div className="flex flex-col md:flex-row md:gap-8">
              {/* Form fields */}
              <div className="flex-1 space-y-4">
                {/* UPI ID */}
                <div className="space-y-1">
                  <label
                    htmlFor="settings-upi-id"
                    className={`text-xs font-semibold uppercase tracking-wide ${subText}`}
                  >
                    UPI ID
                  </label>
                  <div className="relative">
                    <input
                      id="settings-upi-id"
                      type="text"
                      value={form.upiId}
                      onChange={(e) => set("upiId", e.target.value)}
                      placeholder="e.g. name@bank"
                      data-ocid="settings.upi_id.input"
                      className={`w-full h-12 pl-4 pr-10 rounded-xl border text-sm outline-none focus:ring-2 transition-colors ${
                        upiIsInvalid
                          ? "border-red-400 focus:border-red-400 focus:ring-red-100"
                          : `${inputCls} focus:border-orange-400 focus:ring-orange-100`
                      }`}
                    />
                    {upiIsValid && (
                      <Check className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-500 pointer-events-none" />
                    )}
                    {upiIsInvalid && (
                      <X className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-red-400 pointer-events-none" />
                    )}
                  </div>
                  {upiIsInvalid && (
                    <p
                      className="text-xs text-red-500 mt-1"
                      data-ocid="settings.upi_id.error_state"
                    >
                      Invalid UPI ID format
                    </p>
                  )}
                </div>

                {/* Account Name */}
                <div className="space-y-1">
                  <label
                    htmlFor="settings-account-name"
                    className={`text-xs font-semibold uppercase tracking-wide ${subText}`}
                  >
                    Account Name
                  </label>
                  <input
                    id="settings-account-name"
                    type="text"
                    value={form.accountName}
                    onChange={(e) => set("accountName", e.target.value)}
                    placeholder="Name on UPI account"
                    data-ocid="settings.account_name.input"
                    className={`w-full h-12 px-4 rounded-xl border text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 transition-colors ${inputCls}`}
                  />
                </div>

                {!upiHasValue && (
                  <div className="flex items-start gap-2 rounded-xl bg-orange-50 border border-orange-100 p-3">
                    <Info className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                    <p className="text-xs text-orange-600">
                      Enter your UPI ID above to generate a QR template preview.
                    </p>
                  </div>
                )}
              </div>

              {/* QR Preview */}
              {upiIsValid && (
                <div className="mt-6 md:mt-0 md:w-56 flex flex-col items-center gap-3 bg-orange-50 rounded-2xl p-4 border border-orange-100">
                  <p className="text-xs font-bold uppercase tracking-wide text-orange-500">
                    UPI QR Code
                  </p>
                  <div className="p-3 bg-white rounded-2xl shadow-sm">
                    <QRCodeImage value={upiPreviewValue} size={160} />
                  </div>
                  <div className="text-center">
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide mb-0.5 ${subText}`}
                    >
                      UPI ID
                    </p>
                    <p className="text-sm font-medium text-orange-600 break-all">
                      {form.upiId}
                    </p>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={handleSave}
                disabled={upiIsInvalid}
                data-ocid="settings.save.primary_button"
                className="px-8 py-2.5 rounded-xl bg-gradient-to-r from-orange-400 to-orange-600 text-white font-bold text-base shadow-md hover:shadow-orange-200 hover:scale-[1.02] transition-all duration-200 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                Save Settings
              </button>
            </div>
          </div>
        </section>
      </div>

      <Footer darkMode={darkMode} />
    </div>
  );
}
