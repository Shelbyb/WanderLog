'use client';

import { useState } from 'react';
import { Plus, Check, Circle, ChevronDown, ChevronUp, Trash2, Edit2, Lock } from 'lucide-react';
import { Trip, ItineraryItem, ItineraryItemType } from '@/lib/types';
import { formatDate, ITEM_TYPE_ICONS } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

const TYPES: ItineraryItemType[] = ['flight', 'hotel', 'activity', 'meal', 'transport', 'free', 'note'];

interface Props {
  trip: Trip;
  onChange: (trip: Trip) => void;
  canEdit: boolean;
}

interface ItemFormState {
  type: ItineraryItemType;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  location: string;
  notes: string;
  confirmed: boolean;
}

const defaultForm: ItemFormState = {
  type: 'activity', title: '', date: '', startTime: '', endTime: '', location: '', notes: '', confirmed: false,
};

export function ItineraryTab({ trip, onChange, canEdit }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ItemFormState>(defaultForm);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const grouped = trip.itinerary.reduce<Record<string, ItineraryItem[]>>((acc, item) => {
    const key = item.date || 'Undated';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});
  const sortedDates = Object.keys(grouped).sort();

  function setField(field: keyof ItemFormState, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleAdd() {
    if (!form.title.trim()) return;
    const item: ItineraryItem = {
      id: uuidv4(),
      type: form.type,
      title: form.title,
      date: form.date,
      startTime: form.startTime || undefined,
      endTime: form.endTime || undefined,
      location: form.location || undefined,
      notes: form.notes || undefined,
      confirmed: form.confirmed,
    };
    onChange({ ...trip, itinerary: [...trip.itinerary, item] });
    setForm(defaultForm);
    setShowForm(false);
  }

  function handleEdit(item: ItineraryItem) {
    setEditingId(item.id);
    setForm({ type: item.type, title: item.title, date: item.date, startTime: item.startTime || '', endTime: item.endTime || '', location: item.location || '', notes: item.notes || '', confirmed: item.confirmed });
    setShowForm(true);
  }

  function handleSaveEdit() {
    if (!form.title.trim() || !editingId) return;
    const updated = trip.itinerary.map(item =>
      item.id === editingId
        ? { ...item, ...form, startTime: form.startTime || undefined, endTime: form.endTime || undefined, location: form.location || undefined, notes: form.notes || undefined }
        : item
    );
    onChange({ ...trip, itinerary: updated });
    setForm(defaultForm);
    setEditingId(null);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    onChange({ ...trip, itinerary: trip.itinerary.filter(i => i.id !== id) });
  }

  function toggleConfirmed(id: string) {
    if (!canEdit) return;
    onChange({ ...trip, itinerary: trip.itinerary.map(i => i.id === id ? { ...i, confirmed: !i.confirmed } : i) });
  }

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="font-display text-xl text-slate-100">Itinerary</h2>
          <p className="text-sm text-slate-500 mt-0.5">{trip.itinerary.length} items · {trip.itinerary.filter(i => i.confirmed).length} confirmed</p>
        </div>
        {canEdit ? (
          <button
            onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm); }}
            className="flex items-center gap-1.5 bg-sand-500 hover:bg-sand-400 text-slate-950 font-medium text-sm px-4 py-2 rounded-lg transition-colors"
          >
            <Plus size={14} />
            Add Item
          </button>
        ) : (
          <div className="flex items-center gap-1.5 text-slate-600 text-xs">
            <Lock size={11} />
            View only
          </div>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && canEdit && (
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-6 animate-slide-up">
          <h3 className="font-display text-slate-200 mb-4">{editingId ? 'Edit Item' : 'New Itinerary Item'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-1">
              <label className="text-xs text-slate-500 mb-1 block">Type</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.type} onChange={e => setField('type', e.target.value)}>
                {TYPES.map(t => <option key={t} value={t}>{ITEM_TYPE_ICONS[t]} {t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-xs text-slate-500 mb-1 block">Title *</label>
              <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors"
                placeholder="Flight to Tokyo…" value={form.title} onChange={e => setField('title', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Date</label>
              <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.date} onChange={e => setField('date', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Start Time</label>
              <input type="time" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.startTime} onChange={e => setField('startTime', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">End Time</label>
              <input type="time" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.endTime} onChange={e => setField('endTime', e.target.value)} />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="text-xs text-slate-500 mb-1 block">Location</label>
              <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors"
                placeholder="JFK Airport, New York" value={form.location} onChange={e => setField('location', e.target.value)} />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="text-xs text-slate-500 mb-1 block">Notes</label>
              <textarea rows={2} className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors resize-none"
                placeholder="Reservation #, booking links…" value={form.notes} onChange={e => setField('notes', e.target.value)} />
            </div>
            <div className="col-span-2 md:col-span-3">
              <button onClick={() => setField('confirmed', !form.confirmed)}
                className={`flex items-center gap-2 text-sm transition-colors ${form.confirmed ? 'text-emerald-400' : 'text-slate-500'}`}>
                {form.confirmed ? <Check size={15} /> : <Circle size={15} />}
                Confirmed
              </button>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
            <button onClick={editingId ? handleSaveEdit : handleAdd} disabled={!form.title.trim()}
              className="px-5 py-2 bg-sand-500 hover:bg-sand-400 disabled:opacity-40 text-slate-950 font-medium text-sm rounded-lg transition-colors">
              {editingId ? 'Save Changes' : 'Add Item'}
            </button>
          </div>
        </div>
      )}

      {/* Timeline */}
      {trip.itinerary.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <p className="text-3xl mb-3">🗓️</p>
          <p className="font-display text-lg text-slate-500 mb-1">No itinerary yet</p>
          <p className="text-sm">{canEdit ? 'Add flights, hotels, activities, and more' : 'Nothing has been added yet'}</p>
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
                  <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                    <div className="flex items-center gap-3 p-4">
                      <span className="text-lg shrink-0">{ITEM_TYPE_ICONS[item.type]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-slate-200 font-medium truncate">{item.title}</p>
                          {item.confirmed && <span className="text-emerald-500 text-xs shrink-0">✓ confirmed</span>}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                          {item.startTime && <span>{item.startTime}{item.endTime && ` – ${item.endTime}`}</span>}
                          {item.location && <span>📍 {item.location}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {canEdit && (
                          <button onClick={() => toggleConfirmed(item.id)}
                            className={`p-1.5 rounded-lg transition-colors ${item.confirmed ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-600 hover:text-slate-400'}`}>
                            {item.confirmed ? <Check size={14} /> : <Circle size={14} />}
                          </button>
                        )}
                        {item.notes && (
                          <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                            className="p-1.5 text-slate-600 hover:text-slate-400 transition-colors rounded-lg">
                            {expandedId === item.id ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
                          </button>
                        )}
                        {canEdit && (
                          <>
                            <button onClick={() => handleEdit(item)} className="p-1.5 text-slate-600 hover:text-sand-400 transition-colors rounded-lg"><Edit2 size={13} /></button>
                            <button onClick={() => handleDelete(item.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors rounded-lg"><Trash2 size={13} /></button>
                          </>
                        )}
                      </div>
                    </div>
                    {item.notes && expandedId === item.id && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="bg-slate-800 rounded-lg px-3 py-2 text-xs text-slate-400 font-mono leading-relaxed">{item.notes}</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
