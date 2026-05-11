'use client';

import { useState } from 'react';
import { Plus, Trash2, Check, Circle, Edit2, Lock } from 'lucide-react';
import { Trip, Expense, ExpenseCategory } from '@/lib/types';
import { formatCurrency, formatDate, CATEGORY_LABELS, CATEGORY_ICONS } from '@/lib/utils';
import { v4 as uuidv4 } from 'uuid';

const CATEGORIES: ExpenseCategory[] = ['flights', 'accommodation', 'food', 'transport', 'activities', 'shopping', 'health', 'other'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY'];

interface Props {
  trip: Trip;
  onChange: (trip: Trip) => void;
  canEdit: boolean;
}

interface ExpenseFormState {
  title: string; amount: string; currency: string; category: ExpenseCategory; date: string; notes: string; paid: boolean;
}

const defaultForm = (currency: string): ExpenseFormState => ({
  title: '', amount: '', currency, category: 'other', date: new Date().toISOString().slice(0, 10), notes: '', paid: false,
});

export function CostsTab({ trip, onChange, canEdit }: Props) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ExpenseFormState>(defaultForm(trip.currency));
  const [filterCat, setFilterCat] = useState<ExpenseCategory | 'all'>('all');

  const totalEstimated = trip.expenses.reduce((s, e) => s + e.amount, 0);
  const totalPaid = trip.expenses.filter(e => e.paid).reduce((s, e) => s + e.amount, 0);
  const remaining = trip.budget - totalEstimated;

  const byCategory = CATEGORIES.map(cat => {
    const catExpenses = trip.expenses.filter(e => e.category === cat);
    return { cat, total: catExpenses.reduce((s, e) => s + e.amount, 0), count: catExpenses.length };
  }).filter(c => c.count > 0);

  const filtered = filterCat === 'all' ? trip.expenses : trip.expenses.filter(e => e.category === filterCat);

  function setField(field: keyof ExpenseFormState, value: string | boolean) {
    setForm(f => ({ ...f, [field]: value }));
  }

  function handleAdd() {
    if (!form.title.trim() || !form.amount) return;
    const expense: Expense = {
      id: uuidv4(), title: form.title, amount: parseFloat(form.amount), currency: form.currency,
      category: form.category, date: form.date, notes: form.notes || undefined, paid: form.paid,
    };
    onChange({ ...trip, expenses: [...trip.expenses, expense] });
    setForm(defaultForm(trip.currency));
    setShowForm(false);
  }

  function handleEdit(expense: Expense) {
    setEditingId(expense.id);
    setForm({ title: expense.title, amount: expense.amount.toString(), currency: expense.currency, category: expense.category, date: expense.date, notes: expense.notes || '', paid: expense.paid });
    setShowForm(true);
  }

  function handleSaveEdit() {
    if (!form.title.trim() || !form.amount || !editingId) return;
    onChange({ ...trip, expenses: trip.expenses.map(e => e.id === editingId ? { ...e, ...form, amount: parseFloat(form.amount), notes: form.notes || undefined } : e) });
    setForm(defaultForm(trip.currency));
    setEditingId(null);
    setShowForm(false);
  }

  function handleDelete(id: string) {
    onChange({ ...trip, expenses: trip.expenses.filter(e => e.id !== id) });
  }

  function togglePaid(id: string) {
    if (!canEdit) return;
    onChange({ ...trip, expenses: trip.expenses.map(e => e.id === id ? { ...e, paid: !e.paid } : e) });
  }

  const budgetPct = trip.budget > 0 ? Math.min((totalEstimated / trip.budget) * 100, 100) : 0;

  return (
    <div className="animate-fade-in">
      {/* Budget overview */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-6">
        <div className="grid grid-cols-3 gap-4 mb-4 text-center">
          <div>
            <p className="text-xs text-slate-500 mb-1">Budget</p>
            <p className="font-display text-lg text-slate-200">{formatCurrency(trip.budget, trip.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">Estimated</p>
            <p className="font-display text-lg text-sand-400">{formatCurrency(totalEstimated, trip.currency)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-1">{remaining < 0 ? 'Over Budget' : 'Remaining'}</p>
            <p className={`font-display text-lg ${remaining < 0 ? 'text-red-400' : 'text-emerald-400'}`}>{formatCurrency(Math.abs(remaining), trip.currency)}</p>
          </div>
        </div>
        <div className="h-2 bg-slate-800 rounded-full overflow-hidden mb-1">
          <div className={`h-full budget-fill rounded-full ${remaining < 0 ? 'bg-red-500' : 'bg-gradient-to-r from-sand-600 to-sand-400'}`} style={{ width: `${budgetPct}%` }} />
        </div>
        <div className="flex justify-between text-xs text-slate-600">
          <span>Paid: {formatCurrency(totalPaid, trip.currency)}</span>
          <span>{budgetPct.toFixed(0)}% of budget</span>
        </div>
      </div>

      {/* Category breakdown */}
      {byCategory.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-3">By Category</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {byCategory.sort((a, b) => b.total - a.total).map(({ cat, total, count }) => (
              <button key={cat} onClick={() => setFilterCat(filterCat === cat ? 'all' : cat)}
                className={`text-left bg-slate-900 border rounded-xl p-3 transition-all ${filterCat === cat ? 'border-sand-500' : 'border-slate-800 hover:border-slate-700'}`}>
                <div className="text-lg mb-1">{CATEGORY_ICONS[cat]}</div>
                <p className="text-xs text-slate-400 mb-0.5">{CATEGORY_LABELS[cat]}</p>
                <p className="text-sm font-medium text-slate-200">{formatCurrency(total, trip.currency)}</p>
                <p className="text-xs text-slate-600">{count} item{count !== 1 ? 's' : ''}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Expenses header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="font-display text-xl text-slate-100">Expenses</h2>
          {filterCat !== 'all' && (
            <p className="text-xs text-sand-400 mt-0.5">
              {CATEGORY_LABELS[filterCat]} · <button className="underline" onClick={() => setFilterCat('all')}>Clear</button>
            </p>
          )}
        </div>
        {canEdit ? (
          <button onClick={() => { setShowForm(true); setEditingId(null); setForm(defaultForm(trip.currency)); }}
            className="flex items-center gap-1.5 bg-sand-500 hover:bg-sand-400 text-slate-950 font-medium text-sm px-4 py-2 rounded-lg transition-colors">
            <Plus size={14} />
            Add Expense
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
        <div className="bg-slate-900 border border-slate-700 rounded-xl p-5 mb-5 animate-slide-up">
          <h3 className="font-display text-slate-200 mb-4">{editingId ? 'Edit Expense' : 'New Expense'}</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            <div className="col-span-2 md:col-span-3">
              <label className="text-xs text-slate-500 mb-1 block">Title *</label>
              <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors"
                placeholder="Round-trip flights…" value={form.title} onChange={e => setField('title', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Amount *</label>
              <input type="number" min="0" step="0.01" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors"
                placeholder="0.00" value={form.amount} onChange={e => setField('amount', e.target.value)} />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Currency</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.currency} onChange={e => setField('currency', e.target.value)}>
                {CURRENCIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Category</label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.category} onChange={e => setField('category', e.target.value)}>
                {CATEGORIES.map(c => <option key={c} value={c}>{CATEGORY_ICONS[c]} {CATEGORY_LABELS[c]}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1 block">Date</label>
              <input type="date" className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:border-sand-500 transition-colors"
                value={form.date} onChange={e => setField('date', e.target.value)} />
            </div>
            <div className="col-span-2 md:col-span-3">
              <label className="text-xs text-slate-500 mb-1 block">Notes</label>
              <input className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors"
                placeholder="Optional notes…" value={form.notes} onChange={e => setField('notes', e.target.value)} />
            </div>
            <div className="col-span-2 md:col-span-3">
              <button onClick={() => setField('paid', !form.paid)}
                className={`flex items-center gap-2 text-sm transition-colors ${form.paid ? 'text-emerald-400' : 'text-slate-500'}`}>
                {form.paid ? <Check size={15} /> : <Circle size={15} />}
                Mark as Paid
              </button>
            </div>
          </div>
          <div className="flex gap-2 justify-end mt-4">
            <button onClick={() => { setShowForm(false); setEditingId(null); }} className="px-4 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors">Cancel</button>
            <button onClick={editingId ? handleSaveEdit : handleAdd} disabled={!form.title.trim() || !form.amount}
              className="px-5 py-2 bg-sand-500 hover:bg-sand-400 disabled:opacity-40 text-slate-950 font-medium text-sm rounded-lg transition-colors">
              {editingId ? 'Save Changes' : 'Add Expense'}
            </button>
          </div>
        </div>
      )}

      {/* Expense list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-slate-600">
          <p className="text-3xl mb-3">💸</p>
          <p className="font-display text-lg text-slate-500 mb-1">No expenses yet</p>
          <p className="text-sm">{canEdit ? 'Track flights, hotels, food, and more' : 'Nothing has been added yet'}</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.sort((a, b) => b.date.localeCompare(a.date)).map(expense => (
            <div key={expense.id}
              className={`flex items-center gap-4 bg-slate-900 border rounded-xl px-4 py-3 ${expense.paid ? 'border-slate-800' : 'border-slate-800 border-dashed'}`}>
              <span className="text-lg shrink-0">{CATEGORY_ICONS[expense.category]}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-slate-200 font-medium truncate">{expense.title}</p>
                  <span className={`text-xs shrink-0 ${expense.paid ? 'text-emerald-500' : 'text-slate-600'}`}>{expense.paid ? '✓ paid' : 'unpaid'}</span>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                  <span>{formatDate(expense.date)}</span>
                  <span>{CATEGORY_LABELS[expense.category]}</span>
                  {expense.notes && <span className="truncate text-slate-600">{expense.notes}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="font-mono text-sm text-slate-200">{formatCurrency(expense.amount, expense.currency)}</span>
                {canEdit && (
                  <>
                    <button onClick={() => togglePaid(expense.id)}
                      className={`p-1.5 rounded-lg transition-colors ${expense.paid ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-slate-600 hover:text-slate-400'}`}>
                      {expense.paid ? <Check size={14} /> : <Circle size={14} />}
                    </button>
                    <button onClick={() => handleEdit(expense)} className="p-1.5 text-slate-600 hover:text-sand-400 transition-colors rounded-lg"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(expense.id)} className="p-1.5 text-slate-600 hover:text-red-400 transition-colors rounded-lg"><Trash2 size={13} /></button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
