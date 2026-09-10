import React from 'react';
import { 
  Sprout, 
  Volume2, 
  ArrowRight,
  ShoppingBag,
  Building2,
  Wheat,
  ShieldCheck
} from 'lucide-react';
import { UserRole } from '../types';
import { speakRoleDescription } from '../utils/speech';

interface RoleSelectionScreenProps {
  onSelectRole: (role: UserRole) => void;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
}

export const RoleSelectionScreen: React.FC<RoleSelectionScreenProps> = ({
  onSelectRole,
  onStartSpeech,
  onEndSpeech,
}) => {
  const handleSpeakRole = (e: React.MouseEvent, roleName: string, description: string) => {
    e.stopPropagation();
    speakRoleDescription(roleName, description, 'en', onStartSpeech, onEndSpeech);
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-stone-50 py-10 sm:py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto w-full">
        
        {/* Header Section with Farm2Door AI Logo */}
        <div className="text-center max-w-2xl mx-auto">
          {/* Farm2Door AI Logo */}
          <div className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-lg shadow-emerald-700/20">
              <Sprout className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="text-left">
              <span className="text-2xl font-black tracking-tight text-stone-900 font-display block leading-none">
                Farm2Door AI
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                Direct Agricultural Network
              </span>
            </div>
          </div>

          {/* Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-stone-900 font-display tracking-tight leading-tight">
            From Farms Directly to Your Doorstep
          </h1>

          {/* Short description */}
          <p className="mt-3 text-base sm:text-lg text-stone-600 font-medium">
            Connecting farmers directly with buyers.
          </p>

          {/* Question */}
          <p className="mt-10 sm:mt-12 text-base sm:text-lg font-bold text-stone-800 tracking-wide">
            Select your role to Login or Sign Up:
          </p>
        </div>

        {/* 3 Large Clean Role Cards: Farmer, Customer, Admin */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          
          {/* Card 1: Farmer / FPO */}
          <div
            id="role-card-farmer"
            onClick={() => onSelectRole('farmer')}
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 hover:border-emerald-600 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Header with Icon and Speaker Button */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  <Wheat className="w-8 h-8 text-emerald-700" />
                </div>

                <button
                  id="role-speaker-farmer"
                  onClick={(e) =>
                    handleSpeakRole(
                      e,
                      'Farmer and FPO',
                      'Sell your agricultural products directly. New registrations require Admin approval.'
                    )
                  }
                  title="Hear description aloud"
                  aria-label="Hear Farmer role description aloud"
                  className="w-11 h-11 rounded-2xl bg-stone-50 hover:bg-emerald-50 text-stone-600 hover:text-emerald-700 border border-stone-200 hover:border-emerald-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  Farmer / FPO
                </h2>
                <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Seller
                </span>
              </div>

              {/* Short description */}
              <p className="text-stone-600 text-sm sm:text-base font-medium mt-2 mb-6">
                Sell your agricultural products directly. (New accounts verified by Admin).
              </p>
            </div>

            {/* Action button */}
            <div className="w-full py-3.5 px-4 rounded-xl bg-emerald-700 group-hover:bg-emerald-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors">
              <span>Continue as Farmer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Customer */}
          <div
            id="role-card-consumer"
            onClick={() => onSelectRole('consumer')}
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 hover:border-amber-500 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer"
          >
            <div>
              {/* Header with Icon and Speaker Button */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-700 border border-amber-100 flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-8 h-8 text-amber-700" />
                </div>

                <button
                  id="role-speaker-customer"
                  onClick={(e) =>
                    handleSpeakRole(
                      e,
                      'Customer',
                      'Buy fresh products directly from farmers. Register and login normally.'
                    )
                  }
                  title="Hear description aloud"
                  aria-label="Hear Customer role description aloud"
                  className="w-11 h-11 rounded-2xl bg-stone-50 hover:bg-amber-50 text-stone-600 hover:text-amber-700 border border-stone-200 hover:border-amber-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  Customer
                </h2>
                <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                  Buyer
                </span>
              </div>

              {/* Short description */}
              <p className="text-stone-600 text-sm sm:text-base font-medium mt-2 mb-6">
                Buy fresh produce directly from farmers. Register and login normally.
              </p>
            </div>

            {/* Action button */}
            <div className="w-full py-3.5 px-4 rounded-xl bg-stone-900 group-hover:bg-stone-800 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors">
              <span>Continue as Customer</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Admin */}
          <div
            id="role-card-admin"
            onClick={() => onSelectRole('admin')}
            className="group bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 hover:border-purple-600 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col justify-between cursor-pointer ring-1 ring-purple-100"
          >
            <div>
              {/* Header with Icon and Speaker Button */}
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-700 border border-purple-100 flex items-center justify-center text-3xl shadow-xs group-hover:scale-105 transition-transform">
                  <ShieldCheck className="w-8 h-8 text-purple-700" />
                </div>

                <button
                  id="role-speaker-admin"
                  onClick={(e) =>
                    handleSpeakRole(
                      e,
                      'Admin',
                      'Administrator portal. Approve new farmers and manage platform permissions.'
                    )
                  }
                  title="Hear description aloud"
                  aria-label="Hear Admin role description aloud"
                  className="w-11 h-11 rounded-2xl bg-stone-50 hover:bg-purple-50 text-stone-600 hover:text-purple-700 border border-stone-200 hover:border-purple-200 flex items-center justify-center transition-all cursor-pointer"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {/* Title */}
              <div className="flex items-center justify-between">
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  Admin
                </h2>
                <span className="text-2xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800">
                  Predefined
                </span>
              </div>

              {/* Short description */}
              <p className="text-stone-600 text-sm sm:text-base font-medium mt-2 mb-6">
                Approve newly registered farmers and manage platform permissions.
              </p>
            </div>

            {/* Action button */}
            <div className="w-full py-3.5 px-4 rounded-xl bg-purple-800 group-hover:bg-purple-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-xs transition-colors">
              <span>Continue as Admin</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

        </div>

        {/* Secondary: Bulk Buyer portal link */}
        <div className="mt-8 text-center">
          <button
            id="role-card-bulk-buyer"
            onClick={() => onSelectRole('bulk_buyer')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-stone-600 hover:text-teal-800 bg-white hover:bg-teal-50 px-5 py-2.5 rounded-2xl border border-stone-200 hover:border-teal-300 transition-all shadow-2xs cursor-pointer"
          >
            <Building2 className="w-4 h-4 text-teal-700" />
            <span>Looking for Institutional Procurement? Continue as Bulk Buyer &rarr;</span>
          </button>
        </div>

      </div>

      {/* Minimal Footer */}
      <footer className="mt-12 text-center text-xs text-stone-500 font-medium">
        Farm2Door AI &bull; Connecting farmers directly with buyers &bull; Administrator: naqi
      </footer>
    </div>
  );
};
