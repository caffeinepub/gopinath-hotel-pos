import { useState } from "react";

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

function loadSettings(): HotelSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {
    // ignore
  }
  return defaultSettings;
}

export function useSettings() {
  const [settings, setSettings] = useState<HotelSettings>(loadSettings);

  const saveSettings = (next: HotelSettings) => {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    setSettings(next);
  };

  return { settings, saveSettings };
}
