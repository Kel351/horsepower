'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function RegisterMemberPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    dob: '',
    program: '',
    church_role: 'Member',
    cell: '',
  });

  const isPastorRole = 
    formData.church_role.toLowerCase() === 'pastor' || 
    formData.church_role.toLowerCase() === 'head pastor';

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      
      if (name === 'church_role' && (value.toLowerCase() === 'pastor' || value.toLowerCase() === 'head pastor')) {
        updated.cell = 'N/A';
      } else if (name === 'church_role' && updated.cell === 'N/A') {
        updated.cell = '';
      }
      
      return updated;
    });
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!isPastorRole && !formData.cell) {
        alert('Please select a cell group.');
        setLoading(false);
        return;
      }

      let avatarUrl = '';

      if (file) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName);

        avatarUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase.from('profiles').insert([
        {
          full_name: formData.full_name,
          email: formData.email,
          phone: formData.phone,
          dob: formData.dob || null,
          program: formData.program,
          church_role: formData.church_role,
          cell: isPastorRole ? 'N/A' : formData.cell,
          avatar_url: avatarUrl,
        },
      ]);

      if (error) throw error;

      alert(`${formData.full_name} registered successfully!`);
      router.push('/dashboard/members');
    } catch (err) {
      alert(`Registration failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-slate-900 border border-slate-800 p-8 rounded-2xl text-slate-100 shadow-xl">
      {/* Header with Back Button Directing to Home */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-bold text-white">Register New Member / Leader</h1>
          <p className="text-xs text-slate-400 mt-1">Add details including cell group assignment.</p>
        </div>
        <Link
          href="/"
          className="bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
        >
          <span>←</span> Back
        </Link>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Full Name */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name *</label>
          <input
            type="text"
            name="full_name"
            required
            value={formData.full_name}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
          />
        </div>

        {/* Email & Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="john@example.com"
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+233..."
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Date of Birth & Program */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
            <input
              type="date"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Program / Department</label>
            <input
              type="text"
              name="program"
              value={formData.program}
              onChange={handleChange}
              placeholder="e.g. Engineering"
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>
        </div>

        {/* Church Role & Cell Dropdown */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Church Role *</label>
            <select
              name="church_role"
              value={formData.church_role}
              onChange={handleChange}
              className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-100"
            >
              <option value="Member">Member</option>
              <option value="Leader">Leader</option>
              <option value="Usher">Usher</option>
              <option value="Singer">Singer</option>
              <option value="Executive">Executive</option>
              <option value="Pastor">Pastor</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Cell Group {isPastorRole ? '(Not Applicable)' : '*'}
            </label>
            {isPastorRole ? (
              <input
                type="text"
                disabled
                value="N/A (Pastor)"
                className="w-full bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl text-sm text-slate-500 cursor-not-allowed"
              />
            ) : (
              <select
                name="cell"
                required
                value={formData.cell}
                onChange={handleChange}
                className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-sm focus:ring-2 focus:ring-amber-500 outline-none text-slate-100"
              >
                <option value="">-- Select Cell --</option>
                <option value="Pillars of Zion">Pillars of Zion</option>
                <option value="El Roi">El Roi</option>
                <option value="Exouxia">Exouxia</option>
              </select>
            )}
          </div>
        </div>

        {/* Profile Photo Upload */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Profile Photo <span className="text-slate-500 font-normal">(Optional)</span>
          </label>
          <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-3 rounded-xl">
            <div className="w-14 h-14 rounded-full bg-slate-800 overflow-hidden flex items-center justify-center border border-slate-700 flex-shrink-0">
              {filePreview ? (
                <img src={filePreview} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <svg className="w-10 h-10 text-slate-500 mt-2" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              )}
            </div>

            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-slate-950 font-bold py-3 rounded-xl transition text-sm shadow-lg shadow-amber-500/10 cursor-pointer"
        >
          {loading ? 'Processing Upload...' : 'Register Member'}
        </button>
      </form>
    </div>
  );
}