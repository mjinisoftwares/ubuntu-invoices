import BasicDetails from "./basic-details";
import ContactDetails from "./contact-details";
import ItemsList from "./items-list";
import TaxAndTotals from "./tax-and-totals";
import { useInvoice } from "@/context/invoice-context";

export default function InvoiceForm() {
  const { invoice, updateInvoice } = useInvoice();

  return (
    <div className="space-y-6">
      <BasicDetails 
        documentNumber={invoice.invoiceNumber}
        onNumberChange={(val) => updateInvoice({ invoiceNumber: val })}
        date={invoice.date}
        onDateChange={(val) => updateInvoice({ date: val })}
      />
      <ContactDetails
        fromName={invoice.fromName}
        onFromNameChange={(val) => updateInvoice({ fromName: val })}
        fromEmail={invoice.fromEmail}
        onFromEmailChange={(val) => updateInvoice({ fromEmail: val })}
        toName={invoice.toName}
        onToNameChange={(val) => updateInvoice({ toName: val })}
        toEmail={invoice.toEmail}
        onToEmailChange={(val) => updateInvoice({ toEmail: val })}
      />
      <ItemsList />
      <TaxAndTotals />
    </div>
  );
}
