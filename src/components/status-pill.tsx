import type { OrderStatus } from "@/lib/types";

export function StatusPill({ status }: { status: OrderStatus | "paid" | "due" | "available" }) {
  return <span className={`status-pill status-${status}`}><i />{status}</span>;
}
