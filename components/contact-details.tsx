import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

interface ContactDetailsProps {
  fromName: string;
  onFromNameChange: (val: string) => void;
  fromEmail: string;
  onFromEmailChange: (val: string) => void;
  toName: string;
  onToNameChange: (val: string) => void;
  toEmail: string;
  onToEmailChange: (val: string) => void;
}

export default function ContactDetails({
  fromName,
  onFromNameChange,
  fromEmail,
  onFromEmailChange,
  toName,
  onToNameChange,
  toEmail,
  onToEmailChange
}: ContactDetailsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>From & To</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-4">
          <h3 className="font-medium">From (Your Details)</h3>
          <div>
            <Label htmlFor="fromName">Name</Label>
            <Input
              id="fromName"
              value={fromName}
              onChange={(e) => onFromNameChange(e.target.value)}
              placeholder="Your name or company"
            />
          </div>
          <div>
            <Label htmlFor="fromEmail">Email</Label>
            <Input
              id="fromEmail"
              value={fromEmail}
              onChange={(e) => onFromEmailChange(e.target.value)}
              placeholder="your@email.com"
              type="email"
            />
          </div>
        </div>
        <div className="space-y-4">
          <h3 className="font-medium">To (Client Details)</h3>
          <div>
            <Label htmlFor="toName">Name</Label>
            <Input
              id="toName"
              value={toName}
              onChange={(e) => onToNameChange(e.target.value)}
              placeholder="Client name or company"
            />
          </div>
          <div>
            <Label htmlFor="toEmail">Email</Label>
            <Input
              value={toEmail}
              onChange={(e) => onToEmailChange(e.target.value)}
              id="toEmail"
              placeholder="client@email.com"
              type="email"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
