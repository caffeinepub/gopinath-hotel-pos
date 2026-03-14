import { useEffect, useState } from "react";
import { useActor } from "./useActor";

export interface HotelSettings {
  hotelName: string;
  upiId: string;
  accountName: string;
  defaultGstRate: string;
}

interface SettingsActor {
  getSettings(): Promise<{
    upiId: string;
    accountName: string;
    gstPercent: bigint;
  }>;
  saveSettings(
    upiId: string,
    accountName: string,
    gstPercent: bigint,
  ): Promise<void>;
}

const defaultSettings: HotelSettings = {
  hotelName: "Gopinath Hotel",
  upiId: "sivakumaryuvaraj2000@okicici",
  accountName: "Gopinath Hotel",
  defaultGstRate: "5",
};

export function useSettings() {
  const [settings, setSettings] = useState<HotelSettings>(defaultSettings);
  const { actor, isFetching } = useActor();

  useEffect(() => {
    if (!actor || isFetching) return;
    const settingsActor = actor as unknown as SettingsActor;
    settingsActor
      .getSettings()
      .then((result) => {
        setSettings({
          hotelName: "Gopinath Hotel",
          upiId: result.upiId || defaultSettings.upiId,
          accountName: result.accountName || defaultSettings.accountName,
          defaultGstRate: result.gstPercent
            ? result.gstPercent.toString()
            : defaultSettings.defaultGstRate,
        });
      })
      .catch((e) => {
        console.error("Failed to load settings from canister", e);
      });
  }, [actor, isFetching]);

  const saveSettings = async (next: HotelSettings) => {
    setSettings(next);
    if (actor) {
      try {
        const settingsActor = actor as unknown as SettingsActor;
        await settingsActor.saveSettings(
          next.upiId,
          next.accountName,
          BigInt(Math.round(Number(next.defaultGstRate) || 0)),
        );
      } catch (e) {
        console.error("Failed to save settings to canister", e);
      }
    }
  };

  return { settings, saveSettings };
}
