import React, { useState, useEffect } from 'react';
import { Settings, Bookmark, User, Mail, Loader2, Save, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

type TabId = 'general' | 'booking' | 'user' | 'email';

const tabs = [
  { id: 'general', label: 'General System', icon: Settings },
  { id: 'booking', label: 'Booking Rules', icon: Bookmark },
  { id: 'user', label: 'User & Security', icon: User },
  { id: 'email', label: 'Email Configuration', icon: Mail },
] as const;

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Email Configuration State
  const [smtp, setSmtp] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    enableSsl: true,
    emailEnabled: false
  });

  // Fetch settings on mount
  useEffect(() => {
    if (activeTab === 'email') {
      loadEmailSettings();
    }
  }, [activeTab]);

  const loadEmailSettings = async () => {
    setLoading(true);
    try {
      const data = await api.get<any>('/settings/email');
      if (data.configured) {
        setSmtp(data);
      }
    } catch (err) {
      console.error('Failed to load email settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      await api.put('/settings/email', smtp);
      alert('Email settings saved successfully!');
    } catch (err) {
      alert('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    const email = prompt('Enter recipient email for test:');
    if (!email) return;

    setSaving(true);
    try {
      await api.post('/settings/email/test', { email });
      alert('Test email sent! Check your inbox.');
    } catch (err) {
      alert('Failed to send test email. Check console or SMTP logs.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 h-full pb-12">
      <div>
        <h1 className="text-3xl font-display font-bold mb-2">System Settings</h1>
        <p className="text-gray-400">Configure global parameters and policies for the Cinemax platform.</p>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors text-left",
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-surface rounded-2xl border border-white/5 p-6 md:p-8">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-6">General System Settings</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">System Name</label>
                  <input type="text" defaultValue="Cinemax Official" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Support Email</label>
                  <input type="email" defaultValue="support@cinemax.example.com" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div className="pt-4">
                  <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
                    Save General Settings
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'booking' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-6">Booking Rules</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Max Tickets Per Booking</label>
                  <input type="number" defaultValue="8" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Seat Hold Timeout (mins)</label>
                  <input type="number" defaultValue="10" className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" />
                </div>
                <div className="md:col-span-2 pt-4">
                  <button className="px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20">
                    Update Rules
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'user' && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold mb-6">User & Security Policies</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-background border border-white/10 rounded-xl hover:border-white/20 transition-colors">
                  <div>
                    <h3 className="font-medium text-white mb-1">Public Registration</h3>
                    <p className="text-sm text-gray-400">Allow users to register new accounts in the app</p>
                  </div>
                  <div className="w-12 h-6 bg-primary rounded-full relative cursor-pointer shadow-inner">
                    <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Email SMTP Configuration</h2>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-400">Status: {smtp.emailEnabled ? '✅ Enabled' : '❌ Disabled'}</span>
                  <button 
                    onClick={() => setSmtp({...smtp, emailEnabled: !smtp.emailEnabled})}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      smtp.emailEnabled ? "bg-primary" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all",
                      smtp.emailEnabled ? "right-1" : "left-1"
                    )}></div>
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Host</label>
                    <input 
                      type="text" 
                      value={smtp.smtpHost} 
                      onChange={e => setSmtp({...smtp, smtpHost: e.target.value})}
                      placeholder="e.g. smtp.gmail.com"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Port</label>
                    <input 
                      type="number" 
                      value={smtp.smtpPort} 
                      onChange={e => setSmtp({...smtp, smtpPort: parseInt(e.target.value) || 0})}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SSL / TLS</label>
                    <div className="flex items-center gap-4 mt-2">
                       <label className="flex items-center gap-2 cursor-pointer">
                          <input type="checkbox" checked={smtp.enableSsl} onChange={e => setSmtp({...smtp, enableSsl: e.target.checked})} className="w-5 h-5 rounded border-white/10 bg-background text-primary" />
                          <span className="text-sm text-gray-300">Enable SSL/TLS</span>
                       </label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Username</label>
                    <input 
                      type="text" 
                      value={smtp.smtpUsername} 
                      onChange={e => setSmtp({...smtp, smtpUsername: e.target.value})}
                      placeholder="your-email@gmail.com"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">SMTP Password</label>
                    <input 
                      type="password" 
                      value={smtp.smtpPassword} 
                      onChange={e => setSmtp({...smtp, smtpPassword: e.target.value})}
                      placeholder="••••••••"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">From Email</label>
                    <input 
                      type="email" 
                      value={smtp.fromEmail} 
                      onChange={e => setSmtp({...smtp, fromEmail: e.target.value})}
                      placeholder="noreply@yourdomain.com"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">From Name</label>
                    <input 
                      type="text" 
                      value={smtp.fromName} 
                      onChange={e => setSmtp({...smtp, fromName: e.target.value})}
                      placeholder="Movie Reservation"
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors" 
                    />
                  </div>

                  <div className="md:col-span-2 pt-6 border-t border-white/5 space-y-8">
                    {/* Welcome Email Template */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Mail className="w-5 h-5 text-primary" />
                        Welcome Email Template
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                          <input 
                            type="text" 
                            value={smtp.welcomeEmailSubject || ''} 
                            onChange={e => setSmtp({...smtp, welcomeEmailSubject: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">HTML Template</label>
                          <textarea 
                            rows={8}
                            value={smtp.welcomeEmailTemplate || ''} 
                            onChange={e => setSmtp({...smtp, welcomeEmailTemplate: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-xs font-monospace text-gray-300 focus:border-primary focus:outline-none" 
                          />
                          <p className="text-[10px] text-gray-500 mt-1">Placeholders: {"{{name}}, {{email}}, {{password}}"}</p>
                        </div>
                      </div>
                    </div>

                    {/* Booking Email Template */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Mail className="w-5 h-5 text-green-500" />
                        Booking Confirmation Template
                      </h3>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">Subject</label>
                          <input 
                            type="text" 
                            value={smtp.bookingEmailSubject || ''} 
                            onChange={e => setSmtp({...smtp, bookingEmailSubject: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none" 
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-1">HTML Template</label>
                          <textarea 
                            rows={12}
                            value={smtp.bookingEmailTemplate || ''} 
                            onChange={e => setSmtp({...smtp, bookingEmailTemplate: e.target.value})}
                            className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-xs font-monospace text-gray-300 focus:border-primary focus:outline-none" 
                          />
                          <p className="text-[10px] text-gray-500 mt-1">Placeholders: {"{{customerName}}, {{movieTitle}}, {{cinemaName}}, {{screen}}, {{date}}, {{time}}, {{seats}}, {{totalPrice}}, {{bookingId}}"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="md:col-span-2 pt-6 flex flex-wrap gap-4 border-t border-white/5">
                    <button 
                      onClick={handleSaveEmail}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      Save All Settings
                    </button>
                    <button 
                      onClick={handleTestEmail}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-medium transition-colors disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                      Send Test Email
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

