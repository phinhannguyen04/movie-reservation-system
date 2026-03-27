import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, Plus, Trash2, X, CheckCircle2, Star } from 'lucide-react';

const initialMethods = [
  {
    id: 1,
    type: 'Visa',
    last4: '4242',
    expiry: '12/28',
    isDefault: true
  },
  {
    id: 2,
    type: 'Mastercard',
    last4: '8888',
    expiry: '08/26',
    isDefault: false
  }
];

export function PaymentMethods() {
  const [methods, setMethods] = useState(initialMethods);
  const [showAddModal, setShowAddModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // Add Card Form State
  const [newCard, setNewCard] = useState({
    number: '',
    name: '',
    expiry: '',
    cvc: ''
  });

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation & formatting mock
    const last4 = newCard.number.slice(-4) || '1234';
    const type = newCard.number.startsWith('4') ? 'Visa' : 'Mastercard';
    
    const newMethod = {
      id: Date.now(),
      type,
      last4,
      expiry: newCard.expiry || '12/30',
      isDefault: methods.length === 0 // Make default if it's the first card
    };

    setMethods([...methods, newMethod]);
    setShowAddModal(false);
    setNewCard({ number: '', name: '', expiry: '', cvc: '' });
    showToast('Payment method added successfully.');
  };

  const handleDelete = (id: number) => {
    const updatedMethods = methods.filter(m => m.id !== id);
    // If we deleted the default card, make the first remaining card default
    if (methods.find(m => m.id === id)?.isDefault && updatedMethods.length > 0) {
      updatedMethods[0].isDefault = true;
    }
    setMethods(updatedMethods);
    showToast('Payment method removed.');
  };

  const handleSetDefault = (id: number) => {
    setMethods(methods.map(m => ({
      ...m,
      isDefault: m.id === id
    })));
    showToast('Default payment method updated.');
  };

  return (
    <div className="relative">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-surface rounded-2xl p-8 border border-white/5"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold mb-1">Payment Methods</h2>
            <p className="text-gray-400 text-sm">Manage your saved cards and payment options.</p>
          </div>
          <button 
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-primary hover:bg-primary-hover text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Add Card
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {methods.length > 0 ? (
              methods.map((method) => (
                <motion.div 
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                  key={method.id} 
                  className={`p-6 rounded-xl border relative overflow-hidden group transition-colors ${
                    method.isDefault ? 'border-primary/50 bg-primary/5' : 'border-white/10 bg-background/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-8 relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-8 bg-white/10 rounded flex items-center justify-center">
                        <CreditCard className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{method.type}</p>
                        <p className="text-sm text-gray-400">**** **** **** {method.last4}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {!method.isDefault && (
                        <button 
                          onClick={() => handleSetDefault(method.id)}
                          className="p-2 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-lg transition-colors"
                          title="Set as default"
                        >
                          <Star className="w-4 h-4" />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(method.id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                        title="Remove card"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between relative z-10">
                    <div>
                      <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Expires</p>
                      <p className="text-sm font-medium">{method.expiry}</p>
                    </div>
                    {method.isDefault && (
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs font-medium rounded flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Default
                      </span>
                    )}
                  </div>

                  {/* Decorative background element */}
                  <div className={`absolute -right-12 -bottom-12 w-40 h-40 rounded-full blur-2xl pointer-events-none ${
                    method.isDefault ? 'bg-primary/10' : 'bg-white/5'
                  }`} />
                </motion.div>
              ))
            ) : (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="col-span-1 md:col-span-2 text-center py-12 bg-background/50 rounded-xl border border-white/5"
              >
                <div className="w-16 h-16 bg-surface-light rounded-full flex items-center justify-center mx-auto mb-4">
                  <CreditCard className="w-8 h-8 text-gray-500" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">No payment methods</h3>
                <p className="text-gray-400 text-sm mb-6">
                  Add a credit or debit card to make booking tickets faster.
                </p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition-colors inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add New Card
                </button>
              </motion.div>
            )}
          </AnimatePresence>
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

      {/* Add Card Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-surface border border-white/10 rounded-2xl w-full max-w-md overflow-hidden"
            >
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  Add Payment Method
                </h3>
                <button 
                  onClick={() => setShowAddModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddCard} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Card Number</label>
                  <input 
                    type="text" 
                    required
                    maxLength={19}
                    placeholder="0000 0000 0000 0000"
                    value={newCard.number}
                    onChange={e => {
                      // Basic formatting for card number
                      const val = e.target.value.replace(/\D/g, '');
                      const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
                      setNewCard({...newCard, number: formatted});
                    }}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors font-mono"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Name on Card</label>
                  <input 
                    type="text" 
                    required
                    placeholder="JOHN DOE"
                    value={newCard.name}
                    onChange={e => setNewCard({...newCard, name: e.target.value.toUpperCase()})}
                    className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors uppercase"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      required
                      placeholder="MM/YY"
                      maxLength={5}
                      value={newCard.expiry}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.length >= 2) {
                          val = val.slice(0, 2) + '/' + val.slice(2, 4);
                        }
                        setNewCard({...newCard, expiry: val});
                      }}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">CVC</label>
                    <input 
                      type="text" 
                      required
                      placeholder="123"
                      maxLength={4}
                      value={newCard.cvc}
                      onChange={e => setNewCard({...newCard, cvc: e.target.value.replace(/\D/g, '')})}
                      className="w-full bg-background border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-primary transition-colors font-mono"
                    />
                  </div>
                </div>
                
                <div className="pt-4 flex justify-end gap-3">
                  <button 
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-sm font-medium rounded-lg transition-colors"
                  >
                    Save Card
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
