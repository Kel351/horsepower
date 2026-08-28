'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LeadershipDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      // Fetch members from profiles table
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, dob, program, avatar_url, church_role, phone')
        .order('full_name', { ascending: true });

      if (error) {
        console.error('Error fetching members:', error.message);
      } else {
        setMembers(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format date of birth cleanly (e.g., "12th Oct")
  const formatBirthday = (dateString) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Filter members based on search
  const filteredMembers = members.filter((member) => {
    const nameMatch = member.full_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const programMatch = member.program?.toLowerCase().includes(searchQuery.toLowerCase());
    return nameMatch || programMatch;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Leaders Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1">
              Church Directory • Total Members: <span className="text-amber-400 font-semibold">{members.length}</span>
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-4 py-2 rounded-lg text-sm transition"
            >
              + Add Member
            </Link>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md">
          <input
            type="text"
            placeholder="Search by name or program..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 p-3 rounded-xl text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
          />
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 border border-slate-800 p-5 rounded-2xl animate-pulse h-48"></div>
            ))}
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className="text-center py-16 bg-slate-900/40 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-lg">No members found.</p>
          </div>
        ) : (
          /* Members Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="bg-slate-900 border border-slate-800 hover:border-slate-700 transition p-5 rounded-2xl flex flex-col items-center text-center shadow-lg relative group"
              >
                {/* Profile Photo / Avatar */}
                <div className="w-20 h-20 rounded-full bg-slate-800 border-2 border-indigo-500/30 overflow-hidden flex items-center justify-center mb-4 flex-shrink-0">
                  {member.avatar_url ? (
                    <img
                      src={member.avatar_url}
                      alt={member.full_name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-xl font-bold text-indigo-400">
                      {member.full_name?.charAt(0)?.toUpperCase() || '?'}
                    </span>
                  )}
                </div>

                {/* Member Info */}
                <h3 className="font-bold text-lg text-white line-clamp-1">{member.full_name}</h3>
                
                <span className="inline-block bg-slate-800 text-indigo-300 text-xs font-semibold px-2.5 py-0.5 rounded-full mt-1 mb-3">
                  {member.church_role || 'Member'}
                </span>

                <div className="w-full border-t border-slate-800/80 pt-3 mt-auto space-y-1.5 text-xs text-slate-400">
                  <div className="flex justify-between items-center">
                    <span>Program:</span>
                    <span className="text-slate-200 font-medium truncate max-w-[130px]">
                      {member.program || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Birthday:</span>
                    <span className="text-amber-400 font-medium">
                      🎂 {formatBirthday(member.dob)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}