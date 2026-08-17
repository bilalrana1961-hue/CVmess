"use client";

import { CalendarDays, ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { MealCard } from "@/components/meal-card";
import { PortalShell } from "@/components/portal-shell";
import { useCVMess } from "@/components/app-provider";
import { friendlyDate, isoDate } from "@/lib/format";

export default function MenuPage() {
  const { menu } = useCVMess();
  const [filter, setFilter] = useState("All meals");
  const [search, setSearch] = useState("");
  const dates = [...new Set(menu.map((item) => item.serviceDate))].slice(0, 7);
  const visible = useMemo(() => menu.filter((item) => (filter === "All meals" || item.mealPeriod === filter) && item.name.toLowerCase().includes(search.toLowerCase())), [menu, filter, search]);

  return (
    <PortalShell title="Weekly menu" description="Plan ahead and order any available meal.">
      <div className="toolbar panel">
        <div className="week-picker"><button aria-label="Previous week"><ChevronLeft size={17} /></button><span><CalendarDays size={17} /> This week</span><button aria-label="Next week"><ChevronRight size={17} /></button></div>
        <div className="segmented">{["All meals", "Breakfast", "Tea Break", "Lunch", "Dinner"].map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value}</button>)}</div>
        <label className="search-field"><Search size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search menu" /></label>
      </div>
      <div className="week-menu">
        {dates.map((date) => {
          const dayItems = visible.filter((item) => item.serviceDate === date);
          if (!dayItems.length) return null;
          return (
            <section key={date} className="day-section">
              <div className="day-label"><span>{date === isoDate() ? "Today" : friendlyDate(date).split(",")[0]}</span><strong>{friendlyDate(date, "long").replace(/^[^,]+,\s*/, "")}</strong>{date === isoDate() && <small>Ordering open</small>}</div>
              <div className="day-meals">{dayItems.map((item) => <MealCard key={item.id} item={item} compact />)}</div>
            </section>
          );
        })}
      </div>
    </PortalShell>
  );
}
