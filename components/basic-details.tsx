import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";

interface BasicDetailsProps {
  title?: string;
  numberLabel?: string;
  documentNumber: string;
  onNumberChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
}

export default function BasicDetails({
  title = "Invoice Details",
  numberLabel = "Invoice Number",
  documentNumber,
  onNumberChange,
  date,
  onDateChange,
}: BasicDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="documentNumber">{numberLabel}</Label>
          <Input
            value={documentNumber}
            onChange={(e) => onNumberChange(e.target.value)}
            id="documentNumber"
          />
        </div>
        <div>
          <Label htmlFor="date">Date</Label>
          <Input
            id="date"
            type="date"
            onChange={(e) => onDateChange(e.target.value)}
            value={date}
          />
        </div>
      </CardContent>
    </Card>
  );
}
