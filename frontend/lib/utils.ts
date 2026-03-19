import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function getStatusVariant(status: string): "success" | "warning" | "danger" | "info" | "default" {
  const map: Record<string, "success" | "warning" | "danger" | "info" | "default"> = {
    auto_approved: "success",
    approved: "success",
    active: "success",
    fast_verify: "info",
    manual_review: "warning",
    pending: "warning",
    rejected: "danger",
  };
  return map[status] ?? "default";
}

export function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    auto_approved: "Auto Approved",
    approved: "Approved",
    fast_verify: "Fast Verify",
    manual_review: "Manual Review",
    pending: "Pending",
    rejected: "Rejected",
    active: "Active",
  };
  return map[status] ?? status;
}
