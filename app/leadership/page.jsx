'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LeadershipPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [leaders, setLeaders] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Auth States for Form
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    checkSessionAndFetch();
  }, []);

  const checkSessionAndFetch = async () => {
    setLoading(true);
    try {
      // 1. Check if user is already signed in
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        setSession(user);
        setCurrentUserId(user.id);

        // Fetch current user's role
        const { data: userProfile } = await supabase
          .from('profiles')
          .select('church_role')
          .eq('id', user.id)
          .single();

        setCurrentUserRole(userProfile?.church_role || null);

        // 2. Fetch all leadership profiles
        fetchLeaders();
      } else {
        setSession(null);
      }
    } catch (err) {
      console.error('Session check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchLeaders = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, full_name, church_role, avatar_url, phone, program')
      .order('full_name', { ascending: true });

    setLeaders(data || []);
  };

  // Login / Signup Handler
  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account created! You can now sign in.');
        setIsSignUp(false);
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Refresh view to show leaders directly
        await checkSessionAndFetch();
      }
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Strict Pastor Delete Handler
  const handleDeleteLeader = async (leaderId, leaderName) => {
    if (leaderId === currentUserId) {
      alert("You cannot remove your own account from here.");
      return;
    }

    const confirmed = confirm(`Are you sure you want to remove ${leaderName} from leadership?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', leaderId);

    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      alert(`${leaderName} removed successfully.`);
      setLeaders((prev) => prev.filter((l) => l.id !== leaderId));
    }
  };

  // Strict Role Check: Only 'Pastor' or 'Head Pastor'
  const normalizedRole = currentUserRole?.toString().trim().toLowerCase() || '';
  const isPastor = normalizedRole === 'pastor' || normalizedRole === 'head pastor';

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium text-slate-400">Loading Leadership Directory...</p>
      </div>
    );
  }

  // IF LOGGED IN: Directly Show Leadership Directory
  if (session) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white">Leadership Portal</h1>
            <p className="text-slate-400 text-sm mt-1">
              Active Leaders Directory
              {currentUserRole && (
                <span className="ml-3 text-xs bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700 font-medium">
                  Your Role: {currentUserRole}
                </span>
              )}
            </p>
          </div>
          <Link
            href="/dashboard"
            className="bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-4 py-2 rounded-xl text-sm font-semibold transition self-start"
          >
            ← Back to Dashboard
          </Link>
        </div>

        {/* Leaders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {leaders.map((leader) => (
            <div key={leader.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-indigo-500/30 overflow-hidden mb-3 flex items-center justify-center flex-shrink-0">
                {leader.avatar_url ? (
                  <img src={leader.avatar_url} alt={leader.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-indigo-400">{leader.full_name?.charAt(0) || 'L'}</span>
                )}
              </div>

              <h3 className="font-bold text-white text-base">{leader.full_name || 'Leader'}</h3>
              <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 mb-3">
                {leader.church_role || 'Executive'}
              </span>

              <div className="w-full border-t border-slate-800 pt-3 text-xs text-slate-400 space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span className="text-slate-200 font-medium">{leader.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Program/Role:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[120px]">{leader.program || 'N/A'}</span>
                </div>
              </div>

              {/* ONLY Pastor can delete leaders */}
              {isPastor && (
                <button
                  onClick={() => handleDeleteLeader(leader.id, leader.full_name)}
                  className="w-full mt-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Remove Leader
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // IF NOT LOGGED IN: Show Login Form
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100">
      <div className="max-w-md w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Leadership Portal</h1>
            <p className="text-xs text-slate-400 mt-1">Supabase Integrated Directory</p>
          </div>
          <Link href="/" className="text-xs text-slate-400 hover:text-slate-200">
            ← Back to Home
          </Link>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs mb-4 text-center font-medium">
            {errorMsg}
          </div>
        )}

        {/* Tab Toggle */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => setIsSignUp(false)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              !isSignUp ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsSignUp(true)}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${
              isSignUp ? 'bg-amber-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-medium placeholder-slate-500 focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none text-sm"
            />
          </div>

          <button
            type="submit"
            disabled={authLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-lg transition text-sm cursor-pointer shadow-lg shadow-amber-500/10"
          >
            {authLoading ? 'Processing...' : isSignUp ? 'Create Account' : 'Sign In to Portal'}
          </button>
        </form>
      </div>
    </div>
  );
}