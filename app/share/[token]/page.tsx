'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { MapPin, Calendar, Users, Wallet, Globe, Lock } from 'lucide-react';
import { Trip } from '@/lib/types';
import { getTripByShareToken } from '@/lib/storage';
import { formatCurrency, formatDate, tripDuration, totalSpent, totalExpenses, STATUS_LABELS, STATUS_COLORS, ITEM_TYPE_ICONS, CATEGORY_ICONS, CATEGORY_LABELS } from '@/lib/utils';

export default function PublicSharePage() {
  const { token } = useParams() as { token: string };
  const [trip, setTrip] = useState<Trip | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [tab, setTab] = useState<'itinerary' | 'overview'>('itinerary');

  useEffect(() => {
    const t = getTripByShareToken(token);
    if (!t) setNotFound(true);
    else setTrip(t);
  }, [token]);

  if (notFound) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-4xl mb-4">🔗</p>
        <h2 className="font-display text-xl text-slate-200 mb-2">Link Not Found</h2>
        <p className="text-slate-500 text-sm mb-5">This share link may have been disabled or doesn't exist.</p>
        <Link href="/auth/signin" className="text-sand-400 hover:text-sand-300 text-sm transition-colors">Sign in to WanderLog →</Link>
      </div>
    </div>
  );

  if (!trip) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600 text-sm">Loading…</div>
    </div>
  );

  const allExpenses = totalExpenses(trip.expenses);
  const spent = totalSpent(trip.expenses);
  const duration = trip.startDate && trip.endDate ? tripDuration(trip.startDate, trip.endDate) : null;
  const overBudget = allExpenses > trip.budget;

  // Group itinerary by date
  const grouped = trip.itinerary.reduce<Record<string, typeof trip.itinerary>>((acc, item) => {
    const key = item.date || 'Undated';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  return (
    <div className="min-h-screen">
      {/* Read-only banner */}
      <div className="bg-ocean-900/80 border-b border-ocean-800 py-2">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 text-ocean-300 text-xs">
            <Globe size={12} />
            <span>Public view — read only</span>
            <Lock size={11} className="opacity-60" />
          </div>
          <Link href="/auth/signin" className="text-xs text-ocean-300 hover:text-ocean-200 transition-colors">
            Sign in to WanderLog →
          </Link>
        </div>
      </div>

      {/* Branded header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center gap-3">
          <span className="font-display text-lg text-sand-400">WanderLog</span>
          <span className="text-slate-700">/</span>
          <span className="text-slate-400 text-sm">{trip.name}</span>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-start gap-5">
            <span className="text-5xl">{trip.coverEmoji}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="font-display text-3xl text-slate-100">{trip.name}</h1>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[trip.status]}`}>
                  {STATUS_LABELS[trip.status]}
                </span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-sm mb-3">
                <MapPin size={13} />
                <span>{trip.destination}</span>
              </div>
              {trip.description && <p className="text-slate-500 text-sm italic mb-4">{trip.description}</p>}
              <div className="flex flex-wrap gap-5 text-sm text-slate-400">
                {trip.startDate && (
                  <div className="flex items-center gap-1.5">
                    <Calendar size={13} className="text-sand-500" />
                    <span>{formatDate(trip.startDate)}{trip.endDate && ` → ${formatDate(trip.endDate)}`}</span>
                    {duration && <span className="text-slate-600">({duration} days)</span>}
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Users size={13} className="text-ocean-400" />
                  <span>{trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Wallet size={13} className="text-emerald-400" />
                  <span>Budget: {formatCurrency(trip.budget, trip.currency)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Budget bar */}
          <div className="mt-6 bg-slate-800/60 rounded-xl p-4">
            <div className="flex justify-between text-xs text-slate-400 mb-2">
              <span>Estimated: <strong className="text-slate-200">{formatCurrency(allExpenses, trip.currency)}</strong></span>
              <span>Paid: <strong className="text-emerald-400">{formatCurrency(spent, trip.currency)}</strong></span>
              <span className={overBudget ? 'text-red-400' : ''}>
                {overBudget ? 'Over by: ' : 'Remaining: '}
                <strong>{formatCurrency(Math.abs(trip.budget - allExpenses), trip.currency)}</strong>
              </span>
            </div>
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${overBudget ? 'bg-red-500' : 'bg-gradient-to-r from-sand-600 to-sand-400'}`}
                style={{ width: `${Math.min((allExpenses / trip.budget) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-4xl mx-auto px-6 flex">
          {(['itinerary', 'overview'] as const).map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`py-3 px-5 text-sm capitalize transition-colors relative ${tab === t ? 'text-sand-400 tab-active' : 'text-slate-500 hover:text-slate-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-8">
        {tab === 'itinerary' && (
          <div className="animate-fade-in">
            {trip.itinerary.length === 0 ? (
              <div className="text-center py-16 text-slate-600">
                <p className="text-3xl mb-3">🗓️</p>
                <p className="font-display text-lg text-slate-500">No itinerary yet</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedDates.map(date => (
                  <div key={date}>
                    <div className="text-xs font-medium text-sand-500 uppercase tracking-widest mb-3">
                      {date === 'Undated' ? 'Undated' : formatDate(date)}
                    </div>
                    <div className="space-y-2">
                      {grouped[date].sort((a, b) => (a.startTime || '').localeCompare(b.startTime || '')).map(item => (
                        <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                          <span className="text-lg shrink-0 mt-0.5">{ITEM_TYPE_ICONS[item.type]}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm text-slate-200 font-medium">{item.title}</p>
                              {item.confirmed && <span className="text-emerald-500 text-xs">✓ confirmed</span>}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5 flex-wrap">
                              {item.startTime && <span>{item.startTime}{item.endTime && ` – ${item.endTime}`}</span>}
                              {item.location && <span>📍 {item.location}</span>}
                            </div>
                            {item.notes && (
                              <p className="text-xs text-slate-500 mt-2 bg-slate-800 rounded-lg px-3 py-1.5 font-mono">{item.notes}</p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'overview' && (
          <div className="animate-fade-in space-y-6">
            {/* Summary cards */}
            <div className="grid md:grid-cols-3 gap-4">
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Itinerary Items</p>
                <p className="font-display text-2xl text-slate-100">{trip.itinerary.length}</p>
                <p className="text-xs text-slate-600 mt-0.5">{trip.itinerary.filter(i => i.confirmed).length} confirmed</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Total Budget</p>
                <p className="font-display text-2xl text-sand-400">{formatCurrency(trip.budget, trip.currency)}</p>
                <p className="text-xs text-slate-600 mt-0.5">{trip.travelers} traveler{trip.travelers !== 1 ? 's' : ''}</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <p className="text-xs text-slate-500 mb-1">Amount Paid</p>
                <p className="font-display text-2xl text-emerald-400">{formatCurrency(spent, trip.currency)}</p>
                <p className="text-xs text-slate-600 mt-0.5">{trip.expenses.filter(e => e.paid).length} of {trip.expenses.length} expenses</p>
              </div>
            </div>

            {/* Expenses by category */}
            {trip.expenses.length > 0 && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="font-display text-slate-200 mb-4">Expenses</h3>
                <div className="space-y-2">
                  {trip.expenses.sort((a, b) => b.date.localeCompare(a.date)).map(expense => (
                    <div key={expense.id} className="flex items-center gap-3 py-2 border-b border-slate-800/50 last:border-0">
                      <span className="text-base shrink-0">{CATEGORY_ICONS[expense.category]}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-slate-300">{expense.title}</p>
                        <p className="text-xs text-slate-600">{CATEGORY_LABELS[expense.category]} · {formatDate(expense.date)}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-mono text-slate-200">{formatCurrency(expense.amount, expense.currency)}</p>
                        <p className={`text-xs ${expense.paid ? 'text-emerald-500' : 'text-slate-600'}`}>{expense.paid ? '✓ paid' : 'unpaid'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-12 py-6">
        <div className="max-w-4xl mx-auto px-6 flex items-center justify-between">
          <p className="text-xs text-slate-600">Shared via WanderLog · Read-only view</p>
          <Link href="/auth/signup" className="text-xs text-sand-400 hover:text-sand-300 transition-colors">
            Plan your own trip →
          </Link>
        </div>
      </footer>
    </div>
  );
}
