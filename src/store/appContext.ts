"use client";

import { create } from "zustand";

type AppKey = "aca" | "medicare" | "taxation" | "launchpad";

type AppContextState = {
  selectedService: AppKey;
  setSelectedService: (key: AppKey) => void;
};

export const useAppContextStore = create<AppContextState>((set) => ({
  selectedService: "aca",
  setSelectedService: (key) => set({ selectedService: key }),
}));
