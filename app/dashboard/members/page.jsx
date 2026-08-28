'use client';
import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function MembersPage() {
  const [members, setMembers] = useState([]);
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      // 1. Get current logged-in user details
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setCurrentUserId(user.id);
        const { data: profile } = await supabase
          .from('profiles')
          .select('church_role')
          .eq('id', user.id)
          .single();
        
        // Store only the specific church role string
        setCurrentUserRole(profile?.church_role || null);
      }

      // 2. Fetch all church members
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, dob, program, avatar_url, church_role, phone')
        .order('full_name', { ascending: true });

      setMembers(data || []);
    } catch (err) {
      console.error('Error fetching members data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Delete Handler (Restricted)
  const handleDelete = async (memberId, memberName) => {
    if (memberId === currentUserId) {
      alert("You cannot remove your own account from here.");
      return;
    }

    const confirmed = confirm(`Are you sure you want to remove ${memberName} from the church directory?`);
    if (!confirmed) return;

    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', memberId);

    if (error) {
      alert(`Delete failed: ${error.message}`);
    } else {
      alert(`${memberName} has been removed successfully.`);
      setMembers((prev) => prev.filter((m) => m.id !== memberId));
    }
  };

  // STRICT Pastor Check: ONLY returns true if role is explicitly 'Pastor' or 'Head Pastor'
  const normalizedRole = currentUserRole?.toString().trim().toLowerCase() || '';
  const isPastor = normalizedRole === 'pastor' || normalizedRole === 'head pastor';

  const formatBirthday = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const filtered = members.filter((m) =>
    m.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    m.program?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Church Members Directory</h1>
          <p className="text-slate-400 text-sm">
            Total Members: <span className="text-amber-400 font-semibold">{members.length}</span>
            {currentUserRole && (
              <span className="ml-3 text-xs bg-slate-800 text-indigo-300 px-2.5 py-1 rounded-md border border-slate-700 font-medium">
                Your Role: {currentUserRole}
              </span>
            )}
          </p>
        </div>
        <input
          type="text"
          placeholder="Search by name or program..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-sm text-slate-100 placeholder-slate-500 outline-none focus:ring-2 focus:ring-indigo-500 w-full md:w-72"
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl animate-pulse h-48" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filtered.map((member) => (
            <div key={member.id} className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col items-center text-center relative group">
              
              {/* Profile Photo */}
              <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-indigo-500/30 overflow-hidden mb-3 flex items-center justify-center flex-shrink-0">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.full_name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xl font-bold text-indigo-400">{member.full_name?.charAt(0)}</span>
                )}
              </div>

              <h3 className="font-bold text-white text-base leading-snug">{member.full_name}</h3>
              
              <span className="bg-slate-800 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 mb-3">
                {member.church_role || 'Member'}
              </span>

              <div className="w-full border-t border-slate-800 pt-3 text-xs text-slate-400 space-y-1 mb-3">
                <div className="flex justify-between">
                  <span>Program:</span>
                  <span className="text-slate-200 font-medium truncate max-w-[120px]">{member.program || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Birthday:</span>
                  <span className="text-amber-400 font-medium">🎂 {formatBirthday(member.dob)}</span>
                </div>
              </div>

              {/* Remove Member Button - Restricted strictly to Pastors */}
              {isPastor && (
                <button
                  onClick={() => handleDelete(member.id, member.full_name)}
                  className="w-full mt-auto bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-semibold py-1.5 rounded-lg text-xs transition cursor-pointer"
                >
                  Remove Member
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}