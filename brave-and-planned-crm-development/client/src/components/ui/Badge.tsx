import type { ReactNode } from "react";
import clsx from "clsx";

export function Badge({
  status,
  children,
}: {
  status: "paid" | "unpaid" | "pending" | "sent" | "error" | "new";
  children: ReactNode;
}) {
  const className =
    status === "paid" || status === "sent"
      ? "badge-paid"
      : status === "unpaid" || status === "error"
        ? "badge-unpaid"
        : "badge-pending";

  return <span className={clsx("badge", className)}>{children}</span>;
}
