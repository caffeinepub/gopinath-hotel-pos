import { useEffect, useState } from "react";
import { api } from "../api";

export interface HotelSettings {
  hotelName: string;
  address: string;
  phone: string;
  upiId: string;
  accountName: string;
  defaultGstRate: string;
}

const SETTINGS_KEY = "pos_settings";

const defaultSettings: HotelSettings = {
  hotelName: "Gobinath Hotel",
  address: "",
  phone: "",
  upiId: "",
  accountName: "",
  defaultGstRate: "18",
};

function loadFromLS(): HotelSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return defaultSettings;
}

export function useSettings() {
  const [settings, setSettings] = useState<HotelSettings>(loadFromLS);

  // Load from canister on mount
  useEffect(() => {
    api
      .getSettings()
      .then((remote) => {
        setSettings((prev) => ({
          ...prev,
          upiId: remote.upiId || prev.upiId,
          accountName: remote.accountName || prev.accountName,
        }));
      })
      .catch(() => {
        // keep localStorage fallback
      });
  }, []);

  const saveSettings = async (next: HotelSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSettings(next);
    // Also persist to canister (fire and update)
    api.saveSettings(next.upiId, next.accountName).catch(console.error);
  };

  return { settings, saveSettings };
}
