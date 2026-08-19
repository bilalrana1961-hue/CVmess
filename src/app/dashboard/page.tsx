"use client";

import Link from "next/link";
import { ArrowRight, CalendarCheck2, CheckCircle2, Clock3, ReceiptText, Sparkles, UtensilsCrossed } from "lucide-react";
import { MealCard } from "@/components/meal-card";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { useCVMess } from "@/components/app-provider";
import { formatMoney, friendlyDate, isoDate, timeAgo } from "@/lib/format";

export default function DashboardPage() {
  const { profile, menu, orders } = useCVMess();
  const ownOrders = orders.filter((order) => order.userId === profile.id);
  const todayMenu = menu.filter((item) => item.serviceDate === isoDate());
  const confirmed = ownOrders.filter((order) => order.status === "confirmed");
  const monthTotal = confirmed.reduce((sum, order) => sum + order.total, 0);
  const pending = ownOrders.filter((order) => order.status === "pending").length;
  const monthName = new Intl.DateTimeFormat("en", { month: "long" }).format(new Date());

  return (
    <PortalShell title={`Good afternoon, ${profile.fullName.split(" ")[0]}`} description={`${friendlyDate(isoDate(), "long")} · Here’s what’s cooking.`}>
      <section className="dashboard-welcome">
        <div><span><Sparkles size={15} /> Today at CVmess</span><h2>{todayMenu.length ? `${todayMenu.length} meals available today.` : "Today’s menu is not available yet."}<br />{todayMenu.length ? "Order when you’re ready." : "Please check again later."}</h2><p>Every confirmed order is added to your monthly bill automatically.</p></div>
        <div className="welcome-pattern"><UtensilsCrossed size={44} /><span>CV</span><small>105</small></div>
      </section>

      <section className="stats-grid member-stats">
        <StatCard label={`${monthName} bill`} value={formatMoney(monthTotal)} helper={`${confirmed.length} confirmed meals`} icon={ReceiptText} tone="olive" />
        <StatCard label="Orders this month" value={String(ownOrders.length)} helper="Across all meal times" icon={CalendarCheck2} tone="sand" />
        <StatCard label="Awaiting confirmation" value={String(pending)} helper={pending ? "The officer has been notified" : "You’re all caught up"} icon={Clock3} tone="rust" />
      </section>

      <div className="section-row-heading"><div><span>Today’s menu</span><h2>Pick today’s meals</h2><p>Only meals available for {friendlyDate(isoDate(), "long")} are shown here.</p></div></div>
      <section className="meal-grid">
        {todayMenu.length ? todayMenu.map((item) => <MealCard key={item.id} item={item} />) : <EmptyState title="No meals published" text="The mess officer has not published today’s menu yet." />}
      </section>

      <section className="dashboard-bottom-grid">
        <article className="panel recent-panel">
          <div className="panel-heading"><div><span>Activity</span><h3>Recent orders</h3></div><Link href="/orders">See all</Link></div>
          <div className="order-list compact-list">
            {ownOrders.length ? ownOrders.slice(0, 4).map((order) => (
              <div className="order-row" key={order.id}>
                <span className="order-icon"><UtensilsCrossed size={17} /></span>
                <div className="order-main"><strong>{order.item.name}</strong><small suppressHydrationWarning>{order.item.mealPeriod} · {friendlyDate(order.item.serviceDate)} · {timeAgo(order.createdAt)}</small></div>
                <strong className="order-price">{formatMoney(order.total)}</strong><StatusPill status={order.status} />
              </div>
            )) : <EmptyState title="No recent orders" text="Your orders will appear here after you place them." />}
          </div>
        </article>
        <article className="panel bill-glance">
          <div className="panel-heading"><div><span>Your month</span><h3>Bill at a glance</h3></div><ReceiptText size={20} /></div>
          <div className="bill-ring" style={{ "--progress": `${Math.min(100, monthTotal / 90)}%` } as React.CSSProperties}><div><strong>{formatMoney(monthTotal)}</strong><small>current total</small></div></div>
          <div className="bill-metrics"><span><CheckCircle2 size={16} /> Confirmed meals <b>{confirmed.length}</b></span><span><Clock3 size={16} /> Pending <b>{pending}</b></span></div>
          <Link className="button light full" href="/billing">View itemised bill <ArrowRight size={15} /></Link>
        </article>
      </section>
    </PortalShell>
  );
}
