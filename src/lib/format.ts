import { format } from "date-fns";

export function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDateLabel(value: string) {
  return format(new Date(value), "MMM d, yyyy");
}

export function formatTimeLabel(value: string) {
  return format(new Date(value), "p");
}
