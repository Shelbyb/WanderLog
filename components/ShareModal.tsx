'use client';

import { useState } from 'react';
import { X, Link2, Copy, Check, Globe, EyeOff, RefreshCw } from 'lucide-react';
import { Trip } from '@/lib/types';
import { createShareLink, revokeShareLink, enableShareLink } from '@/lib/storage';

interface Props {
  trip: Trip;
  onClose: () => void;
  onChange: (trip: Trip) => void;
}

export function ShareModal({ trip, onClose, onChange }: Props) {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(false);

  const shareLink = trip.shareLink;
  const isActive = shareLink?.enabled;
  const publicUrl = shareLink?.token
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/share/${shareLink.token}`
    : '';

  async function handleCopy() {
    if (!publicUrl) return;
    await navigator.clipboard.writeText(publicUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleGenerate() {
    setLoading(true);
    const updated = createShareLink(trip.id);
    setLoading(false);
    if (updated) onChange(updated);
  }

  function handleRevoke() {
    if (!confirm('Revoke this link? Anyone with the link will lose access.')) return;
    setLoading(true);
    const updated = revokeShareLink(trip.id);
    setLoading(false);
    if (updated) onChange(updated);
  }

  function handleReEnable() {
    setLoading(true);
    const updated = enableShareLink(trip.id);
    setLoading(false);
    if (updated) onChange(updated);
  }

  function handleRegenerate() {
    if (!confirm('Generate a new link? The old link will stop working.')) return;
    setLoading(true);
    // Revoke old then create new
    revokeShareLink(trip.id);
    const updated = createShareLink(trip.id);
    setLoading(false);
    if (updated) onChange(updated);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop bg-slate-950/70">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div>
            <h2 className="font-display text-xl text-slate-100">Share Itinerary</h2>
            <p className="text-xs text-slate-500 mt-0.5">{trip.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-300 transition-colors"><X size={18} /></button>
        </div>

        <div className="p-6">
          {/* Explanation */}
          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-4 mb-6">
            <div className="flex items-start gap-3">
              <Globe size={16} className="text-ocean-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-slate-300 font-medium mb-1">Public read-only link</p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Anyone with this link can view the trip itinerary and details — no sign-in required.
                  They cannot make any changes. You can revoke the link at any time.
                </p>
              </div>
            </div>
          </div>

          {/* No link yet */}
          {!shareLink && (
            <button
              onClick={handleGenerate}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-ocean-700 hover:bg-ocean-600 text-white font-medium text-sm py-3 rounded-xl transition-colors disabled:opacity-50"
            >
              <Link2 size={15} />
              Generate Public Link
            </button>
          )}

          {/* Has a link */}
          {shareLink && (
            <div className="space-y-4">
              {/* Status badge */}
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-emerald-400' : 'bg-slate-600'}`} />
                <span className={`text-sm font-medium ${isActive ? 'text-emerald-400' : 'text-slate-500'}`}>
                  {isActive ? 'Link is active' : 'Link is disabled'}
                </span>
              </div>

              {/* URL display */}
              {isActive && (
                <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center gap-2">
                  <code className="text-xs text-ocean-300 flex-1 truncate font-mono">{publicUrl}</code>
                  <button
                    onClick={handleCopy}
                    className={`shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition-colors ${
                      copied ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 hover:bg-slate-600 text-slate-300'
                    }`}
                  >
                    {copied ? <><Check size={12} />Copied!</> : <><Copy size={12} />Copy</>}
                  </button>
                </div>
              )}

              {/* Created info */}
              <p className="text-xs text-slate-600">
                Created {new Date(shareLink.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </p>

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                {isActive ? (
                  <>
                    <button
                      onClick={handleRevoke}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-red-500/10 border border-slate-700 hover:border-red-500/30 text-slate-400 hover:text-red-400 text-sm py-2.5 rounded-xl transition-colors"
                    >
                      <EyeOff size={13} />
                      Disable Link
                    </button>
                    <button
                      onClick={handleRegenerate}
                      disabled={loading}
                      className="flex-1 flex items-center justify-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 text-sm py-2.5 rounded-xl transition-colors"
                    >
                      <RefreshCw size={13} />
                      New Link
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleReEnable}
                    disabled={loading}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-ocean-700 hover:bg-ocean-600 text-white text-sm py-2.5 rounded-xl transition-colors"
                  >
                    <Globe size={13} />
                    Re-enable Link
                  </button>
                )}
              </div>
            </div>
          )}
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
