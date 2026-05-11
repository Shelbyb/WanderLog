export type TripStatus = 'planning' | 'upcoming' | 'active' | 'completed';

export type ExpenseCategory =
  | 'flights'
  | 'accommodation'
  | 'food'
  | 'transport'
  | 'activities'
  | 'shopping'
  | 'health'
  | 'other';

export type CollaboratorRole = 'editor' | 'viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  createdAt: string;
}

export interface Collaborator {
  userId: string;
  email: string;
  name: string;
  avatar?: string;
  role: CollaboratorRole;
  addedAt: string;
}

export interface ShareLink {
  token: string;
  createdAt: string;
  createdBy: string;
  enabled: boolean;
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  paid: boolean;
}

export type ItineraryItemType = 'flight' | 'hotel' | 'activity' | 'meal' | 'transport' | 'free' | 'note';

export interface ItineraryItem {
  id: string;
  type: ItineraryItemType;
  title: string;
  date: string;
  startTime?: string;
  endTime?: string;
  location?: string;
  notes?: string;
  confirmed: boolean;
  linkedExpenseId?: string;
}

export interface Trip {
  id: string;
  ownerId: string;
  name: string;
  destination: string;
  coverEmoji: string;
  startDate: string;
  endDate: string;
  status: TripStatus;
  budget: number;
  currency: string;
  description?: string;
  travelers: number;
  itinerary: ItineraryItem[];
  expenses: Expense[];
  collaborators: Collaborator[];
  shareLink?: ShareLink;
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
}
