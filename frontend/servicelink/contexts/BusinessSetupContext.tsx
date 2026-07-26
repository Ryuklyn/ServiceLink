"use client";

import React, { createContext, useState, useEffect, ReactNode } from "react";

export interface BusinessSetupData {
  organizationId: number | null;
  organizationName: string | null;

  workspaceId: number | null;
  workspaceName: string | null;

  proUserId: number | null;
  proUserName: string | null;

  kybId: number | null;
  kybStatus: string | null;

  subscriptionId: number | null;
  planType: string | null;
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
  // Start with plain defaults — localStorage/sessionStorage are browser-only
  // and don't exist during Next.js's server render pass.
  const [data, setData] = useState<BusinessSetupData>(defaultData);

  // Load persisted data — runs client-side only, after mount.
  useEffect(() => {
    const stored =
        localStorage.getItem("businessSetup") ||
        sessionStorage.getItem("businessSetupDraft");
    if (stored) {
      try {
        setData(JSON.parse(stored));
      } catch (error) {
        console.error("Failed to parse stored business setup:", error);
      }
    }
  }, []);

  // Persist on every change.
  useEffect(() => {
    localStorage.setItem("businessSetup", JSON.stringify(data));
  }, [data]);

  const setOrganization = (id: number, name: string) => {
    setData((prev) => ({ ...prev, organizationId: id, organizationName: name }));
  };

  const setWorkspace = (id: number, name: string) => {
    setData((prev) => ({ ...prev, workspaceId: id, workspaceName: name }));
  };

  const setProUser = (id: number, name: string) => {
    setData((prev) => ({ ...prev, proUserId: id, proUserName: name }));
  };

  const setKyb = (id: number, status: string) => {
    setData((prev) => ({ ...prev, kybId: id, kybStatus: status }));
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
    return 6;
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