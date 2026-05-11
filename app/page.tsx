'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, MapPin, Calendar, Users, Wallet, TrendingUp, LogOut, ChevronDown } from 'lucide-react';
import { Trip, TripStatus } from '@/lib/types';
import { getTrips, saveTrips } from '@/lib/storage';
import { seedSampleTrips } from '@/lib/storage';
import { formatCurrency, formatDateShort, tripDuration, totalExpenses, totalSpent, STATUS_LABELS, STATUS_COLORS, avatarInitials, avatarColor } from '@/lib/utils';
import { TripFormModal } from '@/components/TripFormModal';
import { useAuth } from '@/components/AuthProvider';
import { v4 as uuidv4 } from 'uuid';

const STATUS_FILTERS: { label: string; value: TripStatus | 'all' }[] = [
  { label: 'All Trips', value: 'all' },
  { label: 'Planning', value: 'planning' },
  { label: 'Upcoming', value: 'upcoming' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
];

export default function HomePage() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [filter, setFilter] = useState<TripStatus | 'all'>('all');
  const [showForm, setShowForm] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/signin'); return; }
    seedSampleTrips(user.id);
    setTrips(getTrips());
    setMounted(true);
  }, [user, loading, router]);

  const filtered = filter === 'all' ? trips : trips.filter(t => t.status === filter);
  const totalBudget = trips.reduce((s, t) => s + t.budget, 0);
  const totalSpentAll = trips.reduce((s, t) => s + totalSpent(t.expenses), 0);

  function handleCreate(data: Partial<Trip>) {
    if (!user) return;
    const now = new Date().toISOString();
    const trip: Trip = {
      id: uuidv4(),
      ownerId: user.id,
      name: data.name || 'New Trip',
      destination: data.destination || '',
      coverEmoji: data.coverEmoji || '✈️',
      startDate: data.startDate || '',
      endDate: data.endDate || '',
      status: data.status || 'planning',
      budget: data.budget || 0,
      currency: data.currency || 'USD',
      description: data.description,
      travelers: data.travelers || 1,
      itinerary: [],
      expenses: [],
      collaborators: [],
      createdAt: now,
      updatedAt: now,
    };
    const updated = [...trips, trip];
    setTrips(updated);
    // save through storage — but we need all trips, so upsert manually
    const all: Trip[] = JSON.parse(localStorage.getItem('wanderlog_trips') || '[]');
    all.push(trip);
    localStorage.setItem('wanderlog_trips', JSON.stringify(all));
    setShowForm(false);
  }

  function handleDelete(id: string) {
    const all: Trip[] = JSON.parse(localStorage.getItem('wanderlog_trips') || '[]');
    localStorage.setItem('wanderlog_trips', JSON.stringify(all.filter(t => t.id !== id)));
    setTrips(trips.filter(t => t.id !== id));
  }

  function handleSignOut() {
    signOut();
    router.push('/auth/signin');
  }

  if (loading || !mounted) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600 text-sm">Loading…</div>
    </div>
  );

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl text-sand-300 tracking-tight">WanderLog</h1>
            <p className="text-xs text-slate-500 mt-0.5">Your personal travel companion</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 bg-sand-500 hover:bg-sand-400 text-slate-950 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
            >
              <Plus size={16} />
              New Trip
            </button>
            {/* User menu */}
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg px-3 py-2 transition-colors"
              >
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${avatarColor(user!.id)}`}>
                  {user!.avatar || avatarInitials(user!.name)}
                </div>
                <span className="text-sm text-slate-300 max-w-[120px] truncate">{user!.name}</span>
                <ChevronDown size={13} className="text-slate-500" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-800">
                    <p className="text-sm text-slate-200 font-medium truncate">{user!.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user!.email}</p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors"
                  >
                    <LogOut size={13} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Click outside to close menu */}
      {showUserMenu && <div className="fixed inset-0 z-30" onClick={() => setShowUserMenu(false)} />}

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 stagger">
          {[
            { label: 'Total Trips', value: trips.length, icon: MapPin, color: 'text-ocean-400' },
            { label: 'Total Budget', value: formatCurrency(totalBudget), icon: Wallet, color: 'text-sand-400' },
            { label: 'Total Spent', value: formatCurrency(totalSpentAll), icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Destinations', value: new Set(trips.map(t => t.destination.split(',')[1]?.trim() || t.destination)).size, icon: Calendar, color: 'text-purple-400' },
          ].map(stat => (
            <div key={stat.label} className="bg-slate-900 border border-slate-800 rounded-xl p-4 animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
              <div className="flex items-center gap-2 mb-2">
                <stat.icon size={14} className={stat.color} />
                <span className="text-xs text-slate-500">{stat.label}</span>
              </div>
              <p className="text-xl font-display text-slate-100">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-800">
          {STATUS_FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`text-sm px-4 py-2 pb-3 transition-colors relative ${filter === f.value ? 'text-sand-400 tab-active' : 'text-slate-500 hover:text-slate-300'}`}>
              {f.label}
              {f.value !== 'all' && <span className="ml-1.5 text-xs opacity-60">{trips.filter(t => t.status === f.value).length}</span>}
            </button>
          ))}
        </div>

        {/* Trip Grid */}
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-5xl mb-4">🗺️</p>
            <p className="text-slate-400 font-display text-xl mb-2">No trips yet</p>
            <p className="text-slate-600 text-sm mb-6">Start planning your next adventure</p>
            <button onClick={() => setShowForm(true)} className="bg-sand-500 hover:bg-sand-400 text-slate-950 font-medium text-sm px-5 py-2.5 rounded-lg transition-colors">
              Plan a Trip
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 stagger">
            {filtered.map(trip => {
              const isOwner = trip.ownerId === user!.id;
              const myRole = isOwner ? 'owner' : trip.collaborators.find(c => c.userId === user!.id)?.role;
              const spent = totalSpent(trip.expenses);
              const budgetPct = trip.budget > 0 ? Math.min((totalExpenses(trip.expenses) / trip.budget) * 100, 100) : 0;
              const duration = trip.startDate && trip.endDate ? tripDuration(trip.startDate, trip.endDate) : null;
              const overBudget = totalExpenses(trip.expenses) > trip.budget;

              return (
                <div key={trip.id} className="trip-card bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden animate-slide-up opacity-0" style={{ animationFillMode: 'forwards' }}>
                  <Link href={`/trips/${trip.id}`} className="block p-5 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl">{trip.coverEmoji}</span>
                      <div className="flex items-center gap-2">
                        {!isOwner && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-900/50 text-purple-300 border border-purple-800">
                            {myRole}
                          </span>
                        )}
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[trip.status]}`}>
                          {STATUS_LABELS[trip.status]}
                        </span>
                      </div>
                    </div>
                    <h2 className="font-display text-lg text-slate-100 mb-1">{trip.name}</h2>
                    <div className="flex items-center gap-1 text-slate-500 text-xs mb-3">
                      <MapPin size={11} />
                      <span>{trip.destination}</span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                      {trip.startDate && (
                        <div className="flex items-center gap-1">
                          <Calendar size={11} />
                          <span>{formatDateShort(trip.startDate)}{trip.endDate && ` – ${formatDateShort(trip.endDate)}`}</span>
                        </div>
                      )}
                      {duration && <span>{duration}d</span>}
                      <div className="flex items-center gap-1">
                        <Users size={11} />
                        <span>{trip.travelers + (trip.collaborators?.length || 0)}</span>
                      </div>
                    </div>
                  </Link>

                  {/* Collaborator avatars */}
                  {trip.collaborators.length > 0 && (
                    <div className="px-5 pb-2 flex items-center gap-1">
                      <span className="text-xs text-slate-600 mr-1">Also:</span>
                      {trip.collaborators.slice(0, 4).map(c => (
                        <div key={c.userId} title={`${c.name} (${c.role})`}
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${avatarColor(c.userId)}`}>
                          {c.avatar || avatarInitials(c.name)}
                        </div>
                      ))}
                      {trip.collaborators.length > 4 && <span className="text-xs text-slate-600">+{trip.collaborators.length - 4}</span>}
                    </div>
                  )}

                  <div className="px-5 pb-4">
                    <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                      <span>Budget</span>
                      <span className={overBudget ? 'text-red-400' : ''}>
                        {formatCurrency(totalExpenses(trip.expenses), trip.currency)} / {formatCurrency(trip.budget, trip.currency)}
                      </span>
                    </div>
                    <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div className={`h-full budget-fill rounded-full ${overBudget ? 'bg-red-500' : 'bg-sand-500'}`} style={{ width: `${budgetPct}%` }} />
                    </div>
                  </div>

                  <div className="px-5 pb-4 flex items-center justify-between border-t border-slate-800 pt-3">
                    <div className="text-xs text-slate-600">{trip.itinerary.length} items · {trip.expenses.length} expenses</div>
                    {isOwner && (
                      <button onClick={e => { e.preventDefault(); if (confirm('Delete this trip?')) handleDelete(trip.id); }}
                        className="text-xs text-slate-600 hover:text-red-400 transition-colors">Delete</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {showForm && <TripFormModal onClose={() => setShowForm(false)} onSave={handleCreate} />}
    </div>
  );
}
