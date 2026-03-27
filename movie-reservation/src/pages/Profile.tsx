import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { User, CreditCard, Bell, Settings as SettingsIcon, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PersonalInfo } from '@/components/profile/PersonalInfo';
import { PaymentMethods } from '@/components/profile/PaymentMethods';
import { Notifications } from '@/components/profile/Notifications';
import { Settings } from '@/components/profile/Settings';
import { useAuth } from '@/contexts/AuthContext';

type Tab = 'personal' | 'payment' | 'notifications' | 'settings';

export function Profile() {
  const { logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as Tab) || 'personal';
  
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab') as Tab;
    if (tab && ['personal', 'payment', 'notifications', 'settings'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  const handleTabChange = (tabId: Tab) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
  };

  const tabs = [
    { id: 'personal', icon: User, label: 'Personal Info' },
    { id: 'payment', icon: CreditCard, label: 'Payment Methods' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'settings', icon: SettingsIcon, label: 'Settings' },
  ] as const;

  const renderContent = () => {
    switch (activeTab) {
      case 'personal':
        return <PersonalInfo />;
      case 'payment':
        return <PaymentMethods />;
      case 'notifications':
        return <Notifications />;
      case 'settings':
        return <Settings />;
      default:
        return <PersonalInfo />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-display font-bold mb-8">My Profile</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar */}
        <div className="w-full lg:w-64 shrink-0 space-y-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left",
                activeTab === tab.id 
                  ? "bg-primary/10 text-primary font-medium" 
                  : "text-gray-400 hover:bg-surface hover:text-white"
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
            </button>
          ))}
          
          <div className="pt-8 mt-8 border-t border-white/10">
            <button 
              onClick={logout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-500/10 transition-colors text-left"
            >
              <LogOut className="w-5 h-5" />
              Sign Out
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
