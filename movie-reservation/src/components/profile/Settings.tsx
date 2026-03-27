import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Lock, Globe, Moon, Shield, Smartphone, X, CheckCircle2, AlertTriangle } from 'lucide-react';

export function Settings() {
  const [settings, setSettings] = useState({
    emailNotifications: true,
    smsNotifications: false,
    promotions: true,
    darkMode: true,
    twoFactorAuth: false,
    language: 'English'
  });

  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Password Form State
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [passwordError, setPasswordError] = useState('');

  // Delete Form State
  const [deleteConfirmText, setDeleteConfirmText] = useState('');

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const toggleSetting = (key: keyof typeof settings) => {
    if (key === 'darkMode') {
      showToast('Cinematic theme is locked to Dark Mode for the best experience.');
      return;
    }
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    showToast('Preference updated successfully.');
  };

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setSettings(prev => ({ ...prev, language: newLang }));
    showToast(`Language changed to ${newLang}.`);
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      setPasswordError('New passwords do not match.');
      return;
    }
    if (passwords.new.length < 6) {
      setPasswordError('Password must be at least 6 characters.');
      return;
    }
    // Mock success
    setShowPasswordModal(false);
    setPasswords({ current: '', new: '', confirm: '' });
    setPasswordError('');
    showToast('Password updated successfully.');
  };

  const handleDeleteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmText !== 'DELETE') return;
    
    setShowDeleteModal(false);
    setDeleteConfirmText('');
    showToast('Account scheduled for deletion.');
  };

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl p-8 border border-white/5 space-y-12"
      >
        <div>
          <h2 className="text-2xl font-bold mb-1">Account Settings</h2>
          <p className="text-gray-400 text-sm">Manage your preferences and security settings.</p>
        </div>

        {/* Notifications */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white border-b border-white/10 pb-2">
            <Bell className="w-5 h-5 text-primary" />
            Notification Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Email Notifications</p>
                <p className="text-sm text-gray-400">Receive booking confirmations and updates via email.</p>
              </div>
              <button 
                onClick={() => toggleSetting('emailNotifications')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.emailNotifications ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.emailNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">SMS Notifications</p>
                <p className="text-sm text-gray-400">Receive important alerts via text message.</p>
              </div>
              <button 
                onClick={() => toggleSetting('smsNotifications')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.smsNotifications ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.smsNotifications ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Promotions & Offers</p>
                <p className="text-sm text-gray-400">Get notified about special discounts and new releases.</p>
              </div>
              <button 
                onClick={() => toggleSetting('promotions')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.promotions ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.promotions ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white border-b border-white/10 pb-2">
            <Shield className="w-5 h-5 text-primary" />
            Security
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Two-Factor Authentication</p>
                <p className="text-sm text-gray-400">Add an extra layer of security to your account.</p>
              </div>
              <button 
                onClick={() => toggleSetting('twoFactorAuth')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.twoFactorAuth ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.twoFactorAuth ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Change Password</p>
                <p className="text-sm text-gray-400">Update your password regularly to keep your account secure.</p>
              </div>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm font-medium transition-colors"
              >
                Update
              </button>
            </div>
          </div>
        </div>

        {/* Preferences */}
        <div className="space-y-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-white border-b border-white/10 pb-2">
            <Smartphone className="w-5 h-5 text-primary" />
            App Preferences
          </h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Language</p>
                <p className="text-sm text-gray-400">Select your preferred language.</p>
              </div>
              <select 
                value={settings.language}
                onChange={handleLanguageChange}
                className="bg-background border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-primary transition-colors"
              >
                <option value="English">English</option>
                <option value="Vietnamese">Vietnamese</option>
                <option value="Spanish">Spanish</option>
                <option value="French">French</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">Dark Mode</p>
                <p className="text-sm text-gray-400">Toggle dark mode appearance.</p>
              </div>
              <button 
                onClick={() => toggleSetting('darkMode')}
                className={`w-12 h-6 rounded-full transition-colors relative ${settings.darkMode ? 'bg-primary' : 'bg-gray-600'}`}
              >
                <span className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.darkMode ? 'translate-x-6' : 'translate-x-0'}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="space-y-6 pt-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-red-500 border-b border-red-500/20 pb-2">
            Danger Zone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-white">Delete Account</p>
              <p className="text-sm text-gray-400">Permanently delete your account and all data.</p>
            </div>
            <button 
              onClick={() => setShowDeleteModal(true)}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
            >
              Delete Account
            </button>
          </div>
        </div>
      </motion.div>

      {/* Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-8 right-8 bg-surface border border-white/10 shadow-2xl rounded-xl p-4 flex items-center gap-3 z-50"
          >
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <p className="text-sm font-medium text-white">{toastMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Change Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  Change Password
                </h3>
                <button 
                  onClick={() => setShowPasswordModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handlePasswordSubmit} className="p-6 space-y-4">
                {passwordError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
                    {passwordError}
                  </div>
                )}
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Current Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.current}
                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.new}
                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Confirm New Password</label>
                  <input 
                    type="password" 
                    required
                    value={passwords.confirm}
                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Update Password
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Account Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-red-500/20 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-red-500 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5" />
                  Delete Account
                </h3>
                <button 
                  onClick={() => setShowDeleteModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleDeleteSubmit} className="p-6 space-y-4">
                <p className="text-gray-300 text-sm">
                  This action is permanent and cannot be undone. All your bookings, points, and personal data will be permanently removed.
                </p>
                <div className="p-4 bg-background rounded-lg border border-white/5">
                  <p className="text-sm text-gray-400 mb-2">
                    To confirm, please type <strong className="text-white">DELETE</strong> below:
                  </p>
                  <input 
                    type="text" 
                    required
                    value={deleteConfirmText}
                    onChange={e => setDeleteConfirmText(e.target.value)}
                    placeholder="DELETE"
                    className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-red-500 transition-colors"
                  />
                </div>
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={deleteConfirmText !== 'DELETE'}
                    className="px-4 py-2 bg-red-500 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Delete Permanently
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
