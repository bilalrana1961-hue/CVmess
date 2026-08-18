export type Role = "member" | "officer";
export type OfficerLevel = "head_officer" | "mess_officer";
export type MealPeriod = "Breakfast" | "Tea Break" | "Lunch" | "Dinner";
export type OrderStatus = "pending" | "confirmed" | "rejected" | "cancelled";

export interface Profile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  room: string;
  role: Role;
  officerLevel?: OfficerLevel;
  joinedAt?: string;
}

export interface MenuItem {
  id: string;
  serviceDate: string;
  mealPeriod: MealPeriod;
  name: string;
  description: string;
  price: number;
  category: string;
  cutoffTime: string;
  isAvailable: boolean;
  accent: string;
}

export interface WeeklyMenuTemplate {
  id: string;
  weekday: number;
  mealPeriod: MealPeriod;
  name: string;
  description: string;
  price: number;
  category: string;
  cutoffTime: string;
  isAvailable: boolean;
  accent: string;
}

export interface Order {
  id: string;
  userId: string;
  menuItemId: string;
  quantity: number;
  total: number;
  status: OrderStatus;
  createdAt: string;
  note?: string;
  item: MenuItem;
  user?: Profile;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: "order" | "bill" | "menu" | "general";
  isRead: boolean;
  createdAt: string;
}

export interface MemberSummary extends Profile {
  monthTotal: number;
  orderCount: number;
  paymentStatus: "paid" | "due";
}
