"use client";

import { Check, Clock3, Plus, Utensils } from "lucide-react";
import { useState } from "react";
import { useCVMess } from "@/components/app-provider";
import { formatMoney } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

export function MealCard({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  const { orders, profile, placeOrder } = useCVMess();
  const [busy, setBusy] = useState(false);
  const existing = orders.find((order) => order.userId === profile.id && order.menuItemId === item.id && ["pending", "confirmed"].includes(order.status));

  async function order() {
    setBusy(true);
    try { await placeOrder(item); } finally { setBusy(false); }
  }

  return (
    <article className={`meal-card ${compact ? "compact" : ""}`} style={{ "--meal-accent": item.accent } as React.CSSProperties}>
      <div className="meal-visual">
        <span><Utensils size={compact ? 20 : 24} strokeWidth={1.7} /></span>
        <small>{item.category}</small>
      </div>
      <div className="meal-body">
        <div className="meal-meta"><span>{item.mealPeriod}</span><span><Clock3 size={13} /> Order by {item.cutoffTime}</span></div>
        <h3>{item.name}</h3>
        {!compact && <p>{item.description}</p>}
        <div className="meal-footer">
          <strong>{formatMoney(item.price)}</strong>
          {existing ? (
            <button className="ordered-button" disabled><Check size={16} /> {existing.status === "confirmed" ? "Confirmed" : "Requested"}</button>
          ) : (
            <button className="order-button" disabled={!item.isAvailable || busy} onClick={() => void order()}>
              {item.isAvailable ? <><Plus size={16} /> {busy ? "Sending…" : "Order meal"}</> : "Unavailable"}
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
