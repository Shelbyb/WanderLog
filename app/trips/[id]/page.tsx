'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Edit2, MapPin, Calendar, Users, Wallet, Share2, UserPlus } from 'lucide-react';
import { Trip } from '@/lib/types';
import { getTripById, upsertTrip, canEdit, canView } from '@/lib/storage';
import { formatCurrency, formatDate, tripDuration, totalSpent, totalExpenses, STATUS_LABELS, STATUS_COLORS } from '@/lib/utils';
import { TripFormModal } from '@/components/TripFormModal';
import { ItineraryTab } from '@/components/ItineraryTab';
import { CostsTab } from '@/components/CostsTab';
import { CollaboratorsModal } from '@/components/CollaboratorsModal';
import { ShareModal } from '@/components/ShareModal';
import { useAuth } from '@/components/AuthProvider';

type Tab = 'overview' | 'itinerary' | 'costs';

export default function TripPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const { user, loading } = useAuth();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [showEdit, setShowEdit] = useState(false);
  const [showCollaborators, setShowCollaborators] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [accessError, setAccessError] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) { router.replace('/auth/signin'); return; }
    const t = getTripById(id);
    if (!t) { router.push('/'); return; }
    if (!canView(t, user.id)) { setAccessError(true); return; }
    setTrip(t);
  }, [id, router, user, loading]);

  function handleUpdate(data: Partial<Trip>) {
    if (!trip) return;
    const updated = { ...trip, ...data };
    upsertTrip(updated);
    setTrip(updated);
    setShowEdit(false);
  }

  function handleTripChange(updated: Trip) {
    upsertTrip(updated);
    setTrip(updated);
  }

  if (loading || (!trip && !accessError)) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-slate-600 text-sm">Loading…</div>
    </div>
  );

  if (accessError) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="text-center">
        <p className="text-4xl mb-4">🔒</p>
        <h2 className="font-display text-xl text-slate-200 mb-2">Access Denied</h2>
        <p className="text-slate-500 text-sm mb-5">You don't have permission to view this trip.</p>
        <Link href="/" className="bg-sand-500 hover:bg-sand-400 text-slate-950 font-medium text-sm px-4 py-2 rounded-lg transition-colors">
          Back to My Trips
        </Link>
      </div>
    </div>
  );

  if (!trip || !user) return null;

  const isOwner = trip.ownerId === user.id;
  const userCanEdit = canEdit(trip, user.id);
  const myRole = isOwner ? 'owner' : trip.collaborators.find(c => c.userId === user.id)?.role ?? 'viewer';

  const allExpenses = totalExpenses(trip.expenses);
  const spent = totalSpent(trip.expenses);
  const budgetPct = trip.budget > 0 ? Math.min((allExpenses / trip.budget) * 100, 100) : 0;
  const duration = trip.startDate && trip.endDate ? tripDuration(trip.startDate, trip.endDate) : null;
  const overBudget = allExpenses > trip.budget;
  const remaining = trip.budget - spent;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-slate-500 hover:text-slate-300 transition-colors text-sm">
            <ArrowLeft size={15} />
            All Trips
          </Link>
          <div className="flex items-center gap-2">
            {/* Role badge for non-owners */}
            {!isOwner && (
              <span className={`text-xs px-2.5 py-1 rounded-full border ${
                myRole === 'editor'
                  ? 'bg-ocean-900/50 text-ocean-300 border-ocean-800'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}>
                {myRole === 'editor' ? '✏️ Editor' : '👁 Viewer'}
              </span>
            )}
            {/* Share button — owner only */}
            {isOwner && (
              <button onClick={() => setShowShare(true)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-ocean-400 transition-colors text-sm border border-slate-700 hover:border-ocean-700 px-3 py-1.5 rounded-lg">
                <Share2 size={13} />
                Share
              </button>
            )}
            {/* Collaborators — owner only */}
            {isOwner && (
              <button onClick={() => setShowCollaborators(true)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-purple-400 transition-colors text-sm border border-slate-700 hover:border-purple-700 px-3 py-1.5 rounded-lg">
                <UserPlus size={13} />
                Invite
              </button>
            )}
            {/* Edit — owner or editor */}
            {userCanEdit && (
              <button onClick={() => setShowEdit(true)}
                className="flex items-center gap-1.5 text-slate-500 hover:text-sand-400 transition-colors text-sm border border-slate-700 hover:border-sand-700 px-3 py-1.5 rounded-lg">
                <Edit2 size={13} />
                Edit
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-b border-slate-800">
        <div className="max-w-5xl mx-auto px-6 py-8">
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

              {/* Collaborators row */}
              {trip.collaborators.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <span className="text-xs text-slate-600">Shared with:</span>
                  {trip.collaborators.map(c => (
                    <span key={c.userId} className="flex items-center gap-1.5 text-xs bg-slate-800 border border-slate-700 px-2 py-1 rounded-full">
                      <span className="text-slate-300">{c.name}</span>
                      <span className={c.role === 'editor' ? 'text-ocean-400' : 'text-slate-500'}>
                        {c.role === 'editor' ? '✏️' : '👁'}
                      </span>
                    </span>
                  ))}
                </div>
              )}
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
                className={`h-full rounded-full transition-all duration-700 ${overBudget ? 'bg-red-500' : 'bg-gradient-to-r from-sand-600 to-sand-400'}`}
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-800 bg-slate-950/60 sticky top-[61px] z-30 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6">
          <div className="flex">
            {(['overview', 'itinerary', 'costs'] as Tab[]).map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`py-3 px-5 text-sm capitalize transition-colors relative ${tab === t ? 'text-sand-400 tab-active' : 'text-slate-500 hover:text-slate-300'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {tab === 'overview' && <OverviewTab trip={trip} remaining={remaining} overBudget={overBudget} />}
        {tab === 'itinerary' && <ItineraryTab trip={trip} onChange={handleTripChange} canEdit={userCanEdit} />}
        {tab === 'costs' && <CostsTab trip={trip} onChange={handleTripChange} canEdit={userCanEdit} />}
      </div>

      {/* Modals */}
      {showEdit && userCanEdit && (
        <TripFormModal initial={trip} onClose={() => setShowEdit(false)} onSave={handleUpdate} />
      )}
      {showCollaborators && isOwner && (
        <CollaboratorsModal trip={trip} onClose={() => setShowCollaborators(false)} onChange={t => { setTrip(t); }} currentUserId={user.id} />
      )}
      {showShare && isOwner && (
        <ShareModal trip={trip} onClose={() => setShowShare(false)} onChange={t => { setTrip(t); }} />
      )}
    </div>
  );
}

function OverviewTab({ trip, remaining, overBudget }: { trip: Trip; remaining: number; overBudget: boolean }) {
  const confirmedItems = trip.itinerary.filter(i => i.confirmed).length;
  const paidTotal = trip.expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0);
  const unpaidTotal = trip.expenses.filter(e => !e.paid).reduce((s, e) => s + e.amount, 0);
  const paidCount = trip.expenses.filter(e => e.paid).length;

  return (
    <div className="animate-fade-in">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-display text-slate-200 mb-4">Itinerary</h3>
          {trip.itinerary.length === 0 ? (
            <p className="text-slate-600 text-sm">No items added yet.</p>
          ) : (
            <div className="space-y-2">
              {trip.itinerary.slice(0, 5).map(item => (
                <div key={item.id} className="flex items-center gap-3 text-sm">
                  <span>{item.type === 'flight' ? '✈️' : item.type === 'hotel' ? '🏨' : item.type === 'activity' ? '🎭' : item.type === 'meal' ? '🍽️' : '📍'}</span>
                  <span className="text-slate-300 flex-1 truncate">{item.title}</span>
                  <span className={`text-xs ${item.confirmed ? 'text-emerald-500' : 'text-slate-600'}`}>{item.confirmed ? '✓' : '○'}</span>
                </div>
              ))}
              {trip.itinerary.length > 5 && <p className="text-xs text-slate-600 pt-1">+{trip.itinerary.length - 5} more items</p>}
            </div>
          )}
          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500">
            <span>{trip.itinerary.length} total items</span>
            <span>{confirmedItems} confirmed</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <h3 className="font-display text-slate-200 mb-4">Costs</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Paid</span>
              <span className="text-emerald-400">{formatCurrency(paidTotal, trip.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Unpaid / Planned</span>
              <span className="text-sand-400">{formatCurrency(unpaidTotal, trip.currency)}</span>
            </div>
            <div className="flex justify-between border-t border-slate-800 pt-3">
              <span className="text-slate-400">Total estimated</span>
              <span className="text-slate-200">{formatCurrency(paidTotal + unpaidTotal, trip.currency)}</span>
            </div>
            <div className="flex justify-between">
              <span className={overBudget ? 'text-red-400' : 'text-slate-500'}>{overBudget ? 'Over budget by' : 'Under budget by'}</span>
              <span className={overBudget ? 'text-red-400 font-medium' : 'text-slate-300'}>{formatCurrency(Math.abs(remaining), trip.currency)}</span>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between text-xs text-slate-500">
            <span>{trip.expenses.length} expenses</span>
            <span>{paidCount} paid</span>
          </div>
        </div>
      </div>
    </div>
  );
}
