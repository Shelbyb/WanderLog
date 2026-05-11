import { Trip, Collaborator, ShareLink } from './types';
import { getCurrentUser } from './auth';
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'wanderlog_trips';

function allTrips(): Trip[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveAll(trips: Trip[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trips));
}

/** Returns trips owned by or shared with the current user */
export function getTrips(): Trip[] {
  const user = getCurrentUser();
  if (!user) return [];
  const trips = allTrips();
  return trips.filter(t =>
    t.ownerId === user.id ||
    t.collaborators?.some(c => c.userId === user.id)
  );
}

export function getTripById(id: string): Trip | undefined {
  return allTrips().find(t => t.id === id);
}

/** Find a trip by its public share token (no auth required) */
export function getTripByShareToken(token: string): Trip | undefined {
  return allTrips().find(t => t.shareLink?.token === token && t.shareLink?.enabled);
}

export function upsertTrip(trip: Trip): void {
  const trips = allTrips();
  const idx = trips.findIndex(t => t.id === trip.id);
  const updated = { ...trip, updatedAt: new Date().toISOString() };
  if (idx >= 0) trips[idx] = updated;
  else trips.push(updated);
  saveAll(trips);
}

export function deleteTrip(id: string): void {
  saveAll(allTrips().filter(t => t.id !== id));
}

// ─── Collaboration ────────────────────────────────────────────────────────────

export function addCollaborator(tripId: string, collaborator: Collaborator): Trip | null {
  const trips = allTrips();
  const idx = trips.findIndex(t => t.id === tripId);
  if (idx < 0) return null;
  const trip = trips[idx];
  // Avoid duplicates
  const existing = trip.collaborators.findIndex(c => c.userId === collaborator.userId);
  if (existing >= 0) {
    trip.collaborators[existing] = collaborator; // update role
  } else {
    trip.collaborators.push(collaborator);
  }
  trip.updatedAt = new Date().toISOString();
  saveAll(trips);
  return trip;
}

export function removeCollaborator(tripId: string, userId: string): Trip | null {
  const trips = allTrips();
  const idx = trips.findIndex(t => t.id === tripId);
  if (idx < 0) return null;
  trips[idx].collaborators = trips[idx].collaborators.filter(c => c.userId !== userId);
  trips[idx].updatedAt = new Date().toISOString();
  saveAll(trips);
  return trips[idx];
}

export function updateCollaboratorRole(tripId: string, userId: string, role: 'editor' | 'viewer'): Trip | null {
  const trips = allTrips();
  const idx = trips.findIndex(t => t.id === tripId);
  if (idx < 0) return null;
  const cIdx = trips[idx].collaborators.findIndex(c => c.userId === userId);
  if (cIdx >= 0) trips[idx].collaborators[cIdx].role = role;
  trips[idx].updatedAt = new Date().toISOString();
  saveAll(trips);
  return trips[idx];
}

// ─── Share links ──────────────────────────────────────────────────────────────

export function createShareLink(tripId: string): Trip | null {
  const user = getCurrentUser();
  if (!user) return null;
  const trips = allTrips();
  const idx = trips.findIndex(t => t.id === tripId);
  if (idx < 0) return null;
  const shareLink: ShareLink = {
    token: uuidv4().replace(/-/g, ''),
    createdAt: new Date().toISOString(),
    createdBy: user.id,
    enabled: true,
  };
  trips[idx].shareLink = shareLink;
  trips[idx].updatedAt = new Date().toISOString();
  saveAll(trips);
  return trips[idx];
}

export function revokeShareLink(tripId: string): Trip | null {
  const trips = allTrips();
  const idx = trips.findIndex(t => t.id === tripId);
  if (idx < 0) return null;
  if (trips[idx].shareLink) trips[idx].shareLink!.enabled = false;
  trips[idx].updatedAt = new Date().toISOString();
  saveAll(trips);
  return trips[idx];
}

export function enableShareLink(tripId: string): Trip | null {
  const trips = allTrips();
  const idx = trips.findIndex(t => t.id === tripId);
  if (idx < 0) return null;
  if (trips[idx].shareLink) {
    trips[idx].shareLink!.enabled = true;
  } else {
    return createShareLink(tripId);
  }
  trips[idx].updatedAt = new Date().toISOString();
  saveAll(trips);
  return trips[idx];
}

// ─── Permission helpers ───────────────────────────────────────────────────────

export function canEdit(trip: Trip, userId: string): boolean {
  if (trip.ownerId === userId) return true;
  return trip.collaborators?.some(c => c.userId === userId && c.role === 'editor') ?? false;
}

export function canView(trip: Trip, userId: string): boolean {
  if (trip.ownerId === userId) return true;
  return trip.collaborators?.some(c => c.userId === userId) ?? false;
}

// ─── Seed sample data for new users ──────────────────────────────────────────

export function seedSampleTrips(userId: string): void {
  const existing = allTrips().filter(t => t.ownerId === userId);
  if (existing.length > 0) return; // already seeded
  const now = new Date().toISOString();
  const samples: Trip[] = [
    {
      id: uuidv4(),
      ownerId: userId,
      name: 'Tokyo Adventure',
      destination: 'Tokyo, Japan',
      coverEmoji: '🗾',
      startDate: '2026-07-10',
      endDate: '2026-07-22',
      status: 'upcoming',
      budget: 5000,
      currency: 'USD',
      description: 'Cherry blossom season, ramen tours, and neon nights.',
      travelers: 2,
      collaborators: [],
      itinerary: [
        { id: uuidv4(), type: 'flight', title: 'Flight JFK → NRT', date: '2026-07-10', startTime: '11:30', endTime: '14:45', location: 'JFK Airport', confirmed: true, notes: 'United Airlines UA837' },
        { id: uuidv4(), type: 'hotel', title: 'Check-in: Shinjuku Granbell Hotel', date: '2026-07-11', startTime: '15:00', location: 'Shinjuku, Tokyo', confirmed: true, notes: 'Reservation #GH-882211' },
        { id: uuidv4(), type: 'activity', title: 'Tsukiji Market Morning Tour', date: '2026-07-12', startTime: '07:00', endTime: '10:00', location: 'Tsukiji, Tokyo', confirmed: false },
      ],
      expenses: [
        { id: uuidv4(), title: 'Round-trip Flights', amount: 1800, currency: 'USD', category: 'flights', date: '2026-03-15', paid: true },
        { id: uuidv4(), title: 'Hotel 12 nights', amount: 1440, currency: 'USD', category: 'accommodation', date: '2026-03-15', paid: true },
        { id: uuidv4(), title: 'JR Pass (14 days)', amount: 420, currency: 'USD', category: 'transport', date: '2026-05-01', paid: false },
      ],
      createdAt: now,
      updatedAt: now,
    },
    {
      id: uuidv4(),
      ownerId: userId,
      name: 'Amalfi Coast Road Trip',
      destination: 'Amalfi, Italy',
      coverEmoji: '🇮🇹',
      startDate: '2026-09-03',
      endDate: '2026-09-13',
      status: 'planning',
      budget: 4000,
      currency: 'USD',
      description: 'Cliffside drives, limoncello, and cerulean waters.',
      travelers: 2,
      collaborators: [],
      itinerary: [],
      expenses: [
        { id: uuidv4(), title: 'Flights to Naples', amount: 960, currency: 'USD', category: 'flights', date: '2026-04-20', paid: true },
      ],
      createdAt: now,
      updatedAt: now,
    },
  ];
  saveAll([...allTrips(), ...samples]);
}
