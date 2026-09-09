import React from 'react';
import { 
  X, 
  User, 
  Phone, 
  Mail, 
  ShieldCheck, 
  Languages, 
  Calendar, 
  LogOut, 
  Building2, 
  MapPin, 
  Wheat, 
  ShoppingBag,
  Clock
} from 'lucide-react';
import { UserAccount, SupportedLanguage } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';

interface UserProfileModalProps {
  user: UserAccount;
  onClose: () => void;
  onLogout: () => void;
  onOpenLanguageSelector: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  user,
  onClose,
  onLogout,
  onOpenLanguageSelector,
}) => {
  const currentLangObj =
    INDIAN_LANGUAGES.find((l) => l.code === user.language) || INDIAN_LANGUAGES[0];

  const roleDetails = {
    farmer: {
      roleTitle: 'Farmer / FPO Member',
      icon: <Wheat className="w-6 h-6 text-emerald-700" />,
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      orgLabel: 'FPO Collective',
      orgVal: user.fpoOrOrgName || 'Sahyadri Kisan Producer Co.',
      location: 'Nashik Agro-Cluster, Maharashtra',
      highlight: 'Direct Farm-Gate Payout: 78%+ straight to your bank account with zero middleman commissions.',
    },
    consumer: {
      roleTitle: 'Customer (Farm Retail Direct)',
      icon: <ShoppingBag className="w-6 h-6 text-amber-700" />,
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      orgLabel: 'Preferred Delivery Hub',
      orgVal: 'Indiranagar Urban Node, Bengaluru',
      location: 'Karnataka, 560038',
      highlight: '100% farm-traceable produce harvested daily with cold-chain electric delivery.',
    },
    bulk_buyer: {
      roleTitle: 'Institutional Bulk Buyer',
      icon: <Building2 className="w-6 h-6 text-teal-700" />,
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      orgLabel: 'Company / Enterprise',
      orgVal: user.fpoOrOrgName || 'Rajan Fresh Foods Ltd.',
      location: 'Bengaluru Metro Agro-Warehouse Hub',
      highlight: 'Direct procurement contracts with verified FPOs at competitive wholesale rates.',
    },
  }[user.role];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-xs animate-fade-in">
      <div 
        id="user-profile-modal"
        className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-stone-200 shadow-2xl space-y-6 relative"
      >
        {/* Close button */}
        <button
          id="close-profile-modal-btn"
          onClick={onClose}
          className="absolute top-6 right-6 w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
          aria-label="Close profile"
        >
          <X className="w-5 h-5" />
        </button>

        {/* User Header */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 border border-stone-200 flex items-center justify-center shadow-inner shrink-0 text-3xl">
            {roleDetails.icon}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${roleDetails.badgeBg}`}>
                {roleDetails.roleTitle}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Verified</span>
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
              {user.fullName}
            </h2>
            <div className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
              <Clock className="w-3.5 h-3.5" />
              <span>Active session</span>
            </div>
          </div>
        </div>

        {/* Details List */}
        <div className="bg-stone-50 rounded-2xl p-4 sm:p-5 border border-stone-200 space-y-3.5 text-sm">
          
          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
            <span className="text-stone-500 font-medium flex items-center gap-2">
              <Phone className="w-4 h-4 text-stone-400" />
              <span>Contact / Identifier</span>
            </span>
            <span className="font-bold text-stone-900">{user.contact}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
            <span className="text-stone-500 font-medium flex items-center gap-2">
              <Building2 className="w-4 h-4 text-stone-400" />
              <span>{roleDetails.orgLabel}</span>
            </span>
            <span className="font-bold text-stone-900">{roleDetails.orgVal}</span>
          </div>

          <div className="flex items-center justify-between pb-3 border-b border-stone-200/80">
            <span className="text-stone-500 font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4 text-stone-400" />
              <span>Location</span>
            </span>
            <span className="font-bold text-stone-900">{roleDetails.location}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-stone-500 font-medium flex items-center gap-2">
              <Languages className="w-4 h-4 text-stone-400" />
              <span>Preferred Language</span>
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenLanguageSelector();
              }}
              className="text-xs font-bold text-emerald-800 bg-emerald-100/70 hover:bg-emerald-200/70 px-2.5 py-1 rounded-lg border border-emerald-300 transition-colors flex items-center gap-1 cursor-pointer"
            >
              <span>{currentLangObj.nameNative} ({currentLangObj.nameEn})</span>
              <span className="text-emerald-700 underline text-[10px]">Change</span>
            </button>
          </div>

        </div>

        {/* Role Highlight */}
        <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 font-medium leading-relaxed">
          💡 <span className="font-bold">Platform Direct Guarantee:</span> {roleDetails.highlight}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-2 border-t border-stone-100 gap-3">
          <button
            id="profile-logout-btn"
            onClick={() => {
              onClose();
              onLogout();
            }}
            className="px-4 py-2.5 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs sm:text-sm flex items-center gap-2 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>

          <button
            id="profile-close-btn"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
