"use client";

import { CalendarDays, Check, Edit3, Plus, ToggleLeft, ToggleRight, X } from "lucide-react";
import { FormEvent, useState } from "react";
import { useCVMess } from "@/components/app-provider";
import { PortalShell } from "@/components/portal-shell";
import { formatMoney, friendlyDate, isoDate } from "@/lib/format";
import type { MealPeriod, MenuItem } from "@/lib/types";

export default function OfficerMenuPage() {
  const { menu, saveMenuItem, toggleMenuItem } = useCVMess();
  const [date, setDate] = useState(isoDate());
  const [editing, setEditing] = useState<MenuItem | null | "new">(null);
  const items = menu.filter((item) => item.serviceDate === date);
  const dates = [...new Set(menu.map((item) => item.serviceDate))].slice(0, 7);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await saveMenuItem({
      id: editing && editing !== "new" ? editing.id : undefined,
      serviceDate: date,
      mealPeriod: String(data.get("mealPeriod")) as MealPeriod,
      name: String(data.get("name")),
      description: String(data.get("description")),
      price: Number(data.get("price")),
      category: String(data.get("category")),
      cutoffTime: String(data.get("cutoffTime")),
      isAvailable: true,
    });
    setEditing(null);
  }

  return (
    <PortalShell title="Manage menu" description="Publish meals, prices, cut-off times, and availability.">
      <section className="date-tabs panel"><div><CalendarDays size={18} /><strong>Menu week</strong></div>{dates.map((itemDate) => <button key={itemDate} className={date === itemDate ? "active" : ""} onClick={() => setDate(itemDate)}><span>{itemDate === isoDate() ? "Today" : friendlyDate(itemDate).split(",")[0]}</span><small>{new Date(`${itemDate}T12:00:00`).getDate()}</small></button>)}</section>
      <div className="section-row-heading"><div><span>{friendlyDate(date, "long")}</span><h2>Meals for this day</h2></div><button className="button dark small" onClick={() => setEditing("new")}><Plus size={16} /> Add meal</button></div>
      <section className="manage-menu-grid">
        {items.map((item) => <article className={`manage-meal-card panel ${item.isAvailable ? "" : "paused"}`} key={item.id} style={{ "--meal-accent": item.accent } as React.CSSProperties}>
          <div className="manage-meal-top"><span>{item.mealPeriod}</span><button onClick={() => void toggleMenuItem(item.id)} aria-label={item.isAvailable ? "Pause item" : "Enable item"}>{item.isAvailable ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}</button></div>
          <h3>{item.name}</h3><p>{item.description}</p>
          <div className="manage-details"><span>Price <b>{formatMoney(item.price)}</b></span><span>Cut-off <b>{item.cutoffTime}</b></span><span>Category <b>{item.category}</b></span></div>
          <div className="manage-footer"><span>{item.isAvailable ? <><i /> Available to order</> : "Ordering paused"}</span><button onClick={() => setEditing(item)}><Edit3 size={15} /> Edit</button></div>
        </article>)}
        <button className="add-meal-card" onClick={() => setEditing("new")}><span><Plus size={22} /></span><strong>Add another meal</strong><small>Breakfast, lunch, or dinner</small></button>
      </section>
      {editing && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setEditing(null)} aria-label="Close modal" /><form className="menu-modal" onSubmit={submit}><div className="modal-heading"><div><span>Menu editor</span><h2>{editing === "new" ? "Add a meal" : "Edit meal"}</h2></div><button type="button" onClick={() => setEditing(null)}><X size={20} /></button></div><div className="field-row"><label><span>Meal period</span><select name="mealPeriod" defaultValue={editing === "new" ? "Lunch" : editing.mealPeriod}><option>Breakfast</option><option>Lunch</option><option>Dinner</option></select></label><label><span>Price (PKR)</span><input required min="1" name="price" type="number" defaultValue={editing === "new" ? "250" : editing.price} /></label></div><label><span>Meal name</span><input required name="name" placeholder="Chicken Biryani" defaultValue={editing === "new" ? "" : editing.name} /></label><label><span>Description</span><textarea required name="description" rows={3} placeholder="What is included with this meal?" defaultValue={editing === "new" ? "" : editing.description} /></label><div className="field-row"><label><span>Category</span><input required name="category" placeholder="Rice" defaultValue={editing === "new" ? "Pakistani" : editing.category} /></label><label><span>Order cut-off</span><input required name="cutoffTime" type="time" defaultValue={editing === "new" ? "12:30" : editing.cutoffTime} /></label></div><div className="modal-actions"><button type="button" className="button light" onClick={() => setEditing(null)}>Cancel</button><button className="button dark"><Check size={16} /> Save meal</button></div></form></div>}
    </PortalShell>
  );
}
