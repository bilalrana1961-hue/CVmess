import { addDays } from "@/lib/format";
import type { AppNotification, MemberSummary, MenuItem, Order, Profile } from "@/lib/types";

export const memberProfile: Profile = {
  id: "demo-member-1",
  fullName: "Hamza Ahmed",
  email: "hamza@cvmess.pk",
  phone: "+92 300 1234567",
  room: "Room 214",
  role: "member",
  joinedAt: "2025-09-01",
};

export const officerProfile: Profile = {
  id: "demo-officer-1",
  fullName: "Fahad Khan",
  email: "officer@cvmess.pk",
  phone: "+92 301 5550105",
  room: "Mess Office",
  role: "officer",
};

const meals = [
  ["Breakfast", "Aloo Paratha & Chai", "Fresh paratha, spiced potato filling, yoghurt and doodh patti", 180, "Pakistani", "09:00", "#d99b56"],
  ["Lunch", "Chicken Biryani", "Aromatic basmati rice, chicken, raita and fresh salad", 320, "Rice", "12:30", "#a9684a"],
  ["Dinner", "Daal Mash & Chapati", "Slow-cooked lentils, tarka, two chapatis and kachumber", 250, "Comfort", "18:30", "#73845f"],
] as const;

const futureMeals = [
  ["Breakfast", "Anda Paratha", "Masala omelette, paratha and chai", 170, "Pakistani", "09:00", "#d99b56"],
  ["Lunch", "Chicken Karahi", "Karahi chicken, two naan and salad", 350, "Curry", "12:30", "#a9684a"],
  ["Dinner", "Sabzi Pulao", "Seasonal vegetables, basmati rice and raita", 240, "Rice", "18:30", "#73845f"],
  ["Breakfast", "Halwa Puri", "Two puris, chana, aloo bhujia and halwa", 200, "Pakistani", "09:00", "#d99b56"],
  ["Lunch", "Beef Qeema", "Home-style qeema, two chapatis and salad", 340, "Curry", "12:30", "#a9684a"],
  ["Dinner", "Chicken Chow Mein", "Wok-tossed noodles, chicken and vegetables", 300, "Noodles", "18:30", "#73845f"],
] as const;

export const demoMenu: MenuItem[] = Array.from({ length: 7 }).flatMap((_, day) => {
  const source = day === 0 ? meals : futureMeals.slice(((day - 1) * 3) % 6).concat(futureMeals.slice(0, ((day - 1) * 3) % 6)).slice(0, 3);
  return source.map((meal, index) => ({
    id: `menu-${day}-${index}`,
    serviceDate: addDays(day),
    mealPeriod: meal[0],
    name: meal[1],
    description: meal[2],
    price: meal[3],
    category: meal[4],
    cutoffTime: meal[5],
    isAvailable: !(day === 2 && index === 0),
    accent: meal[6],
  }));
});

const demoMembersBase: Profile[] = [
  memberProfile,
  { id: "member-2", fullName: "Ayesha Malik", email: "ayesha@cvmess.pk", phone: "+92 302 1188220", room: "Room 108", role: "member" },
  { id: "member-3", fullName: "Bilal Raza", email: "bilal@cvmess.pk", phone: "+92 333 4201188", room: "Room 305", role: "member" },
  { id: "member-4", fullName: "Sana Ali", email: "sana@cvmess.pk", phone: "+92 310 9911220", room: "Room 117", role: "member" },
  { id: "member-5", fullName: "Usman Tariq", email: "usman@cvmess.pk", phone: "+92 321 5552910", room: "Room 402", role: "member" },
];

const pastItem = (name: string, mealPeriod: MenuItem["mealPeriod"], price: number, days: number): MenuItem => ({
  id: `past-${name}-${days}`,
  serviceDate: addDays(-days),
  mealPeriod,
  name,
  description: "Prepared and served by CVmess",
  price,
  category: "Meal",
  cutoffTime: "12:30",
  isAvailable: true,
  accent: "#8a7b55",
});

const orderSeed: Order[] = [
  { id: "ord-1", userId: memberProfile.id, menuItemId: "past-1", quantity: 1, total: 310, status: "confirmed", createdAt: new Date(Date.now() - 86_400_000).toISOString(), item: pastItem("Mutton Pulao", "Lunch", 310, 1), user: memberProfile },
  { id: "ord-2", userId: memberProfile.id, menuItemId: "past-2", quantity: 1, total: 230, status: "confirmed", createdAt: new Date(Date.now() - 2 * 86_400_000).toISOString(), item: pastItem("Daal Chawal", "Dinner", 230, 2), user: memberProfile },
  { id: "ord-3", userId: memberProfile.id, menuItemId: "past-3", quantity: 1, total: 160, status: "confirmed", createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString(), item: pastItem("Chana Paratha", "Breakfast", 160, 3), user: memberProfile },
  { id: "ord-4", userId: "member-2", menuItemId: demoMenu[1].id, quantity: 1, total: demoMenu[1].price, status: "pending", createdAt: new Date(Date.now() - 11 * 60_000).toISOString(), item: demoMenu[1], user: demoMembersBase[1] },
  { id: "ord-5", userId: "member-3", menuItemId: demoMenu[2].id, quantity: 1, total: demoMenu[2].price, status: "pending", createdAt: new Date(Date.now() - 18 * 60_000).toISOString(), item: demoMenu[2], user: demoMembersBase[2] },
  { id: "ord-6", userId: "member-4", menuItemId: demoMenu[1].id, quantity: 2, total: demoMenu[1].price * 2, status: "pending", createdAt: new Date(Date.now() - 25 * 60_000).toISOString(), item: demoMenu[1], user: demoMembersBase[3] },
  { id: "ord-7", userId: "member-5", menuItemId: demoMenu[0].id, quantity: 1, total: demoMenu[0].price, status: "confirmed", createdAt: new Date(Date.now() - 50 * 60_000).toISOString(), item: demoMenu[0], user: demoMembersBase[4] },
];

export const demoOrders = orderSeed;

export const demoNotifications: AppNotification[] = [
  { id: "note-1", userId: memberProfile.id, title: "Order confirmed", message: "Your Mutton Pulao order has been confirmed.", type: "order", isRead: false, createdAt: new Date(Date.now() - 80 * 60_000).toISOString() },
  { id: "note-2", userId: memberProfile.id, title: "Dinner menu updated", message: "Tonight’s dinner has been updated to Daal Mash & Chapati.", type: "menu", isRead: false, createdAt: new Date(Date.now() - 5 * 60 * 60_000).toISOString() },
  { id: "note-3", userId: memberProfile.id, title: "July bill paid", message: "Your payment of Rs. 8,420 was marked as received.", type: "bill", isRead: true, createdAt: new Date(Date.now() - 8 * 86_400_000).toISOString() },
];

export const demoMembers: MemberSummary[] = [
  { ...demoMembersBase[0], monthTotal: 6420, orderCount: 22, paymentStatus: "due" },
  { ...demoMembersBase[1], monthTotal: 7180, orderCount: 25, paymentStatus: "due" },
  { ...demoMembersBase[2], monthTotal: 5890, orderCount: 19, paymentStatus: "paid" },
  { ...demoMembersBase[3], monthTotal: 8050, orderCount: 28, paymentStatus: "due" },
  { ...demoMembersBase[4], monthTotal: 4730, orderCount: 16, paymentStatus: "paid" },
];
