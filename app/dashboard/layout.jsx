'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Members Directory', href: '/dashboard/members', icon: '👥' },
    { name: 'Leadership', href: '/leadership', icon: '⭐' },
    { name: 'Register Member', href: '/register', icon: '➕' },
  ];

  useEffect(() => {
    async function checkAuth() {
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        router.push('/login');
      } else {
        setUser(currentUser);
        // Fetch full profile details including full_name and avatar_url
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, avatar_url, church_role')
          .eq('id', currentUser.id)
          .single();
        
        setUserProfile(profile || {});
      }
      setLoading(false);
    }
    checkAuth();
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-100">
        <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium text-slate-400">Loading portal session...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row text-slate-100">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-5 flex flex-col justify-between flex-shrink-0">
        <div>
          {/* Header Profile Section */}
          <div className="mb-6 p-3 bg-slate-950/60 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-slate-800 border-2 border-indigo-500/40 overflow-hidden flex items-center justify-center flex-shrink-0">
              {userProfile?.avatar_url ? (
                <img
                  src={userProfile.avatar_url}
                  alt={userProfile.full_name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-base font-bold text-amber-400">
                  {userProfile?.full_name?.charAt(0) || user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className="overflow-hidden">
              <h2 className="text-sm font-bold text-white truncate leading-tight">
                {userProfile?.full_name || 'Leader'}
              </h2>
              <span className="inline-block text-[10px] bg-indigo-500/10 text-indigo-300 font-semibold px-2 py-0.5 rounded border border-indigo-500/20 mt-1">
                {userProfile?.church_role || 'Member'}
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/10'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sign Out */}
        <div className="pt-4 border-t border-slate-800 mt-6">
          <p className="text-[11px] text-slate-500 font-medium truncate mb-2 px-1">{user?.email}</p>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 bg-slate-950 hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/20 font-semibold py-2 rounded-xl text-xs transition cursor-pointer"
          >
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}