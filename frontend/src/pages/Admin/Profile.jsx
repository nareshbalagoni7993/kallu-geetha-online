import { useEffect, useRef, useState } from 'react';
import API from '../../api/axios';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function AdminProfile() {
  const { user: authUser, updateUser } = useAuth();
  const [profile, setProfile]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [saving, setSaving]     = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [form, setForm]         = useState({ name: '', phone: '' });
  const [pwForm, setPwForm]     = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [avatarFile, setAvatarFile]     = useState(null);
  const [avatarPreview, setAvatarPreview] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw]         = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    API.get('/admin/profile')
      .then((r) => {
        setProfile(r.data);
        setForm({ name: r.data.name || '', phone: r.data.phone || '' });
        setAvatarPreview(r.data.avatar || '');
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('Image must be under 5MB'); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('name', form.name);
      fd.append('phone', form.phone);
      if (avatarFile) fd.append('avatar', avatarFile);
      const r = await API.put('/admin/profile', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile((p) => ({ ...p, ...r.data }));
      setAvatarPreview(r.data.avatar || avatarPreview);
      setAvatarFile(null);
      updateUser({ ...authUser, name: r.data.name, avatar: r.data.avatar });
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) { toast.error('New passwords do not match'); return; }
    if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setPwSaving(true);
    try {
      await API.put('/admin/profile/password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to change password'); }
    finally { setPwSaving(false); }
  };

  if (loading) return <Spinner size="lg" text="Loading profile..." />;

  const initials = profile?.name?.split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2) || 'A';

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">My Profile</h1>

      {/* Profile Card */}
      <div className="card p-6">
        <div className="flex items-center gap-5 mb-6 pb-5 border-b">
          {/* Avatar */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center shadow-lg cursor-pointer"
              onClick={() => fileRef.current.click()}>
              {avatarPreview
                ? <img src={avatarPreview} alt="avatar" className="w-full h-full object-cover" />
                : <span className="text-3xl font-bold text-white">{initials}</span>}
            </div>
            <button type="button" onClick={() => fileRef.current.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center shadow-md hover:bg-primary-dark transition-colors text-sm">
              📷
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">{profile?.name}</h2>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
            <span className="inline-block mt-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium capitalize">
              {profile?.role}
            </span>
            {profile?.shop && (
              <p className="text-xs text-green-700 mt-1 font-medium">🏪 {profile.shop.name} · {profile.shop.address?.city}</p>
            )}
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleProfileSave} className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Edit Info</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input className="input-field" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input className="input-field bg-gray-50 cursor-not-allowed" value={profile?.email} readOnly />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">📞</span>
                <input className="input-field pl-9" placeholder="+91 XXXXX XXXXX" value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            {avatarFile && (
              <div className="flex items-end">
                <div className="p-2 bg-green-50 border border-green-200 rounded-lg w-full">
                  <p className="text-xs text-green-700">✓ New photo selected: {avatarFile.name.slice(0, 20)}</p>
                  <button type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(profile?.avatar || ''); }}
                    className="text-xs text-red-500 hover:underline mt-0.5">Remove</button>
                </div>
              </div>
            )}
          </div>
          <button type="submit" disabled={saving} className="btn-primary px-8 disabled:opacity-60">
            {saving ? 'Saving...' : '✓ Save Changes'}
          </button>
        </form>
      </div>

      {/* Account Info */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">Account Info</h3>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Account Type', value: profile?.role?.toUpperCase(), icon: '👤' },
            { label: 'Member Since', value: new Date(profile?.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }), icon: '📅' },
            { label: 'Status', value: profile?.isActive ? 'Active' : 'Inactive', icon: '🟢' },
            { label: 'Shop', value: profile?.shop?.name || 'No shop', icon: '🏪' },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-0.5">{item.icon} {item.label}</p>
              <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-4">🔒 Change Password</h3>
        <form onSubmit={handlePasswordChange} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
            <div className="relative">
              <input type={showCurrentPw ? 'text' : 'password'} className="input-field pr-10"
                placeholder="Enter current password" value={pwForm.currentPassword}
                onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })} required />
              <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                {showCurrentPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <div className="relative">
                <input type={showNewPw ? 'text' : 'password'} className="input-field pr-10"
                  placeholder="Min 6 characters" value={pwForm.newPassword}
                  onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })} required />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-sm">
                  {showNewPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
              <input type="password" className={`input-field ${pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword ? 'border-red-400' : ''}`}
                placeholder="Repeat new password" value={pwForm.confirmPassword}
                onChange={(e) => setPwForm({ ...pwForm, confirmPassword: e.target.value })} required />
              {pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword && (
                <p className="text-xs text-red-500 mt-1">Passwords don't match</p>
              )}
            </div>
          </div>
          {pwForm.newPassword.length > 0 && (
            <div className="flex gap-1">
              {['weak', 'fair', 'good', 'strong'].map((lvl, i) => (
                <div key={lvl} className={`flex-1 h-1.5 rounded-full transition-colors ${pwForm.newPassword.length > i * 3 ? ['bg-red-400','bg-orange-400','bg-yellow-400','bg-green-500'][i] : 'bg-gray-200'}`} />
              ))}
              <span className="text-xs text-gray-400 ml-2">
                {pwForm.newPassword.length < 6 ? 'Too short' : pwForm.newPassword.length < 9 ? 'Fair' : pwForm.newPassword.length < 12 ? 'Good' : 'Strong'}
              </span>
            </div>
          )}
          <button type="submit" disabled={pwSaving || (pwForm.confirmPassword && pwForm.confirmPassword !== pwForm.newPassword)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-8 py-2.5 rounded-xl font-medium transition-colors disabled:opacity-60">
            {pwSaving ? 'Changing...' : '🔒 Change Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
