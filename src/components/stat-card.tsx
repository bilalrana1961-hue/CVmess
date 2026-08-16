import type { LucideIcon } from "lucide-react";

export function StatCard({ label, value, helper, icon: Icon, tone = "olive" }: { label: string; value: string; helper: string; icon: LucideIcon; tone?: "olive" | "sand" | "rust" | "green" }) {
  return (
    <article className="stat-card">
      <span className={`stat-icon tone-${tone}`}><Icon size={20} strokeWidth={1.8} /></span>
      <div><p>{label}</p><strong>{value}</strong><small>{helper}</small></div>
    </article>
  );
}
