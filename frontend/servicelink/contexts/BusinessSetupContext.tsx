"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

export interface BusinessSetupData {
  // Step 1: Organization
  organizationId: number | null;
  organizationName: string | null;

  // Step 2: Workspace
  workspaceId: number | null;
  workspaceName: string | null;

  // Step 3: ProUser (Admin)
  proUserId: number | null;
  proUserName: string | null;

  // Step 4: Verification (KYB)
  kybId: number | null;
  kybStatus: string | null;

  // Step 5: Plan & Payment
  subscriptionId: number | null;
  planType: string | null; // STARTER, GROWTH, ENTERPRISE
  amountNpr: number | null;
  paymentReferenceId: string | null;
  paymentStatus: string | null;
}

export interface BusinessSetupContextType {
  data: BusinessSetupData;
  setOrganization: (id: number, name: string) => void;
  setWorkspace: (id: number, name: string) => void;
  setProUser: (id: number, name: string) => void;
  setKyb: (id: number, status: string) => void;
  setSubscription: (id: number, planType: string, amount: number) => void;
  setPayment: (referenceId: string, status: string) => void;
  resetSetup: () => void;
  getCurrentStep: () => number;
}

const defaultData: BusinessSetupData = {
  organizationId: null,
  organizationName: null,
  workspaceId: null,
  workspaceName: null,
  proUserId: null,
  proUserName: null,
  kybId: null,
  kybStatus: null,
  subscriptionId: null,
  planType: null,
  amountNpr: null,
  paymentReferenceId: null,
  paymentStatus: null,
};

export const BusinessSetupContext = createContext<
  BusinessSetupContextType | undefined
>(undefined);

interface BusinessSetupProviderProps {
  children: ReactNode;
}

export const BusinessSetupProvider: React.FC<BusinessSetupProviderProps> = ({
  children,
}) => {
  const [data, setData] = useState<BusinessSetupData>(() => {
    const stored =
      localStorage.getItem("businessSetup") ||
      sessionStorage.getItem("businessSetupDraft");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Failed to parse stored business setup:", error);
      }
    }
    return defaultData;
  });

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem("businessSetup", JSON.stringify(data));
  }, [data]);

  const setOrganization = (id: number, name: string) => {
    setData((prev) => ({
      ...prev,
      organizationId: id,
      organizationName: name,
    }));
  };

  const setWorkspace = (id: number, name: string) => {
    setData((prev) => ({
      ...prev,
      workspaceId: id,
      workspaceName: name,
    }));
  };

  const setProUser = (id: number, name: string) => {
    setData((prev) => ({
      ...prev,
      proUserId: id,
      proUserName: name,
    }));
  };

  const setKyb = (id: number, status: string) => {
    setData((prev) => ({
      ...prev,
      kybId: id,
      kybStatus: status,
    }));
  };

  const setSubscription = (id: number, planType: string, amount: number) => {
    setData((prev) => ({
      ...prev,
      subscriptionId: id,
      planType,
      amountNpr: amount,
    }));
  };

  const setPayment = (referenceId: string, status: string) => {
    setData((prev) => ({
      ...prev,
      paymentReferenceId: referenceId,
      paymentStatus: status,
    }));
  };

  const resetSetup = () => {
    setData(defaultData);
    localStorage.removeItem("businessSetup");
    sessionStorage.removeItem("businessSetupDraft");
    sessionStorage.removeItem("paymentInitiateResponse");
  };

  const getCurrentStep = (): number => {
    if (data.organizationId === null) return 1;
    if (data.workspaceId === null) return 2;
    if (data.proUserId === null) return 3;
    if (data.kybId === null) return 4;
    if (data.subscriptionId === null) return 5;
    return 6; // Complete
  };

  const value: BusinessSetupContextType = {
    data,
    setOrganization,
    setWorkspace,
    setProUser,
    setKyb,
    setSubscription,
    setPayment,
    resetSetup,
    getCurrentStep,
  };

  return (
    <BusinessSetupContext.Provider value={value}>
      {children}
    </BusinessSetupContext.Provider>
  );
};
