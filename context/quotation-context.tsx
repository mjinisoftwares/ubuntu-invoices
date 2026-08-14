"use client";

import React, { createContext, useContext, useState } from "react";
import { QuotationData, QuotationItem } from "@/types/quotation";
import { saveQuotationToHistory } from "@/utils/history";

interface QuotationContextProps {
  quotation: QuotationData;
  updateQuotation: (updatedFields: Partial<QuotationData>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: <K extends keyof QuotationItem>(
    index: number,
    field: K,
    value: QuotationItem[K]
  ) => void;
  saveQuotation: () => Promise<void>;
}

const defaultItem = (): QuotationItem => {
  const today = new Date().toISOString().split("T")[0];

  return {
    id: crypto.randomUUID(),
    date: today,
    pickupPaid: "",
    dropoffReturnTrip: "",   
    numberOfDays: 1,
    amount: 0,
    status:"DRAFT",

  };
};

const defaultQuotation = (): QuotationData => {
  const today = new Date().toISOString().split("T")[0];

  return {
    quotationNumber: `QTN-${Math.floor(
      100000 + Math.random() * 900000
    )}`,
    date: today,
    fromName: "Ubuntu Logistics",
    fromEmail: "info@ubuntulogistics.co.ke",
    toName: "",
    toEmail: "",
    items: [defaultItem()],
    total: 0,
    notes: "",
    status: "DRAFT",
    numberOfDays: 0,
  };
};

const recalculateTotals = (
  state: QuotationData
): QuotationData => {
  const total = state.items.reduce((sum, item) => {
    const amount = Number(item.amount) || 0;
    return sum + amount;
  }, 0);

  return {
    ...state,
    total,
  };
};

const QuotationContext = createContext<
  QuotationContextProps | undefined
>(undefined);

export function QuotationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [quotation, setQuotationState] = useState<QuotationData>(() =>
    recalculateTotals(defaultQuotation())
  );

  const updateQuotation = (
    updatedFields: Partial<QuotationData>
  ) => {
    setQuotationState((prev) =>
      recalculateTotals({
        ...prev,
        ...updatedFields,
      })
    );
  };

  const addItem = () => {
    setQuotationState((prev) =>
      recalculateTotals({
        ...prev,
        items: [...prev.items, defaultItem()],
      })
    );
  };

  const removeItem = (index: number) => {
    setQuotationState((prev) => {
      const items = prev.items.filter(
        (_, itemIndex) => itemIndex !== index
      );

      return recalculateTotals({
        ...prev,
        items: items.length > 0 ? items : [defaultItem()],
      });
    });
  };

  const updateItem = <K extends keyof QuotationItem>(
    index: number,
    field: K,
    value: QuotationItem[K]
  ) => {
    setQuotationState((prev) => {
      const items = prev.items.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      );

      return recalculateTotals({
        ...prev,
        items,
      });
    });
  };

  const saveQuotation = async () => {
    try {
      const status = quotation.status || "DRAFT";

      const quotationToSave: QuotationData = {
        ...quotation,
        status,
      };

      const savedQuotation =
        await saveQuotationToHistory(quotationToSave);

      if (savedQuotation?.id) {
        setQuotationState((prev) => ({
          ...prev,
          id: savedQuotation.id,
          status: (savedQuotation.status as string) ?? status,
        }));
      }
    } catch (error) {
      console.error(
        "Failed to save quotation:",
        error
      );
      throw error;
    }
  };

  return (
    <QuotationContext.Provider
      value={{
        quotation,
        updateQuotation,
        addItem,
        removeItem,
        updateItem,
        saveQuotation,
      }}
    >
      {children}
    </QuotationContext.Provider>
  );
}

export function useQuotation() {
  const context = useContext(QuotationContext);

  if (!context) {
    throw new Error(
      "useQuotation must be used within a QuotationProvider"
    );
  }

  return context;
}