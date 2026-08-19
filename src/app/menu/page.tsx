"use client";

import { CalendarDays, Search, UtensilsCrossed } from "lucide-react";
import { useMemo, useState } from "react";
import { EmptyState } from "@/components/empty-state";
import { MealCard } from "@/components/meal-card";
import { PortalShell } from "@/components/portal-shell";
import { useCVMess } from "@/components/app-provider";
import { friendlyDate, isoDate } from "@/lib/format";

export default function MenuPage() {
  const { menu } = useCVMess();
  const [filter, setFilter] = useState("All meals");
  const [search, setSearch] = useState("");
  const today = isoDate();
  const visible = useMemo(() => menu.filter((item) => item.serviceDate === today && (filter === "All meals" || item.mealPeriod === filter) && item.name.toLowerCase().includes(search.toLowerCase())), [menu, filter, search, today]);

  return (
    <PortalShell title="Menu" description="View and order meals available today.">
      <section className="page-intro-card panel"><span className="page-intro-icon"><CalendarDays size={22} /></span><div><strong>Today’s menu</strong><p>{friendlyDate(today, "long")} · Only today’s available meal choices are shown.</p></div></section>
      <div className="toolbar panel">
        <div className="segmented">{["All meals", "Breakfast", "Tea Break", "Lunch", "Dinner"].map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div>
        <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu" /></label>
      </div>
      {visible.length ? <section className="meal-grid">{visible.map((item) => <MealCard key={item.id} item={item} />)}</section> : <section className="panel"><EmptyState icon={UtensilsCrossed} title="No matching meals today" description={search || filter !== "All meals" ? "Try clearing the search or selecting All meals." : "The mess officer has not published today’s menu yet."} /></section>}
    </PortalShell>
  );
}
