import { ExpenseCategory, TripStatus } from './types';

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function tripDuration(start: string, end: string): number {
  const s = new Date(start);
  const e = new Date(end);
  return Math.ceil((e.getTime() - s.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

export function totalSpent(expenses: { amount: number; paid: boolean }[]): number {
  return expenses.filter(e => e.paid).reduce((sum, e) => sum + e.amount, 0);
}

export function totalExpenses(expenses: { amount: number }[]): number {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export const STATUS_LABELS: Record<TripStatus, string> = {
  planning: 'Planning',
  upcoming: 'Upcoming',
  active: 'Active',
  completed: 'Completed',
};

export const STATUS_COLORS: Record<TripStatus, string> = {
  planning: 'bg-slate-700 text-slate-200',
  upcoming: 'bg-ocean-800 text-ocean-200',
  active: 'bg-emerald-800 text-emerald-200',
  completed: 'bg-sand-800 text-sand-200',
};

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  flights: 'Flights',
  accommodation: 'Accommodation',
  food: 'Food & Drink',
  transport: 'Transport',
  activities: 'Activities',
  shopping: 'Shopping',
  health: 'Health',
  other: 'Other',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  flights: '✈️',
  accommodation: '🏨',
  food: '🍜',
  transport: '🚆',
  activities: '🎭',
  shopping: '🛍️',
  health: '💊',
  other: '📦',
};

export const ITEM_TYPE_ICONS: Record<string, string> = {
  flight: '✈️',
  hotel: '🏨',
  activity: '🎭',
  meal: '🍽️',
  transport: '🚌',
  free: '🌿',
  note: '📝',
};

export function avatarInitials(name: string): string {
  return name.trim().split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

export function avatarColor(userId: string): string {
  const colors = [
    'bg-ocean-700', 'bg-sand-700', 'bg-emerald-700', 'bg-purple-700',
    'bg-rose-700', 'bg-amber-700', 'bg-teal-700', 'bg-indigo-700',
  ];
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
}
