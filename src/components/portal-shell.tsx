"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bell,
  CalendarDays,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Menu as MenuIcon,
  ReceiptText,
  Settings,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Logo } from "@/components/logo";
import { useCVMess } from "@/components/app-provider";
import { initials } from "@/lib/format";

const memberNav = [
  { href: "/dashboard", label: "Overview", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/menu", label: "Weekly menu", mobileLabel: "Menu", icon: CalendarDays },
  { href: "/orders", label: "My orders", mobileLabel: "Orders", icon: ClipboardList },
  { href: "/billing", label: "Monthly bill", mobileLabel: "Bill", icon: ReceiptText },
  { href: "/settings", label: "Settings", mobileLabel: "Settings", icon: Settings },
];

const officerNav = [
  { href: "/officer", label: "Overview", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/officer/orders", label: "Order queue", mobileLabel: "Orders", icon: ClipboardList },
  { href: "/officer/menu", label: "Manage menu", mobileLabel: "Menu", icon: CalendarDays },
  { href: "/officer/members", label: "Members & bills", mobileLabel: "Members", icon: Users },
  { href: "/settings", label: "Settings", mobileLabel: "Settings", icon: Settings },
];

export function PortalShell({ children, title, description }: { children: React.ReactNode; title: string; description?: string }) {
  const pathname = usePathname();
  const { profile, notifications, loading, error, signOut } = useCVMess();
  const [mobileOpen, setMobileOpen] = useState(false);
  const nav = profile.role === "officer" ? officerNav : memberNav;
  const unread = notifications.filter((note) => !note.isRead).length;

  const sidebar = (
    <>
      <div className="sidebar-head">
        <Logo href={profile.role === "officer" ? "/officer" : "/dashboard"} />
        <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation"><X size={20} /></button>
      </div>
      <div className="role-label">{profile.role === "officer" ? "Mess officer portal" : "Member portal"}</div>
      <nav className="sidebar-nav" aria-label="Primary navigation">
        {nav.map((item) => {
          const active = item.href === "/officer" || item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={active ? "active" : ""} onClick={() => setMobileOpen(false)}>
              <item.icon size={19} strokeWidth={1.8} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="sidebar-spacer" />
      <div className="sidebar-profile">
        <span className="avatar">{initials(profile.fullName)}</span>
        <div><strong>{profile.fullName}</strong><small>{profile.room}</small></div>
        <button onClick={() => void signOut()} aria-label="Sign out" title="Sign out"><LogOut size={16} /></button>
      </div>
    </>
  );

  return (
    <div className="portal-layout">
      <aside className="sidebar">{sidebar}</aside>
      {mobileOpen && <div className="mobile-drawer"><button className="drawer-backdrop" onClick={() => setMobileOpen(false)} aria-label="Close navigation" /><aside>{sidebar}</aside></div>}
      <main className="portal-main">
        <header className="topbar">
          <button className="menu-toggle" onClick={() => setMobileOpen(true)} aria-label="Open navigation"><MenuIcon size={21} /></button>
          <div className="topbar-copy">
            <h1>{title}</h1>
            {description && <p>{description}</p>}
          </div>
          <div className="topbar-actions">
            {profile.role === "member" && (
              <Link href="/notifications" className="icon-button" aria-label={`${unread} unread notifications`}>
                <Bell size={20} />{unread > 0 && <span>{unread}</span>}
              </Link>
            )}
            <Link href="/settings" className="icon-button desktop-only" aria-label="Settings"><Settings size={20} /></Link>
            <button className="profile-chip" onClick={() => void signOut()} title="Sign out">
              <span className="avatar small">{initials(profile.fullName)}</span>
              <span className="profile-chip-copy"><strong>{profile.fullName.split(" ")[0]}</strong><small>{profile.role === "officer" ? "Mess officer" : profile.room}</small></span>
              <LogOut size={15} />
            </button>
          </div>
        </header>
        <div className="page-content">{error ? <div className="panel empty-state" role="alert"><h3>We couldn’t load CVmess</h3><p>{error}</p><button className="button dark small" onClick={() => window.location.reload()}>Try again</button></div> : loading ? <div className="panel empty-state"><h3>Loading your account</h3><p>Please wait a moment.</p></div> : children}</div>
      </main>
      <nav className="mobile-bottom-nav" aria-label="Mobile navigation">
        {nav.slice(0, 4).map((item) => {
          const active = item.href === "/officer" || item.href === "/dashboard" ? pathname === item.href : pathname.startsWith(item.href);
          return <Link key={item.href} href={item.href} className={active ? "active" : ""}><item.icon size={20} /><span>{item.mobileLabel}</span></Link>;
        })}
      </nav>
    </div>
  );
}
