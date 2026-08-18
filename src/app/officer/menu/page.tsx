"use client";

import { CalendarClock, CalendarDays, Check, Edit3, Plus, Repeat2, ToggleLeft, ToggleRight, X } from "lucide-react";
import { FormEvent, useMemo, useState } from "react";
import { toast } from "sonner";
import { EmptyState } from "@/components/empty-state";
import { useCVMess } from "@/components/app-provider";
import { PortalShell } from "@/components/portal-shell";
import { formatMoney, friendlyDate, isoDate } from "@/lib/format";
import type { MealPeriod, MenuItem, WeeklyMenuTemplate } from "@/lib/types";

const days = [
  { label: "Monday", short: "Mon", value: 1 }, { label: "Tuesday", short: "Tue", value: 2 },
  { label: "Wednesday", short: "Wed", value: 3 }, { label: "Thursday", short: "Thu", value: 4 },
  { label: "Friday", short: "Fri", value: 5 }, { label: "Saturday", short: "Sat", value: 6 },
  { label: "Sunday", short: "Sun", value: 0 },
];

function upcomingDates() {
  return Array.from({ length: 8 }, (_, offset) => {
    const value = new Date();
    value.setDate(value.getDate() + offset);
    return isoDate(value);
  });
}

type Editor = { kind: "weekly"; item?: WeeklyMenuTemplate } | { kind: "date"; item?: MenuItem };

export default function OfficerMenuPage() {
  const { menu, weeklyMenu, saveMenuItem, toggleMenuItem, saveWeeklyMenuItem, toggleWeeklyMenuItem } = useCVMess();
  const [mode, setMode] = useState<"weekly" | "date">("weekly");
  const [weekday, setWeekday] = useState(1);
  const [date, setDate] = useState(isoDate());
  const [editing, setEditing] = useState<Editor | null>(null);
  const [saving, setSaving] = useState(false);
  const dates = useMemo(() => upcomingDates(), []);
  const weeklyItems = weeklyMenu.filter((item) => item.weekday === weekday);
  const datedItems = menu.filter((item) => item.serviceDate === date);
  const items = mode === "weekly" ? weeklyItems : datedItems;
  const selectedDay = days.find((day) => day.value === weekday)?.label ?? "Monday";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!editing) return;
    const data = new FormData(event.currentTarget);
    const common = {
      mealPeriod: String(data.get("mealPeriod")) as MealPeriod,
      name: String(data.get("name")), description: String(data.get("description")),
      price: Number(data.get("price")), category: String(data.get("category")),
      cutoffTime: String(data.get("cutoffTime")), isAvailable: editing.item?.isAvailable ?? true,
    };
    setSaving(true);
    try {
      if (editing.kind === "weekly") await saveWeeklyMenuItem({ ...common, id: editing.item?.id, weekday });
      else await saveMenuItem({ ...common, id: editing.item?.id, serviceDate: date });
      setEditing(null);
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "The menu could not be updated.");
    } finally { setSaving(false); }
  }

  return (
    <PortalShell title="Manage menu" description="Set the normal weekly routine once, then make occasional date changes.">
      <section className="menu-workflow panel">
        <div><span className="page-intro-icon"><Repeat2 size={22} /></span><div><strong>One weekly menu, repeated automatically</strong><p>Build the usual Monday–Sunday routine once. CVmess publishes it eight weeks ahead and keeps extending it every day.</p></div></div>
        <div className="menu-mode-switch" role="tablist" aria-label="Menu management mode"><button role="tab" aria-selected={mode === "weekly"} className={mode === "weekly" ? "active" : ""} onClick={() => setMode("weekly")}><Repeat2 size={16} /> Weekly routine</button><button role="tab" aria-selected={mode === "date"} className={mode === "date" ? "active" : ""} onClick={() => setMode("date")}><CalendarClock size={16} /> Date changes</button></div>
      </section>

      {mode === "weekly" ? (
        <section className="date-tabs weekly-tabs panel"><div><Repeat2 size={18} /><strong>Every week</strong></div>{days.map((day) => <button key={day.value} className={weekday === day.value ? "active" : ""} onClick={() => setWeekday(day.value)}><span>{day.short}</span><small>{weeklyMenu.filter((item) => item.weekday === day.value).length}</small></button>)}</section>
      ) : (
        <section className="date-tabs panel"><div><CalendarDays size={18} /><strong>Specific date</strong></div>{dates.map((itemDate) => <button key={itemDate} className={date === itemDate ? "active" : ""} onClick={() => setDate(itemDate)}><span>{itemDate === isoDate() ? "Today" : friendlyDate(itemDate).split(",")[0]}</span><small>{new Date(`${itemDate}T12:00:00`).getDate()}</small></button>)}</section>
      )}

      <div className="section-row-heading"><div><span>{mode === "weekly" ? `Repeats every ${selectedDay}` : friendlyDate(date, "long")}</span><h2>{mode === "weekly" ? `${selectedDay} routine` : "Menu for this date"}</h2><p>{mode === "weekly" ? "Changes update future dates that have not been individually overridden." : "These changes affect only this date, not the weekly routine."}</p></div><button className="button dark small" onClick={() => setEditing({ kind: mode })}><Plus size={16} /> Add meal</button></div>

      {items.length > 0 ? <section className="manage-menu-grid">{items.map((rawItem) => {
        const item = rawItem as MenuItem | WeeklyMenuTemplate;
        return <article className={`manage-meal-card panel ${item.isAvailable ? "" : "paused"}`} key={item.id} style={{ "--meal-accent": item.accent } as React.CSSProperties}>
          <div className="manage-meal-top"><span>{item.mealPeriod}</span><button onClick={() => void (mode === "weekly" ? toggleWeeklyMenuItem(item.id) : toggleMenuItem(item.id))} aria-label={item.isAvailable ? "Pause item" : "Enable item"}>{item.isAvailable ? <ToggleRight size={26} /> : <ToggleLeft size={26} />}</button></div>
          <h3>{item.name}</h3><p>{item.description}</p>
          <div className="manage-details"><span>Price <b>{formatMoney(item.price)}</b></span><span>Cut-off <b>{item.cutoffTime}</b></span><span>Category <b>{item.category}</b></span></div>
          <div className="manage-footer"><span>{item.isAvailable ? <><i /> Available to order</> : "Ordering paused"}</span><button onClick={() => setEditing(mode === "weekly" ? { kind: "weekly", item: item as WeeklyMenuTemplate } : { kind: "date", item: item as MenuItem })}><Edit3 size={15} /> Edit</button></div>
        </article>;
      })}<button className="add-meal-card" onClick={() => setEditing({ kind: mode })}><span><Plus size={22} /></span><strong>Add another meal</strong><small>Breakfast, tea break, lunch, or dinner</small></button></section> : <section className="panel"><EmptyState icon={mode === "weekly" ? Repeat2 : CalendarDays} title={mode === "weekly" ? `No ${selectedDay} routine yet` : "No meals on this date"} description={mode === "weekly" ? "Add a meal once and it will appear on every upcoming matching day." : "Add a one-day meal here, or set the normal meal in Weekly routine."} /></section>}

      {editing && <div className="modal-layer"><button className="modal-backdrop" onClick={() => setEditing(null)} aria-label="Close modal" /><form className="menu-modal" onSubmit={submit}><div className="modal-heading"><div><span>{editing.kind === "weekly" ? `Every ${selectedDay}` : friendlyDate(date, "long")}</span><h2>{editing.item ? "Edit meal" : "Add a meal"}</h2><p>{editing.kind === "weekly" ? "This becomes part of the repeating weekly routine." : "This meal or change applies to this date only."}</p></div><button type="button" onClick={() => setEditing(null)} aria-label="Close"><X size={20} /></button></div><div className="field-row"><label><span>Meal period</span><select name="mealPeriod" defaultValue={editing.item?.mealPeriod ?? "Lunch"}><option>Breakfast</option><option>Tea Break</option><option>Lunch</option><option>Dinner</option></select></label><label><span>Price (PKR)</span><input required min="1" name="price" type="number" defaultValue={editing.item?.price ?? 250} /></label></div><label><span>Meal name</span><input required name="name" placeholder="Chicken Biryani" defaultValue={editing.item?.name ?? ""} /></label><label><span>Description</span><textarea required name="description" rows={3} placeholder="What is included with this meal?" defaultValue={editing.item?.description ?? ""} /></label><div className="field-row"><label><span>Category</span><input required name="category" placeholder="Rice" defaultValue={editing.item?.category ?? "Pakistani"} /></label><label><span>Order cut-off</span><input required name="cutoffTime" type="time" defaultValue={editing.item?.cutoffTime ?? "12:30"} /></label></div><div className="modal-actions"><button type="button" className="button light" onClick={() => setEditing(null)}>Cancel</button><button className="button dark" disabled={saving}><Check size={16} /> {saving ? "Saving…" : editing.kind === "weekly" ? "Save weekly meal" : "Save date change"}</button></div></form></div>}
    </PortalShell>
  );
}
