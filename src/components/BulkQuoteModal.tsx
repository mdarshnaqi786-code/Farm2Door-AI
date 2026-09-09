import React, { useState } from 'react';
import { 
  X, 
  Building2, 
  Send, 
  CheckCircle2, 
  Calendar, 
  MapPin, 
  Package, 
  BadgePercent, 
  AlertCircle 
} from 'lucide-react';
import { FarmerProduct, UserAccount, QuantityUnit } from '../types';
import { createBulkQuote } from '../utils/marketplaceStore';

interface BulkQuoteModalProps {
  product: FarmerProduct;
  currentUser: UserAccount | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export const BulkQuoteModal: React.FC<BulkQuoteModalProps> = ({
  product,
  currentUser,
  onClose,
  onSuccess,
}) => {
  const [requiredQty, setRequiredQty] = useState<number>(10);
  const [unit, setUnit] = useState<QuantityUnit>('quintal');
  const [expectedPrice, setExpectedPrice] = useState<number>(
    unit === 'quintal' ? (product.pricePerUnit * 100 * 0.9) : (product.pricePerUnit * 0.9)
  );
  const [deliveryLocation, setDeliveryLocation] = useState(
    'Bengaluru Agro-Logistics Cluster, Hosur Road'
  );
  const [requiredDeliveryDate, setRequiredDeliveryDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 4);
    return d.toISOString().split('T')[0];
  });
  const [additionalRequirements, setAdditionalRequirements] = useState(
    'Grade A sorting, moisture < 12%, ventilated crate packaging, cold transit.'
  );
  const [buyerName, setBuyerName] = useState(currentUser?.fullName || 'Sourcing Officer');
  const [buyerCompany, setBuyerCompany] = useState(currentUser?.fpoOrOrgName || 'Apex Foods Retail');
  const [buyerContact, setBuyerContact] = useState(currentUser?.contact || '+91 98450 99887');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle unit switch
  const handleUnitChange = (newUnit: QuantityUnit) => {
    setUnit(newUnit);
    if (newUnit === 'quintal') {
      setExpectedPrice(Math.round(product.pricePerUnit * 100 * 0.9));
    } else if (newUnit === 'ton') {
      setExpectedPrice(Math.round(product.pricePerUnit * 1000 * 0.88));
    } else {
      setExpectedPrice(Math.round(product.pricePerUnit * 0.92));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (requiredQty <= 0) {
      setError('Please enter a valid quantity greater than 0.');
      return;
    }
    if (expectedPrice <= 0) {
      setError('Please enter a valid expected price.');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      createBulkQuote({
        productId: product.id,
        productName: product.name,
        category: product.category,
        buyerName: buyerName.trim(),
        buyerCompany: buyerCompany.trim(),
        buyerContact: buyerContact.trim(),
        farmerName: product.farmerName,
        farmerId: product.farmerId,
        requiredQty,
        unit,
        expectedPrice,
        deliveryLocation: deliveryLocation.trim(),
        requiredDeliveryDate,
        additionalRequirements: additionalRequirements.trim(),
      });

      setIsSubmitting(false);
      setIsSubmitted(true);
      if (onSuccess) onSuccess();
      setTimeout(() => {
        onClose();
      }, 2400);
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-stone-200 relative animate-fade-in my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-teal-100 text-teal-700 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-black text-stone-900 font-display">Bulk Quote Request Sent!</h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto">
              Your request for <strong className="text-stone-900">{requiredQty} {unit}</strong> of <strong className="text-teal-900">{product.name}</strong> has been transmitted directly to cultivator <strong className="text-emerald-800">{product.farmerName}</strong>.
            </p>
            <div className="p-3 bg-teal-50 rounded-2xl border border-teal-200 text-xs text-teal-900 text-left max-w-sm mx-auto">
              <div><strong>Expected Rate:</strong> ₹{expectedPrice} / {unit}</div>
              <div><strong>Required By:</strong> {requiredDeliveryDate}</div>
              <div><strong>Destination:</strong> {deliveryLocation}</div>
            </div>
          </div>
        ) : (
          <div>
            {/* Header */}
            <div className="flex items-start gap-3.5 pb-4 border-b border-stone-100">
              <div className="w-12 h-12 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-teal-100 text-teal-900 text-[11px] font-bold">
                  <span>🏢 Bulk Procurement Portal</span>
                </div>
                <h3 className="text-xl font-black text-stone-900 font-display mt-1">
                  Request Bulk Quote: {product.name}
                </h3>
                <p className="text-xs text-stone-500">
                  Target Cultivator: <strong className="text-stone-700">{product.farmerName}</strong> ({product.location})
                </p>
              </div>
            </div>

            {/* Current Reference Rate */}
            <div className="mt-4 p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs">
              <span className="text-stone-600 font-medium">Current Retail Unit Price:</span>
              <span className="font-extrabold text-stone-900 text-sm">₹{product.pricePerUnit} / {product.unit}</span>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-semibold border border-red-200">
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              
              {/* Quantity and Unit */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Required Quantity *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={requiredQty}
                    onChange={(e) => setRequiredQty(Math.max(1, Number(e.target.value)))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Quantity Unit *
                  </label>
                  <select
                    value={unit}
                    onChange={(e) => handleUnitChange(e.target.value as QuantityUnit)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm font-bold bg-white"
                  >
                    <option value="quintal">Quintal (100 kg)</option>
                    <option value="ton">Metric Ton (1,000 kg)</option>
                    <option value="kg">Kilogram (kg)</option>
                  </select>
                </div>
              </div>

              {/* Expected Price and Delivery Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Expected Target Price (₹/{unit}) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm font-bold"
                  />
                  <span className="text-[10px] text-stone-500 mt-0.5 block">
                    Total Estimated: ₹{(requiredQty * expectedPrice).toLocaleString('en-IN')}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Required Delivery Date *
                  </label>
                  <input
                    type="date"
                    value={requiredDeliveryDate}
                    onChange={(e) => setRequiredDeliveryDate(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm font-medium bg-white"
                  />
                </div>
              </div>

              {/* Destination Location */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Delivery Location / Warehouse Address *
                </label>
                <input
                  type="text"
                  value={deliveryLocation}
                  onChange={(e) => setDeliveryLocation(e.target.value)}
                  placeholder="e.g. APMC Warehouse Hub, Indiranagar, Bengaluru"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-sm font-medium"
                />
              </div>

              {/* Buyer info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Buyer Name / Representative *
                  </label>
                  <input
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs font-medium"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-stone-700 block mb-1">
                    Company / Organisation *
                  </label>
                  <input
                    type="text"
                    value={buyerCompany}
                    onChange={(e) => setBuyerCompany(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs font-medium"
                  />
                </div>
              </div>

              {/* Additional Requirements */}
              <div>
                <label className="text-xs font-bold text-stone-700 block mb-1">
                  Additional Quality Specifications / Packaging Notes
                </label>
                <textarea
                  rows={2}
                  value={additionalRequirements}
                  onChange={(e) => setAdditionalRequirements(e.target.value)}
                  placeholder="Grading standards, moisture levels, bulk crate preferences, payment terms..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-teal-600 text-xs font-medium"
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
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending Request...' : 'Send Bulk Quote Request'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
