import React, { useState, useEffect } from 'react';
import { Settings, Bookmark, User, Mail, Loader2, Save, Send, Eye, EyeOff, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/services/api';

type TabId = 'general' | 'booking' | 'user' | 'email';

const tabs = [
  { id: 'general', label: 'General System', icon: Settings },
  { id: 'booking', label: 'Booking Rules', icon: Bookmark },
  { id: 'user', label: 'User & Security', icon: User },
  { id: 'email', label: 'Email Configuration', icon: Mail },
] as const;

type ToastType = 'success' | 'error' | 'info';
interface Toast { type: ToastType; message: string }

function InlineToast({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const styles = {
    success: { bg: 'bg-green-500/10 border-green-500/20 text-green-400', Icon: CheckCircle },
    error:   { bg: 'bg-red-500/10 border-red-500/20 text-red-400',       Icon: AlertCircle },
    info:    { bg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',    Icon: Info },
  };
  const { bg, Icon } = styles[toast.type];
  return (
    <div className={cn('flex items-start gap-3 p-4 rounded-xl border text-sm mb-4', bg)}>
      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
      <span className="flex-1">{toast.message}</span>
      <button onClick={onDismiss} className="text-inherit opacity-60 hover:opacity-100 text-lg leading-none">&times;</button>
    </div>
  );
}

export function AdminSettings() {
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('');

  const showToast = (type: ToastType, message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 5000);
  };

  // Email Configuration State
  const [smtp, setSmtp] = useState({
    smtpHost: '',
    smtpPort: 587,
    smtpUsername: '',
    smtpPassword: '',
    fromEmail: '',
    fromName: '',
    enableSsl: true,
    emailEnabled: false,
    welcomeEmailSubject: '',
    welcomeEmailTemplate: '',
    bookingEmailSubject: '',
    bookingEmailTemplate: '',
  });

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
        setSmtp(prev => ({ ...prev, ...data }));
      }
    } catch (err) {
      showToast('error', 'Failed to load email settings. Check the API connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    setSaving(true);
    try {
      await api.put('/settings/email', smtp);
      showToast('success', 'Email settings saved successfully!');
    } catch (err) {
      showToast('error', 'Failed to save settings. Please check your inputs and try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTestEmail = async () => {
    if (!testEmailAddress.trim()) {
      showToast('error', 'Please enter a recipient email address before sending a test.');
      return;
    }
    setSaving(true);
    try {
      await api.post('/settings/email/test', { email: testEmailAddress.trim() });
      showToast('success', `Test email sent to ${testEmailAddress}! Check your inbox (and spam folder).`);
    } catch (err) {
      showToast('error', 'Failed to send test email. Verify your SMTP credentials and that email is Enabled.');
    } finally {
      setSaving(false);
    }
  };

  const fieldClass = "w-full bg-background border border-white/10 rounded-lg px-4 py-2.5 text-white focus:border-primary focus:outline-none transition-colors placeholder:text-gray-600";
  const labelClass = "block text-sm font-medium text-gray-300 mb-2";

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
                    ? "bg-primary/10 text-primary border border-primary/20" 
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
                  <label className={labelClass}>System Name</label>
                  <input type="text" defaultValue="Cinemax Official" className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Support Email</label>
                  <input type="email" defaultValue="support@cinemax.example.com" className={fieldClass} />
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
                  <label className={labelClass}>Max Tickets Per Booking</label>
                  <input type="number" defaultValue="8" className={fieldClass} />
                </div>
                <div>
                  <label className={labelClass}>Seat Hold Timeout (mins)</label>
                  <input type="number" defaultValue="10" className={fieldClass} />
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
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">Email SMTP Configuration</h2>
                  <p className="text-sm text-gray-400 mt-1">Configure the mail server used to send welcome and booking emails.</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn("text-xs font-medium px-2 py-1 rounded-full", smtp.emailEnabled ? "bg-green-500/10 text-green-400 border border-green-500/20" : "bg-white/5 text-gray-400 border border-white/10")}>
                    {smtp.emailEnabled ? 'Active' : 'Inactive'}
                  </span>
                  <button 
                    onClick={() => setSmtp({...smtp, emailEnabled: !smtp.emailEnabled})}
                    className={cn(
                      "w-12 h-6 rounded-full relative transition-colors",
                      smtp.emailEnabled ? "bg-primary" : "bg-white/10"
                    )}
                  >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow",
                      smtp.emailEnabled ? "right-1" : "left-1"
                    )}></div>
                  </button>
                </div>
              </div>

              {/* Inline Toast */}
              {toast && <InlineToast toast={toast} onDismiss={() => setToast(null)} />}

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : (
                <div className="space-y-8">
                  {/* SMTP Server Settings */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Server Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="md:col-span-2">
                        <label className={labelClass}>SMTP Host</label>
                        <input 
                          type="text" 
                          value={smtp.smtpHost} 
                          onChange={e => setSmtp({...smtp, smtpHost: e.target.value})}
                          placeholder="smtp.gmail.com"
                          className={fieldClass} 
                        />
                      </div>
                      <div>
                        <label className={labelClass}>SMTP Port</label>
                        <input 
                          type="number" 
                          value={smtp.smtpPort} 
                          onChange={e => setSmtp({...smtp, smtpPort: parseInt(e.target.value) || 0})}
                          className={fieldClass} 
                        />
                      </div>
                      <div className="flex items-end pb-1">
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <div 
                            onClick={() => setSmtp({...smtp, enableSsl: !smtp.enableSsl})}
                            className={cn("w-10 h-5 rounded-full relative transition-colors cursor-pointer", smtp.enableSsl ? "bg-primary" : "bg-white/10")}
                          >
                            <div className={cn("absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all shadow", smtp.enableSsl ? "right-0.5" : "left-0.5")}></div>
                          </div>
                          <span className="text-sm text-gray-300">Enable SSL / TLS</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* Auth Credentials */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Authentication</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>SMTP Username</label>
                        <input 
                          type="text" 
                          value={smtp.smtpUsername} 
                          onChange={e => setSmtp({...smtp, smtpUsername: e.target.value})}
                          placeholder="your-email@gmail.com"
                          className={fieldClass} 
                        />
                      </div>
                      <div>
                        <label className={labelClass}>SMTP Password</label>
                        <div className="relative">
                          <input 
                            type={showSmtpPassword ? 'text' : 'password'}
                            value={smtp.smtpPassword} 
                            onChange={e => setSmtp({...smtp, smtpPassword: e.target.value})}
                            placeholder="App password (16 chars)"
                            className={cn(fieldClass, 'pr-10')} 
                          />
                          <button
                            type="button"
                            onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-300 transition-colors"
                          >
                            {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">For Gmail, use an App Password, not your regular password.</p>
                      </div>
                      <div>
                        <label className={labelClass}>From Email</label>
                        <input 
                          type="email" 
                          value={smtp.fromEmail} 
                          onChange={e => setSmtp({...smtp, fromEmail: e.target.value})}
                          placeholder="noreply@yourdomain.com"
                          className={fieldClass} 
                        />
                      </div>
                      <div>
                        <label className={labelClass}>From Name</label>
                        <input 
                          type="text" 
                          value={smtp.fromName} 
                          onChange={e => setSmtp({...smtp, fromName: e.target.value})}
                          placeholder="Cinemax"
                          className={fieldClass} 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Email Templates */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Email Templates</h3>
                    <div className="space-y-6">
                      {/* Welcome Email */}
                      <div className="p-5 bg-background rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-primary"></div>
                          <h4 className="font-semibold text-white">Welcome Email</h4>
                          <span className="text-xs text-gray-500 ml-auto">Sent on registration</span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Subject</label>
                          <input 
                            type="text" 
                            value={smtp.welcomeEmailSubject} 
                            onChange={e => setSmtp({...smtp, welcomeEmailSubject: e.target.value})}
                            className={fieldClass} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">HTML Template</label>
                          <textarea 
                            rows={6}
                            value={smtp.welcomeEmailTemplate} 
                            onChange={e => setSmtp({...smtp, welcomeEmailTemplate: e.target.value})}
                            className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-gray-300 focus:border-primary focus:outline-none resize-y transition-colors" 
                          />
                          <p className="text-[10px] text-gray-600 mt-1">Available: <code className="text-primary/70">{"{{name}}, {{email}}, {{password}}"}</code></p>
                        </div>
                      </div>

                      {/* Booking Email */}
                      <div className="p-5 bg-background rounded-xl border border-white/10 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-2 h-2 rounded-full bg-green-500"></div>
                          <h4 className="font-semibold text-white">Booking Confirmation Email</h4>
                          <span className="text-xs text-gray-500 ml-auto">Sent on booking</span>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">Subject</label>
                          <input 
                            type="text" 
                            value={smtp.bookingEmailSubject} 
                            onChange={e => setSmtp({...smtp, bookingEmailSubject: e.target.value})}
                            className={fieldClass} 
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-400 mb-1">HTML Template</label>
                          <textarea 
                            rows={8}
                            value={smtp.bookingEmailTemplate} 
                            onChange={e => setSmtp({...smtp, bookingEmailTemplate: e.target.value})}
                            className="w-full bg-surface border border-white/10 rounded-lg px-4 py-2 text-xs font-mono text-gray-300 focus:border-primary focus:outline-none resize-y transition-colors" 
                          />
                          <p className="text-[10px] text-gray-600 mt-1">Available: <code className="text-green-500/70">{"{{customerName}}, {{movieTitle}}, {{cinemaName}}, {{screen}}, {{date}}, {{time}}, {{seats}}, {{totalPrice}}, {{bookingId}}"}</code></p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Test Email */}
                  <div className="p-5 bg-background rounded-xl border border-white/10">
                    <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Send Test Email</h3>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={testEmailAddress}
                        onChange={e => setTestEmailAddress(e.target.value)}
                        placeholder="recipient@example.com"
                        className={cn(fieldClass, 'flex-1')}
                      />
                      <button 
                        onClick={handleTestEmail}
                        disabled={saving}
                        className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-lg font-medium transition-colors disabled:opacity-50 whitespace-nowrap"
                      >
                        <Send className="w-4 h-4" />
                        Send Test
                      </button>
                    </div>
                    <p className="text-xs text-gray-600 mt-2">Before testing, make sure you have saved your SMTP settings and Email is Enabled.</p>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2 border-t border-white/5">
                    <button 
                      onClick={handleSaveEmail}
                      disabled={saving}
                      className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-xl font-medium transition-colors shadow-lg shadow-primary/20 disabled:opacity-50"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving ? 'Saving...' : 'Save All Settings'}
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
