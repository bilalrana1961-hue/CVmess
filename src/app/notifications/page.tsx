"use client";

import { BellRing, CheckCheck, CircleDollarSign, ClipboardCheck, UtensilsCrossed } from "lucide-react";
import { useCVMess } from "@/components/app-provider";
import { EmptyState } from "@/components/empty-state";
import { PortalShell } from "@/components/portal-shell";
import { timeAgo } from "@/lib/format";

const icons = { order: ClipboardCheck, bill: CircleDollarSign, menu: UtensilsCrossed, general: BellRing };

export default function NotificationsPage() {
  const { notifications, markNotificationRead } = useCVMess();
  return (
    <PortalShell title="Notifications" description="Order decisions, menu updates, and billing news.">
      <section className="panel notifications-panel">
        <div className="panel-heading"><div><span>Inbox</span><h3>{notifications.filter((note) => !note.isRead).length} unread updates</h3></div><button className="text-button" onClick={() => void markNotificationRead()}><CheckCheck size={16} /> Mark all as read</button></div>
        {notifications.length ? <div className="notification-list">{notifications.map((note) => { const Icon = icons[note.type]; return <button key={note.id} className={`notification-row ${note.isRead ? "" : "unread"}`} onClick={() => void markNotificationRead(note.id)}><span className={`notification-icon note-${note.type}`}><Icon size={19} /></span><div><strong>{note.title}</strong><p>{note.message}</p><small suppressHydrationWarning>{timeAgo(note.createdAt)}</small></div>{!note.isRead && <i />}</button>; })}</div> : <EmptyState title="You’re all caught up" text="Order confirmations and bill updates will appear here." />}
      </section>
    </PortalShell>
  );
}
