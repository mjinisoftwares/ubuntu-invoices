import { Card, CardContent } from "./ui/card";
import { useQuotation } from "@/context/quotation-context";

export default function QuotationTotals() {
  const { quotation } = useQuotation();

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between font-bold text-lg pt-4 border-t">
              <span>Total</span>
              <span>KES {Number(quotation.total).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
