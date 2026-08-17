"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { demoMembers, demoMenu, demoNotifications, demoOrders, memberProfile, officerProfile } from "@/lib/demo-data";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AppNotification, MemberSummary, MenuItem, Order, OrderStatus, Profile } from "@/lib/types";

type MenuDraft = Omit<MenuItem, "id" | "accent"> & { id?: string };

interface CVMessContextValue {
  profile: Profile;
  menu: MenuItem[];
  orders: Order[];
  notifications: AppNotification[];
  members: MemberSummary[];
  accounts: Profile[];
  configured: boolean;
  loading: boolean;
  placeOrder: (item: MenuItem, quantity?: number, note?: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  saveMenuItem: (draft: MenuDraft) => Promise<void>;
  toggleMenuItem: (id: string) => Promise<void>;
  markNotificationRead: (id?: string) => Promise<void>;
  markPayment: (memberId: string, paid: boolean) => Promise<void>;
  setAccountRole: (accountId: string, role: Profile["role"]) => Promise<void>;
  signOut: () => Promise<void>;
}

const CVMessContext = createContext<CVMessContextValue | null>(null);

const accents = ["#d99b56", "#a9684a", "#73845f", "#8f7957"];

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    fullName: String(row.full_name || "CVmess Member"),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    room: String(row.room || "Room not set"),
    role: row.role === "officer" ? "officer" : "member",
    joinedAt: row.created_at ? String(row.created_at) : undefined,
  };
}

function mapMenu(row: Record<string, unknown>, index = 0): MenuItem {
  return {
    id: String(row.id),
    serviceDate: String(row.service_date),
    mealPeriod: String(row.meal_period) as MenuItem["mealPeriod"],
    name: String(row.name),
    description: String(row.description || ""),
    price: Number(row.price),
    category: String(row.category || "Meal"),
    cutoffTime: String(row.cutoff_time || "12:30").slice(0, 5),
    isAvailable: Boolean(row.is_available),
    accent: accents[index % accents.length],
  };
}

export function CVMessProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const configured = isSupabaseConfigured();
  const isOfficerRoute = pathname.startsWith("/officer");
  const [profile, setProfile] = useState<Profile>(isOfficerRoute ? officerProfile : memberProfile);
  const [menu, setMenu] = useState<MenuItem[]>(demoMenu);
  const [orders, setOrders] = useState<Order[]>(demoOrders);
  const [notifications, setNotifications] = useState<AppNotification[]>(demoNotifications);
  const [members, setMembers] = useState<MemberSummary[]>(demoMembers);
  const [accounts, setAccounts] = useState<Profile[]>([officerProfile, ...demoMembers]);
  const [loading, setLoading] = useState(configured);
  const supabase = useMemo(() => createClient(), []);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }
    const { data: profileRow } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (!profileRow) {
      setLoading(false);
      return;
    }
    const currentProfile = mapProfile(profileRow);
    setProfile(currentProfile);

    const [{ data: menuRows }, { data: orderRows }, { data: noteRows }] = await Promise.all([
      supabase.from("menu_items").select("*").order("service_date").order("meal_period"),
      currentProfile.role === "officer"
        ? supabase.from("orders").select("*, menu_item:menu_items(*), user:profiles(*)").order("created_at", { ascending: false })
        : supabase.from("orders").select("*, menu_item:menu_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);

    if (menuRows) setMenu(menuRows.map((row, index) => mapMenu(row, index)));
    if (orderRows) {
      setOrders(orderRows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        menuItemId: row.menu_item_id,
        quantity: row.quantity,
        total: Number(row.total),
        status: row.status,
        createdAt: row.created_at,
        note: row.note || undefined,
        item: mapMenu(row.menu_item),
        user: row.user ? mapProfile(row.user) : currentProfile,
      })));
    }
    if (noteRows) setNotifications(noteRows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      message: row.message,
      type: row.type,
      isRead: row.is_read,
      createdAt: row.created_at,
    })));

    if (currentProfile.role === "officer") {
      const [{ data: profileRows }, { data: accountRows }] = await Promise.all([
        supabase.from("member_monthly_summary").select("*").order("full_name"),
        supabase.from("profiles").select("*").order("full_name"),
      ]);
      if (profileRows) setMembers(profileRows.map((row) => ({
        ...mapProfile(row),
        monthTotal: Number(row.month_total || 0),
        orderCount: Number(row.order_count || 0),
        paymentStatus: row.payment_status === "paid" ? "paid" : "due",
      })));
      if (accountRows) setAccounts(accountRows.map(mapProfile));
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    if (!configured) {
      // Demo-only route switching mirrors the role without a backend session.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setProfile(isOfficerRoute ? officerProfile : memberProfile);
      return;
    }
    void loadData();
    const channel = supabase
      ?.channel("cvmess-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "orders" }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "notifications" }, () => void loadData())
      .on("postgres_changes", { event: "*", schema: "public", table: "menu_items" }, () => void loadData())
      .subscribe();
    return () => {
      if (channel && supabase) void supabase.removeChannel(channel);
    };
  }, [configured, isOfficerRoute, loadData, supabase]);

  async function placeOrder(item: MenuItem, quantity = 1, note = "") {
    if (orders.some((order) => order.userId === profile.id && order.menuItemId === item.id && ["pending", "confirmed"].includes(order.status))) {
      toast.info("You already ordered this meal");
      return;
    }
    if (supabase) {
      const { error } = await supabase.from("orders").insert({ user_id: profile.id, menu_item_id: item.id, quantity, note });
      if (error) throw new Error(error.message);
      await loadData();
    } else {
      const order: Order = {
        id: crypto.randomUUID(),
        userId: profile.id,
        menuItemId: item.id,
        quantity,
        total: item.price * quantity,
        status: "pending",
        createdAt: new Date().toISOString(),
        note,
        item,
        user: profile,
      };
      setOrders((current) => [order, ...current]);
    }
    toast.success("Order sent to the mess officer", { description: "You’ll be notified as soon as it is confirmed." });
  }

  async function updateOrderStatus(id: string, status: OrderStatus) {
    if (supabase) {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw new Error(error.message);
      await loadData();
    } else {
      setOrders((current) => current.map((order) => (order.id === id ? { ...order, status } : order)));
      const order = orders.find((item) => item.id === id);
      if (order && status === "confirmed" && order.userId === memberProfile.id) {
        setNotifications((current) => [{
          id: crypto.randomUUID(),
          userId: order.userId,
          title: "Order confirmed",
          message: `Your ${order.item.name} order has been confirmed.`,
          type: "order",
          isRead: false,
          createdAt: new Date().toISOString(),
        }, ...current]);
      }
    }
    toast.success(status === "confirmed" ? "Order confirmed" : status === "rejected" ? "Order declined" : "Order updated");
  }

  async function saveMenuItem(draft: MenuDraft) {
    const payload = {
      service_date: draft.serviceDate,
      meal_period: draft.mealPeriod,
      name: draft.name,
      description: draft.description,
      price: draft.price,
      category: draft.category,
      cutoff_time: draft.cutoffTime,
      is_available: draft.isAvailable,
    };
    if (supabase) {
      const query = draft.id
        ? supabase.from("menu_items").update(payload).eq("id", draft.id)
        : supabase.from("menu_items").insert(payload);
      const { error } = await query;
      if (error) throw new Error(error.message);
      await loadData();
    } else if (draft.id) {
      setMenu((current) => current.map((item) => item.id === draft.id ? { ...item, ...draft, id: item.id, accent: item.accent } : item));
    } else {
      setMenu((current) => [...current, { ...draft, id: crypto.randomUUID(), accent: accents[current.length % accents.length] }]);
    }
    toast.success(draft.id ? "Menu item updated" : "Meal added to the menu");
  }

  async function toggleMenuItem(id: string) {
    const item = menu.find((entry) => entry.id === id);
    if (!item) return;
    if (supabase) {
      const { error } = await supabase.from("menu_items").update({ is_available: !item.isAvailable }).eq("id", id);
      if (error) throw new Error(error.message);
      await loadData();
    } else {
      setMenu((current) => current.map((entry) => entry.id === id ? { ...entry, isAvailable: !entry.isAvailable } : entry));
    }
    toast.success(item.isAvailable ? "Meal paused" : "Meal is available again");
  }

  async function markNotificationRead(id?: string) {
    if (supabase) {
      let query = supabase.from("notifications").update({ is_read: true }).eq("user_id", profile.id);
      if (id) query = query.eq("id", id);
      await query;
    }
    setNotifications((current) => current.map((note) => !id || note.id === id ? { ...note, isRead: true } : note));
  }

  async function markPayment(memberId: string, paid: boolean) {
    if (supabase) {
      const month = new Date().toISOString().slice(0, 7) + "-01";
      const { error } = await supabase.from("payments").upsert({ user_id: memberId, billing_month: month, status: paid ? "paid" : "due", paid_at: paid ? new Date().toISOString() : null }, { onConflict: "user_id,billing_month" });
      if (error) throw new Error(error.message);
      await loadData();
    } else {
      setMembers((current) => current.map((member) => member.id === memberId ? { ...member, paymentStatus: paid ? "paid" : "due" } : member));
    }
    toast.success(paid ? "Payment marked as received" : "Payment marked as due");
  }

  async function setAccountRole(accountId: string, role: Profile["role"]) {
    if (supabase) {
      const { error } = await supabase.rpc("set_user_role", { target_user_id: accountId, requested_role: role });
      if (error) throw new Error(error.message);
      await loadData();
    } else {
      setAccounts((current) => current.map((account) => account.id === accountId ? { ...account, role } : account));
    }
    toast.success(role === "officer" ? "Officer access granted" : "Officer access removed");
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
  }

  const value: CVMessContextValue = {
    profile, menu, orders, notifications, members, accounts, configured, loading,
    placeOrder, updateOrderStatus, saveMenuItem, toggleMenuItem,
    markNotificationRead, markPayment, setAccountRole, signOut,
  };

  return <CVMessContext.Provider value={value}>{children}</CVMessContext.Provider>;
}

export function useCVMess() {
  const value = useContext(CVMessContext);
  if (!value) throw new Error("useCVMess must be used inside CVMessProvider");
  return value;
}
