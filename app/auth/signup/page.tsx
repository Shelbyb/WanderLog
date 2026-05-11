'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Eye, EyeOff, Mail, Lock, User, Plane } from 'lucide-react';
import { signUp, signInWithGoogle } from '@/lib/auth';
import { useAuth } from '@/components/AuthProvider';

export default function SignUpPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    if (!name || !email || !password) { setError('Please fill in all fields.'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true); setError('');
    const result = signUp(name.trim(), email.trim(), password);
    setLoading(false);
    if ('error' in result) { setError(result.error); return; }
    refresh();
    router.push('/');
  }

  async function handleGoogle() {
    setLoading(true); setError('');
    const result = signInWithGoogle({
      email: `demo.google.${Date.now()}@gmail.com`,
      name: 'Google User',
      avatar: 'GU',
    });
    setLoading(false);
    refresh();
    router.push('/');
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-sand-500/10 border border-sand-500/20 rounded-2xl mb-4">
            <Plane size={24} className="text-sand-400" />
          </div>
          <h1 className="font-display text-3xl text-slate-100">WanderLog</h1>
          <p className="text-slate-500 text-sm mt-1">Create your free account</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm px-4 py-3 rounded-xl transition-colors mb-6 disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.706A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.706V4.962H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.038l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.962L3.964 7.294C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-6">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-xs text-slate-600">or sign up with email</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Full Name</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Smith"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Email</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-4 py-3 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">Password</label>
              <div className="relative">
                <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600" />
                <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSignUp()} placeholder="Min. 6 characters"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-9 pr-10 py-3 text-sm text-slate-100 placeholder-slate-600 focus:border-sand-500 transition-colors" />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-600 hover:text-slate-400">
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-400">{error}</div>
            )}

            <button onClick={handleSignUp} disabled={loading}
              className="w-full bg-sand-500 hover:bg-sand-400 disabled:opacity-50 text-slate-950 font-semibold text-sm py-3 rounded-xl transition-colors">
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </div>
        </div>

        <p className="text-center text-sm text-slate-600 mt-5">
          Already have an account?{' '}
          <Link href="/auth/signin" className="text-sand-400 hover:text-sand-300 transition-colors">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
