'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Trip, TripStatus } from '@/lib/types';

const EMOJIS = ['✈️', '🗺️', '🏔️', '🏖️', '🌿', '🏙️', '🎌', '🇮🇹', '🇫🇷', '🇯🇵', '🌍', '🚂', '⛵', '🏕️', '🎭'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];
const STATUSES: TripStatus[] = ['planning', 'upcoming', 'active', 'completed'];

interface Props {
  initial?: Partial<Trip>;
  onClose: () => void;
  onSave: (data: Partial<Trip>) => void;
}

export function TripFormModal({ initial, onClose, onSave }: Props) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    destination: initial?.destination || '',
    coverEmoji: initial?.coverEmoji || '✈️',
    startDate: initial?.startDate || '',
    endDate: initial?.endDate || '',
    status: initial?.status || 'planning' as TripStatus,
    budget: initial?.budget?.toString() || '',
    currency: initial?.currency || 'USD',
    description: initial?.description || '',
    travelers: initial?.travelers?.toString() || '1',
  });

  function set(field: string, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function handleSubmit() {
    if (!form.name.trim()) return;
    onSave({
      ...form,
      budget: parseFloat(form.budget) || 0,
      travelers: parseInt(form.travelers) || 1,
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/60">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg shadow-2xl animate-slide-up">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="font-display text-xl text-slate-100">{initial?.id ? 'Edit Trip' : 'New Trip'}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Emoji picker */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Cover</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map((e) => (
                <button
                  key={e}
                  onClick={() => set('coverEmoji', e)}
                  className={`text-xl p-2 rounded-lg transition-colors ${
                    form.coverEmoji === e ? 'bg-sand-500/20 ring-1 ring-sand-500' : 'hover:bg-slate-800'
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Trip Name *</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors"
                placeholder="Tokyo Adventure"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Destination</label>
              <input
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors"
                placeholder="Tokyo, Japan"
                value={form.destination}
                onChange={(e) => set('destination', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Start Date</label>
              <input
                type="date"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.startDate}
                onChange={(e) => set('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">End Date</label>
              <input
                type="date"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.endDate}
                onChange={(e) => set('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Status</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Travelers</label>
              <input
                type="number"
                min="1"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.travelers}
                onChange={(e) => set('travelers', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Budget</label>
              <input
                type="number"
                min="0"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors"
                placeholder="5000"
                value={form.budget}
                onChange={(e) => set('budget', e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Currency</label>
              <select
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.currency}
                onChange={(e) => set('currency', e.target.value)}
              >
                {CURRENCIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-500 uppercase tracking-wider mb-1.5 block">Description</label>
              <textarea
                rows={2}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors resize-none"
                placeholder="A short description of this trip..."
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 flex gap-3 justify-end">
          <button onClick={onClose} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!form.name.trim()}
            className="px-5 py-2 bg-sand-500 hover:bg-sand-400 disabled:opacity-40 disabled:cursor-not-allowed text-slate-950 font-medium text-sm rounded-lg transition-colors"
          >
            {initial?.id ? 'Save Changes' : 'Create Trip'}
          </button>
        </div>
      </div>
    </div>
  );
}
