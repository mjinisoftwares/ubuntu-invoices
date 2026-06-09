import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import QuotationItem from "./quotation-item";
import { useQuotation } from "@/context/quotation-context";

export default function QuotationItemsList() {
  const { quotation, addItem } = useQuotation();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quotation Items</CardTitle>
        <Button onClick={addItem} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {quotation.items.map((item, index) => (
          <QuotationItem
            key={item.id}
            item={item}
            index={index}
            canRemove={quotation.items.length > 1}
          />
        ))}
      </CardContent>
    </Card>
  );
}
