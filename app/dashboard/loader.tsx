import { Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
  className?: string;
}

export default function Loader({
  message = "Loading Ubuntu Invoices...",
  className = "min-h-[60vh]",
}: LoaderProps) {
  return (
    <div className={`flex flex-col justify-center items-center gap-3 p-8 ${className}`}>
      <div className="relative flex items-center justify-center">
        <div className="absolute -inset-2 rounded-full bg-primary/10 blur-sm animate-pulse" />
        <Loader2 className="w-10 h-10 animate-spin text-primary relative z-10" />
      </div>
      {message && (
        <p className="text-sm font-medium text-muted-foreground animate-pulse">
          {message}
        </p>
      )}
    </div>
  );
}