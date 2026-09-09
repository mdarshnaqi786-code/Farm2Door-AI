import React, { useState } from 'react';
import { 
  Building2, 
  Sparkles, 
  Calendar, 
  Package, 
  MapPin, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  PhoneCall, 
  Send, 
  TrendingDown,
  Clock,
  Search,
  Check
} from 'lucide-react';
import { FPOMatch } from '../types';
import { MOCK_FPO_MATCHES } from '../data/mockData';

export const BulkBuyerDashboard: React.FC = () => {
  const [selectedCommodity, setSelectedCommodity] = useState('Tomato');
  const [quantity, setQuantity] = useState(25); // in Quintals (1 Quintal = 100 kg)
  const [deliveryDate, setDeliveryDate] = useState('2026-09-15');
  const [qualityGrade, setQualityGrade] = useState('Grade A');
  const [location, setLocation] = useState('Bengaluru Metro Agro-Warehouse Hub');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedNotice, setSubmittedNotice] = useState<string | null>(null);
  const [matchedFPOs, setMatchedFPOs] = useState<FPOMatch[]>(MOCK_FPO_MATCHES);
  const [contactedFPO, setContactedFPO] = useState<string | null>(null);

  const handleSubmitRequirement = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedNotice(
        `AI Smart Matching successful! 3 verified FPOs found with ${quantity} Quintals capacity for ${selectedCommodity}.`
      );
      // Re-filter/rank based on commodity
      const dynamicMatches = MOCK_FPO_MATCHES.map((fpo) => ({
        ...fpo,
        quotedPricePerQuintal:
          selectedCommodity === 'Tomato' ? 3200 : selectedCommodity === 'Onion' ? 2750 : 2300,
      }));
      setMatchedFPOs(dynamicMatches);
    }, 700);
  };

  const handleContact = (fpoName: string) => {
    setContactedFPO(fpoName);
    setTimeout(() => {
      setContactedFPO(null);
    }, 3000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-900 rounded-3xl p-6 sm:p-10 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-800/80 text-teal-200 text-xs font-bold mb-3">
            <Building2 className="w-3.5 h-3.5 text-teal-300" />
            <span>Institutional Procurement Portal</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display leading-tight">
            Bulk Buyer & FPO Sourcing Hub
          </h1>
          <p className="mt-2 text-teal-100 text-sm sm:text-base leading-relaxed">
            Source quintals and metric tons directly from Farmer Producer Organizations (FPOs) and agricultural clusters. Complete traceability, verified cold transit, and competitive transparent farm-gate rates.
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shrink-0 space-y-2 text-center sm:text-left">
          <div className="text-xs text-teal-200 font-medium">Platform Aggregate Capacity</div>
          <div className="text-2xl font-black text-white font-display">4,850+ Quintals</div>
          <div className="text-xs text-teal-300 flex items-center justify-center sm:justify-start gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>120+ Certified FPOs Online</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Requirement Form on Left, Matching Results on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Bulk Requirement Form (5 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm space-y-6">
          <div className="flex items-center gap-2.5 pb-4 border-b border-stone-200">
            <Package className="w-6 h-6 text-teal-800" />
            <div>
              <h2 className="text-xl font-bold text-stone-900 font-display">Submit Bulk Requirement</h2>
              <p className="text-xs text-stone-500">Post contract demands for smart matching</p>
            </div>
          </div>

          <form onSubmit={handleSubmitRequirement} className="space-y-4">
            
            {/* Commodity Selector */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Select Agricultural Commodity
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['Tomato', 'Onion', 'Potato'].map((crop) => (
                  <button
                    key={crop}
                    type="button"
                    onClick={() => setSelectedCommodity(crop)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-extrabold border transition-all cursor-pointer ${
                      selectedCommodity === crop
                        ? 'bg-teal-800 text-white border-teal-800 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {crop === 'Tomato' && '🍅 Tomato'}
                    {crop === 'Onion' && '🧅 Onion'}
                    {crop === 'Potato' && '🥔 Potato'}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity in Quintals */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex justify-between">
                <span>Required Quantity (Quintals)</span>
                <span className="text-teal-800 font-black">{quantity} Quintals = {(quantity * 100).toLocaleString()} kg</span>
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="5"
                  max="150"
                  step="5"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="flex-1 accent-teal-800 cursor-pointer"
                />
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-20 p-2 text-center text-sm font-bold border border-stone-200 rounded-xl bg-stone-50"
                />
              </div>
            </div>

            {/* Preferred Delivery Date */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-teal-800" />
                <span>Preferred Delivery Date</span>
              </label>
              <input
                type="date"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* Quality Grade */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Quality Grade
              </label>
              <select
                value={qualityGrade}
                onChange={(e) => setQualityGrade(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 cursor-pointer"
              >
                <option value="Grade A">Grade A (Table Fresh Retail)</option>
                <option value="Processing Grade">Processing Grade (Chips / Puree / Sauce)</option>
                <option value="Organic Certified">Organic Certified (Zero Chemical residue)</option>
              </select>
            </div>

            {/* Delivery Destination */}
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-800" />
                <span>Delivery Hub / Warehouse Location</span>
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full p-2.5 text-xs font-semibold border border-stone-200 rounded-xl bg-stone-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-teal-200" />
              <span>{isSubmitting ? 'Matching with FPOs...' : 'Submit Bulk Requirement & Match'}</span>
            </button>
          </form>

          {submittedNotice && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-4 text-xs font-semibold text-teal-900 flex items-start gap-2 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
              <span>{submittedNotice}</span>
            </div>
          )}
        </div>

        {/* Smart Matching Section (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-teal-700" />
                <h2 className="text-xl sm:text-2xl font-black text-stone-900 font-display">
                  AI Smart Matching: Suitable Farmers & FPOs
                </h2>
              </div>
              <p className="text-xs text-stone-500 mt-0.5">
                Ranked by volume availability, proximity, quality rating, and price fit
              </p>
            </div>

            <div className="text-xs font-bold text-teal-800 bg-teal-50 px-3 py-1.5 rounded-xl border border-teal-200 self-start sm:self-auto">
              3 Verified Clusters Ready
            </div>
          </div>

          {contactedFPO && (
            <div className="bg-emerald-100 border border-emerald-300 text-emerald-900 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fade-in">
              <Check className="w-4 h-4" />
              <span>Direct RFQ request sent to {contactedFPO}. FPO Lead will connect via phone within 15 minutes!</span>
            </div>
          )}

          {/* Matches List */}
          <div className="space-y-4">
            {matchedFPOs.map((fpo) => (
              <div
                key={fpo.id}
                id={`fpo-card-${fpo.id}`}
                className="bg-white rounded-3xl p-6 border border-stone-200 hover:border-teal-600 shadow-xs hover:shadow-lg transition-all duration-200"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="bg-teal-700 text-white text-[11px] font-extrabold px-2.5 py-0.5 rounded-md">
                        {fpo.matchScore}% Match
                      </span>
                      {fpo.verified && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" /> Verified FPO
                        </span>
                      )}
                    </div>

                    <h3 className="text-lg font-black text-stone-900 font-display mt-2">
                      {fpo.name}
                    </h3>
                    
                    <div className="flex flex-wrap items-center gap-3 text-xs text-stone-500 mt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        {fpo.location}, {fpo.state} ({fpo.distanceKm} km away)
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-stone-400" />
                        {fpo.memberFarmers} Cultivator Members
                      </span>
                    </div>
                  </div>

                  <div className="sm:text-right bg-stone-50 sm:bg-transparent p-3 sm:p-0 rounded-xl">
                    <div className="text-xs text-stone-500 font-medium">Indicative Farm-Gate Rate</div>
                    <div className="text-xl font-black text-teal-900 font-display">
                      ₹{fpo.quotedPricePerQuintal.toLocaleString()}
                      <span className="text-xs text-stone-500 font-normal"> / Quintal</span>
                    </div>
                    <div className="text-[11px] font-bold text-emerald-800">
                      (₹{(fpo.quotedPricePerQuintal / 100).toFixed(1)} / kg)
                    </div>
                  </div>
                </div>

                {/* Capacity & Lead Specs */}
                <div className="mt-4 pt-4 border-t border-stone-100 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                    <span className="text-stone-500 block text-[10px]">Available Volume</span>
                    <span className="font-extrabold text-stone-900 text-sm">
                      {fpo.availableVolumeQuintals} Quintals
                    </span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60">
                    <span className="text-stone-500 block text-[10px]">Quality Rating</span>
                    <span className="font-extrabold text-amber-600 text-sm">
                      ★ {fpo.qualityRating} / 5.0
                    </span>
                  </div>
                  <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/60 col-span-2 sm:col-span-1">
                    <span className="text-stone-500 block text-[10px]">Coordinator</span>
                    <span className="font-extrabold text-stone-900 text-xs truncate block">
                      {fpo.contactPerson}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex flex-wrap items-center justify-end gap-2.5">
                  <button
                    onClick={() => handleContact(fpo.name)}
                    className="py-2 px-4 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PhoneCall className="w-3.5 h-3.5 text-stone-600" />
                    <span>Call FPO Lead</span>
                  </button>
                  <button
                    onClick={() => handleContact(fpo.name)}
                    className="py-2 px-4 rounded-xl bg-teal-800 hover:bg-teal-900 text-white text-xs font-bold flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5 text-teal-200" />
                    <span>Request Formal Quote ({quantity} Q)</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
};
