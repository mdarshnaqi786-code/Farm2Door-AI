import React, { useState } from 'react';
import { 
  X, 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  User, 
  MapPin, 
  Sprout, 
  Sparkles 
} from 'lucide-react';
import { FarmerProduct, UserAccount } from '../types';
import { createFarmerEnquiry } from '../utils/marketplaceStore';

interface ProductEnquiryModalProps {
  product: FarmerProduct;
  currentUser: UserAccount | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ProductEnquiryModal: React.FC<ProductEnquiryModalProps> = ({
  product,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [buyerName, setBuyerName] = useState(currentUser?.fullName || '');
  const [buyerContact, setBuyerContact] = useState(currentUser?.contact || '');
  const [message, setMessage] = useState('');
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quickQuestions = [
    'Is this batch 100% naturally vine-ripened without chemicals?',
    'Can you supply this on a weekly recurring schedule?',
    'What is the minimum quantity you can dispatch directly?',
    'Can you provide custom crate or jute bag packaging?',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setError('Please type your enquiry or select one of the suggested questions.');
      return;
    }
    if (!buyerName.trim()) {
      setError('Please provide your name.');
      return;
    }

    createFarmerEnquiry({
      productId: product.id,
      productName: product.name,
      farmerName: product.farmerName,
      farmerId: product.farmerId,
      buyerName: buyerName.trim(),
      buyerRole: currentUser?.role === 'bulk_buyer' ? 'bulk_buyer' : 'consumer',
      buyerContact: buyerContact.trim() || undefined,
      message: message.trim(),
    });

    setIsSent(true);
    if (onSuccess) onSuccess();
    setTimeout(() => {
      onClose();
    }, 2400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-fade-in">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSent ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 font-display">Enquiry Sent to Farmer!</h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto">
              Your direct query has been delivered to <span className="font-bold text-emerald-800">{product.farmerName}</span>. You will receive notification as soon as the cultivator responds.
            </p>
            <div className="pt-2">
              <span className="text-xs bg-emerald-50 text-emerald-800 font-semibold px-3 py-1.5 rounded-full border border-emerald-200">
                🌾 Direct Farmer Connection &bull; Zero Intermediaries
              </span>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold">
                  <span>🌾 Direct from Farmer</span>
                </div>
                <h3 className="text-xl font-black text-stone-900 font-display mt-1">
                  Ask About {product.name}
                </h3>
                <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-0.5">
                  <User className="w-3.5 h-3.5 text-stone-400" />
                  <span>Cultivator: <strong className="text-stone-700">{product.farmerName}</strong> ({product.location})</span>
                </p>
              </div>
            </div>

            {/* Privacy notice */}
            <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 text-xs text-stone-600 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Contact directly via in-app message. Farmer phone numbers are protected from unsolicited spam.</span>
            </div>

            {/* Quick question chips */}
            <div className="mt-4">
              <label className="text-xs font-bold text-stone-700 block mb-2">
                Quick Suggested Questions:
              </label>
              <div className="flex flex-wrap gap-1.5">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setMessage(q)}
                    className="text-[11px] font-medium bg-stone-100 hover:bg-emerald-50 hover:text-emerald-800 text-stone-700 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-emerald-300 transition-colors text-left cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                  placeholder="e.g. Ramesh / Indiranagar Resident"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Your Phone / Contact (Optional)
                </label>
                <input
                  type="text"
                  value={buyerContact}
                  onChange={(e) => setBuyerContact(e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Your Message to Farmer *
                </label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask about freshness, organic practices, bulk packaging, or dispatch schedules..."
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-sm font-medium"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-stone-600 hover:text-stone-900 font-bold text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Message to Farmer</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
