"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
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
  error: string;
  placeOrder: (item: MenuItem, quantity?: number, note?: string) => Promise<void>;
  updateOrderStatus: (id: string, status: OrderStatus) => Promise<void>;
  saveMenuItem: (draft: MenuDraft) => Promise<void>;
  toggleMenuItem: (id: string) => Promise<void>;
  markNotificationRead: (id?: string) => Promise<void>;
  markPayment: (memberId: string, paid: boolean) => Promise<void>;
  createOfficer: (details: { name: string; email: string; password: string; unit: string }) => Promise<void>;
  updateProfile: (details: { fullName: string; phone: string; unit: string }) => Promise<void>;
  changePassword: (password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const CVMessContext = createContext<CVMessContextValue | null>(null);

const accents = ["#d99b56", "#a9684a", "#73845f", "#8f7957"];

function isPortalPath(pathname: string) {
  if (pathname === "/officer/login" || pathname === "/officer/join") return false;
  return ["/dashboard", "/menu", "/orders", "/billing", "/notifications", "/settings", "/officer"].some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

function mapProfile(row: Record<string, unknown>): Profile {
  return {
    id: String(row.id),
    fullName: String(row.full_name || "CVmess Member"),
    email: String(row.email || ""),
    phone: String(row.phone || ""),
    room: String(row.room || "Unit not set"),
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
  const [profile, setProfile] = useState<Profile>({ id: "", fullName: "Account", email: "", phone: "", room: "", role: pathname.startsWith("/officer") ? "officer" : "member" });
  const [menu, setMenu] = useState<MenuItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [members, setMembers] = useState<MemberSummary[]>([]);
  const [accounts, setAccounts] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(configured);
  const [error, setError] = useState(configured ? "" : "CVmess is temporarily unavailable because its database connection is not configured.");
  const supabase = useMemo(() => createClient(), []);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    setMenu([]);
    setOrders([]);
    setNotifications([]);
    setMembers([]);
    setAccounts([]);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError) { setError("We could not verify your session. Please sign in again."); setLoading(false); return; }
    if (!user) {
      setLoading(false);
      return;
    }
    const { data: profileRow, error: profileError } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    if (!profileRow) {
      setError(profileError?.message || "Your CVmess profile could not be loaded. Please contact a mess officer.");
      setLoading(false);
      return;
    }
    const currentProfile = mapProfile(profileRow);
    setProfile(currentProfile);

    const [{ data: menuRows, error: menuError }, { data: orderRows, error: orderError }, { data: noteRows, error: noteError }] = await Promise.all([
      supabase.from("menu_items").select("*").order("service_date").order("meal_period"),
      currentProfile.role === "officer"
        ? supabase.from("orders").select("*, menu_item:menu_items(*), user:profiles!orders_user_id_fkey(*)").order("created_at", { ascending: false })
        : supabase.from("orders").select("*, menu_item:menu_items(*)").eq("user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("notifications").select("*").eq("user_id", user.id).order("created_at", { ascending: false }),
    ]);
    if (menuError || orderError || noteError) {
      setError("Some CVmess information could not be loaded. Please check your connection and try again.");
      setLoading(false);
      return;
    }

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
      const [{ data: profileRows, error: membersError }, { data: accountRows, error: accountsError }] = await Promise.all([
        supabase.from("member_monthly_summary").select("*").order("full_name"),
        supabase.from("profiles").select("*").eq("role", "officer").order("full_name"),
      ]);
      if (membersError || accountsError) {
        setError("Member and billing information could not be loaded. Please try again.");
        setLoading(false);
        return;
      }
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
    if (!configured || !isPortalPath(pathname)) return;
    // Data loading is the external synchronization performed by this effect.
    // eslint-disable-next-line react-hooks/set-state-in-effect
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
  }, [configured, loadData, pathname, supabase]);

  async function placeOrder(item: MenuItem, quantity = 1, note = "") {
    if (!supabase) throw new Error("Ordering is temporarily unavailable. Please try again later.");
    const { error } = await supabase.from("orders").insert({ user_id: profile.id, menu_item_id: item.id, quantity, note });
    if (error) throw new Error(error.message);
    await loadData();
    toast.success("Order sent to the mess officer", { description: "You’ll be notified as soon as it is confirmed." });
  }

  async function updateOrderStatus(id: string, status: OrderStatus) {
    if (!supabase) throw new Error("Order updates are temporarily unavailable. Please try again later.");
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) throw new Error(error.message);
    await loadData();
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
    if (!supabase) throw new Error("Menu updates are temporarily unavailable. Please try again later.");
    const query = draft.id
      ? supabase.from("menu_items").update(payload).eq("id", draft.id)
      : supabase.from("menu_items").insert(payload);
    const { error } = await query;
    if (error) throw new Error(error.message);
    await loadData();
    toast.success(draft.id ? "Menu item updated" : "Meal added to the menu");
  }

  async function toggleMenuItem(id: string) {
    const item = menu.find((entry) => entry.id === id);
    if (!item) return;
    if (!supabase) throw new Error("Menu updates are temporarily unavailable. Please try again later.");
    const { error } = await supabase.from("menu_items").update({ is_available: !item.isAvailable }).eq("id", id);
    if (error) throw new Error(error.message);
    await loadData();
    toast.success(item.isAvailable ? "Meal paused" : "Meal is available again");
  }

  async function markNotificationRead(id?: string) {
    if (!supabase) throw new Error("Notifications are temporarily unavailable. Please try again later.");
    let query = supabase.from("notifications").update({ is_read: true }).eq("user_id", profile.id);
    if (id) query = query.eq("id", id);
    await query;
    setNotifications((current) => current.map((note) => !id || note.id === id ? { ...note, isRead: true } : note));
  }

  async function markPayment(memberId: string, paid: boolean) {
    if (!supabase) throw new Error("Payment updates are temporarily unavailable. Please try again later.");
    const month = new Date().toISOString().slice(0, 7) + "-01";
    const { error } = await supabase.from("payments").upsert({ user_id: memberId, billing_month: month, status: paid ? "paid" : "due", paid_at: paid ? new Date().toISOString() : null }, { onConflict: "user_id,billing_month" });
    if (error) throw new Error(error.message);
    await loadData();
    toast.success(paid ? "Payment marked as received" : "Payment marked as due");
  }

  async function createOfficer(details: { name: string; email: string; password: string; unit: string }) {
    if (!supabase) throw new Error("Officer creation is temporarily unavailable. Please try again later.");
    const { error } = await supabase.functions.invoke("create-officer", { body: details });
    if (error) throw new Error(error.message);
    await loadData();
    toast.success("Officer account created");
  }

  async function updateProfile(details: { fullName: string; phone: string; unit: string }) {
    if (!supabase || !profile.id) throw new Error("Profile updates are temporarily unavailable. Please try again later.");
    const { error: profileError } = await supabase.from("profiles").update({ full_name: details.fullName, phone: details.phone, room: details.unit }).eq("id", profile.id);
    if (profileError) throw new Error(profileError.message);
    const { error: metadataError } = await supabase.auth.updateUser({ data: { full_name: details.fullName, phone: details.phone, room: details.unit, unit: details.unit } });
    if (metadataError) throw new Error(metadataError.message);
    await loadData();
    toast.success("Profile updated");
  }

  async function changePassword(password: string) {
    if (!supabase) throw new Error("Password changes are temporarily unavailable. Please try again later.");
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) throw new Error(passwordError.message);
    toast.success("Password changed successfully");
  }

  async function signOut() {
    if (supabase) await supabase.auth.signOut();
    router.push("/login");
  }

  const value: CVMessContextValue = {
    profile, menu, orders, notifications, members, accounts, configured, loading, error,
    placeOrder, updateOrderStatus, saveMenuItem, toggleMenuItem,
    markNotificationRead, markPayment, createOfficer, updateProfile, changePassword, signOut,
  };

  return <CVMessContext.Provider value={value}>{children}</CVMessContext.Provider>;
}

export function useCVMess() {
  const value = useContext(CVMessContext);
  if (!value) throw new Error("useCVMess must be used inside CVMessProvider");
  return value;
}
