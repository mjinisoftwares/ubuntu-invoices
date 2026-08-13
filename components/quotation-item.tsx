import { QuotationItem as QItemType } from "@/types/quotation";
import { useQuotation } from "@/context/quotation-context";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Trash2 } from "lucide-react";

interface QuotationItemProps {
  item: QItemType;
  index: number;
  canRemove: boolean;
}

export default function QuotationItem({ item, index, canRemove }: QuotationItemProps) {
  const { updateItem, removeItem } = useQuotation();

  return (
    <div className="flex flex-col md:flex-row gap-4 items-end border-b pb-4 mb-4 md:border-none md:pb-0 md:mb-0">
      <div className="flex-1 w-full">
        <label className="text-sm font-medium mb-1 block">Date</label>
        <Input
          type="date"
          value={item.date}
          onChange={(e) => updateItem(index, "date", e.target.value)}
        />
      </div>
      <div className="flex-1 w-full md:w-48">
        <label className="text-xs font-medium mb-1 block">Pickup Point</label>
        <Input
          type="text"
          value={item.pickupPaid}
          onChange={(e) => updateItem(index, "pickupPaid", e.target.value)}
          placeholder="e.g. Nairobi CBD"
        />
      </div>
      <div className="flex-1 w-full md:w-48">
        <label className="text-sm font-medium mb-1 block">Dropoff / Return</label>
        <Input
          type="text"
          value={item.dropoffReturnTrip}
          onChange={(e) => updateItem(index, "dropoffReturnTrip", e.target.value)}
          placeholder="e.g. Naivasha Route"
        />
      </div>
      <div className="w-full md:w-32">
        <label className="text-sm font-medium mb-1 block">Amount</label>
        <Input
          type="number"
          value={item.amount}
          onChange={(e) => updateItem(index, "amount", e.target.value === "" ? "" : Number(e.target.value))}
        />
      </div>
      <div className="w-full md:w-auto">
        <Button
          variant="destructive"
          size="icon"
          onClick={() => removeItem(index)}
          disabled={!canRemove}
          className="w-full md:w-10"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
