import { useState, useEffect, useRef, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, Camera, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';

const DEFAULT_AVATAR = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ccircle cx='50' cy='50' r='50' fill='%231e1e2e'/%3E%3Ccircle cx='50' cy='37' r='18' fill='%23374151'/%3E%3Cellipse cx='50' cy='90' rx='30' ry='20' fill='%23374151'/%3E%3C/svg%3E`;

export function PersonalInfo() {
  const { user, login } = useAuth();
  const { tickets } = useData();
  
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedOk, setSavedOk] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  // Sync form with auth user
  useEffect(() => {
    if (user) {
      setFormData({ name: user.name, email: user.email, phone: '' });
    }
    // Load saved avatar from localStorage
    const savedAvatar = localStorage.getItem('userAvatar');
    if (savedAvatar) setAvatarPreview(savedAvatar);
  }, [user]);

  const currentAvatar = avatarPreview || user?.avatar || DEFAULT_AVATAR;

  const handleAvatarClick = () => {
    if (isEditing) fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      setAvatarPreview(result);
      localStorage.setItem('userAvatar', result);
    };
    reader.readAsDataURL(file);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // In a real app, we'd call PUT /api/users/:id with the new data
      // For now, update localStorage so it persists
      const updatedUser = { ...user, name: formData.name, email: formData.email };
      localStorage.setItem('authUser', JSON.stringify(updatedUser));
      setSavedOk(true);
      setTimeout(() => setSavedOk(false), 3000);
      setIsEditing(false);
    } catch {
      // silently handle
    } finally {
      setSaving(false);
    }
  };

  const upcomingCount = tickets.filter(t => t.status === 'confirmed').length;
  const watchedCount = tickets.filter(t => t.status === 'watched').length;
  const cancelledCount = tickets.filter(t => t.status === 'cancelled').length;
  const memberSince = user ? new Date().getFullYear() : 2024;

  const fieldClass = "w-full bg-background border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors";
  const labelClass = "block text-sm text-gray-500 mb-2 flex items-center gap-2";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl p-8 border border-white/5"
    >
      {savedOk && (
        <div className="flex items-center gap-2 p-3 mb-6 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          Profile saved successfully!
        </div>
      )}

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="relative group">
            <img 
              src={currentAvatar}
              alt={user?.name || 'User'}
              className="w-24 h-24 rounded-full object-cover border-4 border-background bg-gray-800"
              onError={(e) => { (e.target as HTMLImageElement).src = DEFAULT_AVATAR; }}
            />
            {isEditing && (
              <button
                onClick={handleAvatarClick}
                className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                title="Upload photo"
              >
                <Camera className="w-6 h-6 text-white" />
              </button>
            )}
            {!isEditing && (
              <div className="absolute bottom-0 right-0 w-6 h-6 bg-green-500 rounded-full border-2 border-background" title="Active" />
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
          <div>
            <h2 className="text-2xl font-bold mb-1">{isEditing ? formData.name : (user?.name || 'User')}</h2>
            <p className="text-gray-400 text-sm">Member since {memberSince}</p>
            <p className="text-xs text-primary mt-1 capitalize">{user?.role || 'customer'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {isEditing ? (
            <>
              <button onClick={() => setIsEditing(false)} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-colors text-sm">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-6 py-2 bg-primary hover:bg-primary-hover disabled:opacity-60 text-white rounded-lg font-medium transition-colors flex items-center gap-2 text-sm">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-colors">
              Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className={labelClass}><User className="w-4 h-4" />Full Name</label>
            {isEditing ? (
              <input type="text" name="name" value={formData.name} onChange={handleChange} className={fieldClass} />
            ) : (
              <p className="text-lg font-medium">{user?.name || '—'}</p>
            )}
          </div>
          <div>
            <label className={labelClass}><Mail className="w-4 h-4" />Email Address</label>
            {isEditing ? (
              <input type="email" name="email" value={formData.email} onChange={handleChange} className={fieldClass} />
            ) : (
              <p className="text-lg font-medium">{user?.email || '—'}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className={labelClass}><Phone className="w-4 h-4" />Phone Number</label>
            {isEditing ? (
              <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+84 xxx xxx xxx" className={fieldClass} />
            ) : (
              <p className="text-lg font-medium text-gray-400">{formData.phone || 'Not set'}</p>
            )}
          </div>
          {isEditing && (
            <div>
              <label className={labelClass}><Camera className="w-4 h-4" />Profile Photo</label>
              <button
                onClick={handleAvatarClick}
                className="w-full border-2 border-dashed border-white/10 hover:border-primary/50 rounded-lg p-4 text-gray-400 hover:text-white transition-colors text-sm flex items-center justify-center gap-2"
              >
                <Camera className="w-4 h-4" />
                Click to upload a photo
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stats from real booking data */}
      <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        <div className="bg-background rounded-xl p-4 border border-white/5">
          <p className="text-3xl font-display font-bold text-primary mb-1">{watchedCount}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Movies Watched</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-white/5">
          <p className="text-3xl font-display font-bold text-primary mb-1">{upcomingCount}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Upcoming</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-white/5">
          <p className="text-3xl font-display font-bold text-primary mb-1">{tickets.length}</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Total Tickets</p>
        </div>
      </div>
    </motion.div>
  );
}
