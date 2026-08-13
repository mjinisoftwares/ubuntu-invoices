import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";

export interface StatusOption {
  value: string;
  label: string;
  badgeClass?: string;
}

interface BasicDetailsProps {
  title?: string;
  numberLabel?: string;
  documentNumber: string;
  onNumberChange: (value: string) => void;
  date: string;
  onDateChange: (value: string) => void;
  dueDate?: string;
  onDueDateChange?: (value: string) => void;
  status?: string;
  onStatusChange?: (value: string) => void;
  statusOptions?: StatusOption[];
}

export default function BasicDetails({
  title = "Invoice Details",
  numberLabel = "Invoice Number",
  documentNumber,
  onNumberChange,
  date,
  onDateChange,
  dueDate = "",
  onDueDateChange,
  status = "DRAFT",
  onStatusChange,
  statusOptions,
}: BasicDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{title}</CardTitle>
          {status && (
            <Badge variant="outline" className="font-semibold text-xs px-2.5 py-0.5 uppercase tracking-wider">
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <Label htmlFor="documentNumber">{numberLabel}</Label>
          <Input
            value={documentNumber}
            onChange={(e) => onNumberChange(e.target.value)}
            id="documentNumber"
          />
        </div>
        <div>
          <Label htmlFor="date">Issue Date</Label>
          <Input
            id="date"
            type="date"
            onChange={(e) => onDateChange(e.target.value)}
            value={date}
          />
        </div>
        {onDueDateChange && (
          <div>
            <Label htmlFor="dueDate">Due Date</Label>
            <Input
              id="dueDate"
              type="date"
              onChange={(e) => onDueDateChange(e.target.value)}
              value={dueDate}
            />
          </div>
        )}
        {onStatusChange && statusOptions && (
          <div>
            <Label htmlFor="statusSelect">Document Status</Label>
            <Select value={status} onValueChange={onStatusChange}>
              <SelectTrigger id="statusSelect" className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
