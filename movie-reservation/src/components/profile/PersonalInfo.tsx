import { useState, useEffect, ChangeEvent } from 'react';
import { motion } from 'motion/react';
import { User, Mail, Phone, MapPin, Edit2, Link as LinkIcon } from 'lucide-react';

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  location: string;
  memberSince: string;
  avatar: string;
}

const defaultUser: UserProfile = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  phone: '+1 234 567 8900',
  location: 'New York, USA',
  memberSince: '2024',
  avatar: 'https://i.pravatar.cc/150?u=a042581f4e29026024d'
};

export function PersonalInfo() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<UserProfile>(defaultUser);
  const [formData, setFormData] = useState<UserProfile>(defaultUser);

  useEffect(() => {
    const saved = localStorage.getItem('personalInfo');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        setFormData(parsed);
      } catch (e) {
        console.error('Failed to parse user data', e);
      }
    }
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      setUser(formData);
      localStorage.setItem('personalInfo', JSON.stringify(formData));
    } else {
      setFormData(user);
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface rounded-2xl p-8 border border-white/5"
    >
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <img 
              src={isEditing ? formData.avatar : user.avatar} 
              alt={isEditing ? formData.name : user.name} 
              className="w-24 h-24 rounded-full object-cover border-4 border-background"
            />
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary-hover transition-colors border-2 border-background">
              <Edit2 className="w-4 h-4" />
            </button>
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-1">{isEditing ? formData.name : user.name}</h2>
            <p className="text-gray-400 text-sm">Member since {user.memberSince}</p>
          </div>
        </div>
        
        <button 
          onClick={handleEditToggle}
          className="px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2 flex items-center gap-2">
              <User className="w-4 h-4" /> Full Name
            </label>
            {isEditing ? (
              <input 
                type="text" 
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full bg-background border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            ) : (
              <p className="text-lg font-medium">{user.name}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2 flex items-center gap-2">
              <Mail className="w-4 h-4" /> Email Address
            </label>
            {isEditing ? (
              <input 
                type="email" 
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-background border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            ) : (
              <p className="text-lg font-medium">{user.email}</p>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm text-gray-500 mb-2 flex items-center gap-2">
              <Phone className="w-4 h-4" /> Phone Number
            </label>
            {isEditing ? (
              <input 
                type="tel" 
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-background border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            ) : (
              <p className="text-lg font-medium">{user.phone}</p>
            )}
          </div>

          <div>
            <label className="block text-sm text-gray-500 mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Location
            </label>
            {isEditing ? (
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                className="w-full bg-background border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
              />
            ) : (
              <p className="text-lg font-medium">{user.location}</p>
            )}
          </div>
        </div>
      </div>
      
      {isEditing && (
        <div className="mt-8">
          <label className="block text-sm text-gray-500 mb-2 flex items-center gap-2">
            <LinkIcon className="w-4 h-4" /> Avatar URL
          </label>
          <input 
            type="text" 
            name="avatar"
            value={formData.avatar}
            onChange={handleChange}
            className="w-full bg-background border border-white/20 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
          />
        </div>
      )}

      {/* Quick Stats */}
      <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-4 text-center">
        <div className="bg-background rounded-xl p-4 border border-white/5">
          <p className="text-3xl font-display font-bold text-primary mb-1">12</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Movies Watched</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-white/5">
          <p className="text-3xl font-display font-bold text-primary mb-1">3</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Upcoming</p>
        </div>
        <div className="bg-background rounded-xl p-4 border border-white/5">
          <p className="text-3xl font-display font-bold text-primary mb-1">450</p>
          <p className="text-xs text-gray-400 uppercase tracking-wider">Points</p>
        </div>
      </div>
    </motion.div>
  );
}
