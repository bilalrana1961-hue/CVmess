import { type LucideIcon, UtensilsCrossed } from "lucide-react";

export function EmptyState({ title, text, description, icon: Icon = UtensilsCrossed }: { title: string; text?: string; description?: string; icon?: LucideIcon }) {
  return (
    <div className="empty-state">
      <span><Icon size={22} /></span>
      <h3>{title}</h3>
      <p>{description ?? text}</p>
    </div>
  );
}
