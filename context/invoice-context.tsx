"use client";

import React, { createContext, useContext, useState } from "react";
import { InvoiceData, InvoiceItem } from "@/types/invoice";
import { saveInvoiceToHistory } from "@/utils/history";

interface InvoiceContextProps {
  invoice: InvoiceData;
  updateInvoice: (updatedFields: Partial<InvoiceData>) => void;
  addItem: () => void;
  removeItem: (index: number) => void;
  updateItem: <K extends keyof InvoiceItem>(
    index: number,
    field: K,
    value: InvoiceItem[K]
  ) => void;
  saveInvoice: () => Promise<void>;
}

const defaultItem = (): InvoiceItem => ({
  id: crypto.randomUUID(),
  description: "",
  quantity: 1,
  rate: 0,
  numberOfDays: 1,
  amount: 0,
});

const defaultInvoice = (): InvoiceData => {
  const today = new Date().toISOString().split("T")[0];

  return {
    invoiceNumber: `INV-${Math.floor(
      100000 + Math.random() * 900000
    )}`,
    date: today,
    fromName: "Ubuntu Logistics",
    fromEmail: "info@ubuntulogistics.co.ke",
    toName: "",
    toEmail: "",
    items: [defaultItem()],
    taxRate: 16,
    taxAmount: 0,
    subtotal: 0,
    total: 0,
    notes: "",
    status: "DRAFT",
    numberOfDays: 1,
  };
};

const recalculateTotals = (
  state: InvoiceData
): InvoiceData => {
  const subtotal = state.items.reduce((sum, item) => {
    return sum + (Number(item.amount) || 0);
  }, 0);

  const totalDays = state.items.reduce((sum, item) => {
    const days = item.numberOfDays === "" ? 1 : Number(item.numberOfDays) || 1;
    return sum + days;
  }, 0);

  const taxRate = Number(state.taxRate) || 0;
  const taxAmount = subtotal * (taxRate / 100);
  const total = subtotal + taxAmount;

  return {
    ...state,
    subtotal,
    taxAmount,
    total,
    numberOfDays: totalDays,
  };
};

const InvoiceContext = createContext<
  InvoiceContextProps | undefined
>(undefined);

export function InvoiceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [invoice, setInvoiceState] = useState<InvoiceData>(() =>
    recalculateTotals(defaultInvoice())
  );

  const updateInvoice = (
    updatedFields: Partial<InvoiceData>
  ) => {
    setInvoiceState((prev) =>
      recalculateTotals({
        ...prev,
        ...updatedFields,
      })
    );
  };

  const addItem = () => {
    setInvoiceState((prev) =>
      recalculateTotals({
        ...prev,
        items: [...prev.items, defaultItem()],
      })
    );
  };

  const removeItem = (index: number) => {
    setInvoiceState((prev) => {
      const items = prev.items.filter(
        (_, itemIndex) => itemIndex !== index
      );

      return recalculateTotals({
        ...prev,
        items: items.length > 0 ? items : [defaultItem()],
      });
    });
  };

  const updateItem = <K extends keyof InvoiceItem>(
    index: number,
    field: K,
    value: InvoiceItem[K]
  ) => {
    setInvoiceState((prev) => {
      const items = prev.items.map((item, itemIndex) => {
        if (itemIndex !== index) {
          return item;
        }

        const updatedItem = {
          ...item,
          [field]: value,
        };

        const quantity =
          Number(updatedItem.quantity) || 0;
        const rate =
          Number(updatedItem.rate) || 0;
        const days =
          updatedItem.numberOfDays === ""
            ? 1
            : Number(updatedItem.numberOfDays) || 1;

        return {
          ...updatedItem,
          amount: quantity * rate * days,
        };
      });

      return recalculateTotals({
        ...prev,
        items,
      });
    });
  };

  const saveInvoice = async () => {
    try {
      const status = invoice.status || "DRAFT";

      const invoiceToSave: InvoiceData = {
        ...invoice,
        status,
      };

      const savedInvoice = await saveInvoiceToHistory(invoiceToSave);

      if (savedInvoice?.id) {
        setInvoiceState((prev) => ({
          ...prev,
          id: savedInvoice.id,
          status: (savedInvoice.status as string) ?? status,
        }));
      }
    } catch (error) {
      console.error("Failed to save invoice:", error);
      throw error;
    }
  };

  return (
    <InvoiceContext.Provider
      value={{
        invoice,
        updateInvoice,
        addItem,
        removeItem,
        updateItem,
        saveInvoice,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
}

export function useInvoice() {
  const context = useContext(InvoiceContext);

  if (!context) {
    throw new Error(
      "useInvoice must be used within an InvoiceProvider"
    );
  }

  return context;
}