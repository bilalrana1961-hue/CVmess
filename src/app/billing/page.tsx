"use client";

import { CheckCircle2, Clock3, Download, Landmark, ReceiptText, TrendingUp } from "lucide-react";
import { useCVMess } from "@/components/app-provider";
import { PortalShell } from "@/components/portal-shell";
import { StatCard } from "@/components/stat-card";
import { StatusPill } from "@/components/status-pill";
import { formatMoney, friendlyDate } from "@/lib/format";

export default function BillingPage() {
  const { profile, orders } = useCVMess();
  const own = orders.filter((order) => order.userId === profile.id);
  const confirmed = own.filter((order) => order.status === "confirmed");
  const pending = own.filter((order) => order.status === "pending");
  const total = confirmed.reduce((sum, order) => sum + order.total, 0);
  const pendingTotal = pending.reduce((sum, order) => sum + order.total, 0);
  const billingMonth = new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(new Date());

  return (
    <PortalShell title="Monthly bill" description="A clear, itemised record of every confirmed meal.">
      <section className="bill-hero">
        <div><span>{billingMonth}</span><h2>{formatMoney(total)}</h2><p>Current confirmed total</p></div>
        <div className="bill-hero-side"><span><CheckCircle2 size={17} /> {confirmed.length} confirmed meals</span><span><Clock3 size={17} /> {formatMoney(pendingTotal)} pending</span><button><Download size={16} /> Download statement</button></div>
      </section>
      <section className="stats-grid member-stats billing-stats">
        <StatCard label="Confirmed total" value={formatMoney(total)} helper="Included in your bill" icon={ReceiptText} />
        <StatCard label="Pending amount" value={formatMoney(pendingTotal)} helper="Not charged yet" icon={Clock3} tone="sand" />
        <StatCard label="Average per meal" value={formatMoney(confirmed.length ? total / confirmed.length : 0)} helper="This billing period" icon={TrendingUp} tone="rust" />
      </section>
      <section className="panel billing-ledger">
        <div className="panel-heading"><div><span>Itemised statement</span><h3>Confirmed meals</h3></div><StatusPill status="due" /></div>
        <div className="ledger-head"><span>Date</span><span>Meal</span><span>Order ID</span><span>Amount</span></div>
        {confirmed.map((order) => <div className="ledger-row" key={order.id}><span>{friendlyDate(order.item.serviceDate)}</span><div><strong>{order.item.name}</strong><small>{order.item.mealPeriod} · Qty {order.quantity}</small></div><code>#{order.id.slice(-6).toUpperCase()}</code><strong>{formatMoney(order.total)}</strong></div>)}
        <div className="ledger-total"><span>Current bill total</span><strong>{formatMoney(total)}</strong></div>
      </section>
      <section className="payment-note"><Landmark size={22} /><div><strong>Payment is due after the month closes</strong><p>The mess officer will mark your payment as received. Your statement stays available here for back-checking at any time.</p></div></section>
    </PortalShell>
  );
}
