export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number | "";
  rate: number | "";
  amount: number;
}

export interface InvoiceData {
  id?: string;
  invoiceNumber: string;
  date: string; // YYYY-MM-DD
  dueDate?: string; // YYYY-MM-DD
  fromName: string;
  fromEmail: string;
  toName: string;
  toEmail: string;
  items: InvoiceItem[];
  taxRate: number | "";
  taxAmount: number;
  subtotal: number;
  total: number;
  notes?: string;
  status?: string;
}
