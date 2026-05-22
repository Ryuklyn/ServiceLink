"use client";

import { useContext } from "react";
import {
  BusinessSetupContext,
  BusinessSetupContextType,
} from "@/contexts/BusinessSetupContext";

export const useBusinessSetup = (): BusinessSetupContextType => {
  const context = useContext(BusinessSetupContext);

  if (!context) {
    throw new Error(
      "useBusinessSetup must be used within a BusinessSetupProvider",
    );
  }

  return context;
};
