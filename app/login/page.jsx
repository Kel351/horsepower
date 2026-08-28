'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { GHANA_LOCATIONS } from '@/data/ghanaLocations';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auth States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // Profile Form States (for Leader Registration)
  const [isInGhana, setIsInGhana] = useState(true);
  const [selectedRegion, setSelectedRegion] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);

  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    dob: '',
    level: 'Executive',
    dateJoined: '',
    program: '',
    churchRole: 'Pastor',
    ghanaTown: '',
    country: '',
    city: ''
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      if (isSignUp) {
        // 1. Sign Up Leader in Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (authError) throw authError;

        const user = authData.user;
        if (!user) throw new Error('Failed to retrieve signed-up user.');

        let avatarUrl = null;

        // 2. Upload Profile Picture if provided
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop();
          const filePath = `${user.id}/${Date.now()}.${fileExt}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(filePath, avatarFile, { upsert: true });

          if (!uploadError) {
            const { data: publicUrlData } = supabase.storage
              .from('avatars')
              .getPublicUrl(filePath);
            avatarUrl = publicUrlData.publicUrl;
          }
        }

        // 3. Insert Leader Profile Details into 'profiles' Table
        const payload = {
          id: user.id,
          email: user.email,
          full_name: formData.fullName,
          phone: formData.phone,
          dob: formData.dob || null,
          level: formData.level,
          date_joined: formData.dateJoined || null,
          church_role: formData.churchRole,
          program: formData.program || null,
          avatar_url: avatarUrl,
          is_in_ghana: isInGhana,
          region: isInGhana ? selectedRegion : null,
          ghana_town: isInGhana ? formData.ghanaTown : null,
          country: !isInGhana ? formData.country : null,
          city: !isInGhana ? formData.city : null,
        };

        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([payload]);

        if (profileError) throw profileError;

        alert('Leader Account & Profile created successfully!');
        router.push('/dashboard');
      } else {
        // Sign In Flow
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Auth Error:', err);
      setErrorMsg(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 text-slate-100 my-8">
      <div className={`w-full bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl transition-all ${isSignUp ? 'max-w-2xl' : 'max-w-md'}`}>
        
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            {isSignUp ? 'Leader Account & Profile Registration' : 'Leadership Sign In'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {isSignUp
              ? 'Enter your credentials and personal details to join leadership portal'
              : 'Enter your credentials to access the dashboard'}
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-lg text-xs mb-4 text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          
          {/* Account Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="leader@church.com"
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
              />
            </div>
          </div>

          {/* Full Registration Form (Only when Signing Up) */}
          {isSignUp && (
            <>
              <div className="pt-2 border-t border-slate-800/80"></div>

              {/* Profile Photo */}
              <div className="flex items-center gap-4 p-3 bg-slate-950/60 border border-slate-800 rounded-lg">
                <div className="w-14 h-14 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center overflow-hidden font-semibold text-slate-400 flex-shrink-0">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    'Photo'
                  )}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1">Upload Leader Photo</label>
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={handleImageChange}
                    className="text-xs text-slate-400 font-medium file:mr-3 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-indigo-400 hover:file:bg-slate-700 cursor-pointer"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Pastor John Doe"
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-medium placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm" 
                  onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Telephone Number</label>
                  <input 
                    type="tel" 
                    required 
                    placeholder="024XXXXXXX"
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-medium placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm" 
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date of Birth</label>
                  <input 
                    type="date" 
                    required 
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm scheme-dark" 
                    onChange={(e) => setFormData({...formData, dob: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category / Level</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                  >
                    <option value="Executive">Executive</option>
                    <option value="Worker">Worker</option>
                    <option value="Level 400">Level 400</option>
                    <option value="Level 300">Level 300</option>
                    <option value="Level 200">Level 200</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Date Joined</label>
                  <input 
                    type="date" 
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm scheme-dark" 
                    onChange={(e) => setFormData({...formData, dateJoined: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Leadership Role</label>
                  <select 
                    className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm"
                    onChange={(e) => setFormData({...formData, churchRole: e.target.value})}
                  >
                    <option value="Pastor">Pastor</option>
                    <option value="Executive">Executive / Leader</option>
                    <option value="Usher">Head Usher</option>
                    <option value="Singer">Choir Leader</option>
                    <option value="Media">Media Lead</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Program of Study / Profession</label>
                <input 
                  type="text" 
                  placeholder="e.g. BSc. Industrial Engineering" 
                  className="w-full bg-slate-950 border border-slate-800 p-2.5 rounded-lg text-slate-100 font-medium placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm" 
                  onChange={(e) => setFormData({...formData, program: e.target.value})}
                />
              </div>

              {/* Location Toggle */}
              <div className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg space-y-2">
                <label className="block text-xs font-semibold text-slate-200">Are you currently in Ghana?</label>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="locationToggle" 
                      checked={isInGhana} 
                      onChange={() => setIsInGhana(true)} 
                      className="accent-indigo-500"
                    />
                    Yes (Ghana)
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                    <input 
                      type="radio" 
                      name="locationToggle" 
                      checked={!isInGhana} 
                      onChange={() => setIsInGhana(false)} 
                      className="accent-indigo-500"
                    />
                    No (Outside Ghana)
                  </label>
                </div>

                {isInGhana ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <div>
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-100 text-xs font-medium outline-none"
                        value={selectedRegion}
                        onChange={(e) => setSelectedRegion(e.target.value)}
                      >
                        <option value="">-- Select Region --</option>
                        {Object.keys(GHANA_LOCATIONS || {}).map((region) => (
                          <option key={region} value={region}>{region}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <select 
                        className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-100 text-xs font-medium outline-none disabled:opacity-40"
                        disabled={!selectedRegion}
                        onChange={(e) => setFormData({...formData, ghanaTown: e.target.value})}
                      >
                        <option value="">-- Select Town --</option>
                        {selectedRegion && GHANA_LOCATIONS[selectedRegion]?.map((town) => (
                          <option key={town} value={town}>{town}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                    <input 
                      type="text" 
                      placeholder="Country" 
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-100 text-xs outline-none"
                      onChange={(e) => setFormData({...formData, country: e.target.value})}
                    />
                    <input 
                      type="text" 
                      placeholder="City / State" 
                      className="w-full bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-100 text-xs outline-none"
                      onChange={(e) => setFormData({...formData, city: e.target.value})}
                    />
                  </div>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold py-3 rounded-lg transition text-sm mt-2 cursor-pointer shadow-lg shadow-indigo-600/20"
          >
            {loading ? 'Processing...' : isSignUp ? 'Complete Registration & Sign Up' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400 space-y-2">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg('');
            }}
            className="text-indigo-400 hover:underline font-semibold block w-full cursor-pointer"
          >
            {isSignUp ? 'Already registered? Sign In' : "New leader? Register & Create Account"}
          </button>

          <Link href="/" className="inline-block text-slate-500 hover:text-slate-300 pt-2">
            ← Back to Home
          </Link>
        </div>

      </div>
    </div>
  );
}