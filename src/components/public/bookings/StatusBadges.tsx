import { Badge } from "@/components/ui/badge";
import { CheckCircle, Clock, XCircle, CreditCard } from "lucide-react";

type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

const bookingStatusMap: Record<
  BookingStatus,
  { variant: "warning" | "success" | "danger" | "info"; icon: typeof Clock }
> = {
  pending: { variant: "warning", icon: Clock },
  confirmed: { variant: "success", icon: CheckCircle },
  cancelled: { variant: "danger", icon: XCircle },
  completed: { variant: "info", icon: CheckCircle },
};

const paymentStatusMap: Record<
  PaymentStatus,
  { variant: "warning" | "success" | "danger" | "default" }
> = {
  pending: { variant: "warning" },
  paid: { variant: "success" },
  failed: { variant: "danger" },
  refunded: { variant: "default" },
};

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const { variant, icon: Icon } = bookingStatusMap[status];
  return (
    <Badge variant={variant} className="inline-flex items-center gap-1">
      <Icon size={14} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { variant } = paymentStatusMap[status];
  return (
    <Badge variant={variant} className="inline-flex items-center gap-1">
      <CreditCard size={14} />
      {status === "paid" ? "Paid" : status.charAt(0).toUpperCase() + status.slice(1)}
    </Badge>
  );
}
