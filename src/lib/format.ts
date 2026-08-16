export const PKR = new Intl.NumberFormat("en-PK", {
  style: "currency",
  currency: "PKR",
  maximumFractionDigits: 0,
});

export function formatMoney(value: number) {
  return PKR.format(value).replace("PKR", "Rs.");
}

export function isoDate(date = new Date()) {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
}

export function addDays(days: number) {
  const value = new Date();
  value.setDate(value.getDate() + days);
  return isoDate(value);
}

export function friendlyDate(value: string, style: "short" | "long" = "short") {
  const date = new Date(`${value}T12:00:00`);
  return new Intl.DateTimeFormat("en-PK", {
    weekday: style === "long" ? "long" : "short",
    day: "numeric",
    month: style === "long" ? "long" : "short",
  }).format(date);
}

export function timeAgo(value: string) {
  const diff = Date.now() - new Date(value).getTime();
  const minutes = Math.max(1, Math.floor(diff / 60_000));
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
