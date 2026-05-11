'use client';

import { useState } from 'react';
import { X, UserPlus, Trash2, Shield, Eye } from 'lucide-react';
import { Trip, CollaboratorRole, Collaborator } from '@/lib/types';
import { addCollaborator, removeCollaborator, updateCollaboratorRole } from '@/lib/storage';
import { getUserByEmail } from '@/lib/auth';
import { avatarColor, avatarInitials } from '@/lib/utils';

interface Props {
  trip: Trip;
  currentUserId: string;
  onClose: () => void;
  onChange: (trip: Trip) => void;
}

export function CollaboratorsModal({ trip, currentUserId, onClose, onChange }: Props) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<CollaboratorRole>('viewer');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleInvite() {
    setError(''); setSuccess('');
    const trimmed = email.trim().toLowerCase();
    if (!trimmed) { setError('Enter an email address.'); return; }

    // Can't invite yourself
    const user = getUserByEmail(trimmed);
    if (!user) {
      setError('No WanderLog account found with that email. They need to sign up first.');
      return;
    }
    if (user.id === currentUserId) { setError("You can't invite yourself."); return; }

    // Already a collaborator?
    const already = trip.collaborators.find(c => c.userId === user.id);
    if (already) {
      // Update role instead
      const updated = updateCollaboratorRole(trip.id, user.id, role);
      if (updated) {
        onChange(updated);
        setSuccess(`Updated ${user.name}'s role to ${role}.`);
        setEmail('');
      }
      return;
    }

    const collaborator: Collaborator = {
      userId: user.id,
      email: user.email,
      name: user.name,
      avatar: user.avatar,
      role,
      addedAt: new Date().toISOString(),
    };

    const updated = addCollaborator(trip.id, collaborator);
    if (updated) {
      onChange(updated);
      setSuccess(`${user.name} added as ${role}.`);
      setEmail('');
    }
  }

  function handleRemove(userId: string) {
    const updated = removeCollaborator(trip.id, userId);
    if (updated) onChange(updated);
  }

  function handleRoleChange(userId: string, newRole: CollaboratorRole) {
    const updated = updateCollaboratorRole(trip.id, userId, newRole);
    if (updated) onChange(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/70">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="font-display text-xl text-slate-100">Manage Access</h2>
            <p className="text-xs text-slate-500 mt-0.5">{trip.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6">
          {/* Invite form */}
          <div className="mb-6">
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">Invite by Email</label>
            <div className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleInvite()}
                placeholder="friend@example.com"
                className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors"
              />
              <select
                value={role}
                onChange={e => setRole(e.target.value as CollaboratorRole)}
                className="bg-slate-800 border border-slate-700 rounded-xl px-2 py-2.5 text-sm text-slate-100 focus:border-sand-500 transition-colors"
              >
                <option value="viewer">Viewer</option>
                <option value="editor">Editor</option>
              </select>
              <button
                onClick={handleInvite}
                className="bg-sand-500 hover:bg-sand-400 text-slate-950 font-medium text-sm px-3 py-2.5 rounded-xl transition-colors"
              >
                <UserPlus size={15} />
              </button>
            </div>

            {/* Role explanation */}
            <div className="flex gap-3 mt-3">
              <div className="flex items-start gap-1.5 text-xs text-slate-600">
                <Eye size={11} className="mt-0.5 text-slate-500" />
                <span><strong className="text-slate-400">Viewer</strong> — can see the trip, itinerary, and costs but cannot make changes.</span>
              </div>
            </div>
            <div className="flex gap-3 mt-1.5">
              <div className="flex items-start gap-1.5 text-xs text-slate-600">
                <Shield size={11} className="mt-0.5 text-ocean-400" />
                <span><strong className="text-slate-400">Editor</strong> — can add, edit, and delete itinerary items and expenses.</span>
              </div>
            </div>

            {error && <p className="text-red-400 text-xs mt-3">{error}</p>}
            {success && <p className="text-emerald-400 text-xs mt-3">✓ {success}</p>}
          </div>

          {/* Current collaborators */}
          <div>
            <label className="text-xs text-slate-500 uppercase tracking-wider mb-3 block">
              People with Access ({trip.collaborators.length + 1})
            </label>

            {/* Owner row */}
            <div className="flex items-center gap-3 py-2.5 border-b border-slate-800/50">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white ${avatarColor(currentUserId)}`}>
                {trip.collaborators.find(c => c.userId === currentUserId)?.avatar || 'ME'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-slate-200">You</p>
                <p className="text-xs text-slate-500 truncate">Owner</p>
              </div>
              <span className="text-xs text-sand-400 bg-sand-500/10 border border-sand-500/20 px-2.5 py-1 rounded-full">Owner</span>
            </div>

            {/* Collaborator rows */}
            {trip.collaborators.length === 0 ? (
              <p className="text-sm text-slate-600 py-4 text-center">No collaborators yet. Invite someone above.</p>
            ) : (
              <div className="space-y-0.5 mt-1">
                {trip.collaborators.map(c => (
                  <div key={c.userId} className="flex items-center gap-3 py-2.5 rounded-xl hover:bg-slate-800/40 transition-colors px-1">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0 ${avatarColor(c.userId)}`}>
                      {c.avatar || avatarInitials(c.name)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-200">{c.name}</p>
                      <p className="text-xs text-slate-500 truncate">{c.email}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <select
                        value={c.role}
                        onChange={e => handleRoleChange(c.userId, e.target.value as CollaboratorRole)}
                        className="bg-slate-800 border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 focus:border-sand-500 transition-colors"
                      >
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                      </select>
                      <button
                        onClick={() => { if (confirm(`Remove ${c.name}?`)) handleRemove(c.userId); }}
                        className="p-1.5 text-slate-600 hover:text-red-400 transition-colors rounded-lg"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm py-2.5 rounded-xl transition-colors">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
