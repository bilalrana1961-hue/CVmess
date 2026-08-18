"use client";

import { Clock3, Minus, Plus, Utensils } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useCVMess } from "@/components/app-provider";
import { formatMoney } from "@/lib/format";
import type { MenuItem } from "@/lib/types";

export function MealCard({ item, compact = false }: { item: MenuItem; compact?: boolean }) {
  const { orders, profile, placeOrder } = useCVMess();
  const [busy, setBusy] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const orderedQuantity = orders
    .filter((order) => order.userId === profile.id && order.menuItemId === item.id && ["pending", "confirmed"].includes(order.status))
    .reduce((sum, order) => sum + order.quantity, 0);

  async function order() {
    setBusy(true);
    try {
      await placeOrder(item, quantity);
      setQuantity(1);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Your order could not be sent. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={`meal-card ${compact ? "compact" : ""}`} style={{ "--meal-accent": item.accent } as React.CSSProperties}>
      <div className="meal-visual"><span><Utensils size={compact ? 20 : 24} strokeWidth={1.7} /></span><small>{item.category}</small></div>
      <div className="meal-body">
        <div className="meal-meta"><span>{item.mealPeriod}</span><span><Clock3 size={13} /> Order by {item.cutoffTime}</span></div>
        <h3>{item.name}</h3>
        {!compact && <p>{item.description}</p>}
        {orderedQuantity > 0 && <small className="ordered-summary">Pending or confirmed quantity: {orderedQuantity}</small>}
        <div className="meal-footer">
          <div className="meal-price"><strong>{formatMoney(item.price * quantity)}</strong><small>{formatMoney(item.price)} each</small></div>
          <div className="meal-order-controls">
            <div className="quantity-stepper" aria-label={`Quantity for ${item.name}`}>
              <button type="button" disabled={quantity === 1 || busy} onClick={() => setQuantity((value) => Math.max(1, value - 1))} aria-label="Decrease quantity"><Minus size={15} /></button>
              <output aria-live="polite">{quantity}</output>
              <button type="button" disabled={quantity === 10 || busy} onClick={() => setQuantity((value) => Math.min(10, value + 1))} aria-label="Increase quantity"><Plus size={15} /></button>
            </div>
            <button className="order-button" disabled={!item.isAvailable || busy} onClick={() => void order()}>{item.isAvailable ? <><Plus size={16} /> {busy ? "Sending…" : "Add order"}</> : "Unavailable"}</button>
          </div>
        </div>
      </div>
    </article>
  );
}
