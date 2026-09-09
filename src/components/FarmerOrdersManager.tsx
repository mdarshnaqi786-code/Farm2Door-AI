import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Building2, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  Truck, 
  Check, 
  User, 
  MapPin, 
  Calendar, 
  MessageSquare, 
  Send, 
  Sparkles,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import { CustomerOrder, BulkQuoteRequest, FarmerEnquiry, OrderStatus, UserAccount, LanguageCode } from '../types';
import { 
  getCustomerOrders, 
  updateOrderStatus, 
  getBulkQuotes, 
  updateBulkQuoteStatus,
  getFarmerEnquiries,
  replyToEnquiry
} from '../utils/marketplaceStore';

interface FarmerOrdersManagerProps {
  farmerName?: string;
  currentUser?: UserAccount | null;
  language?: LanguageCode;
  onStartSpeech?: () => void;
  onEndSpeech?: () => void;
}

export const FarmerOrdersManager: React.FC<FarmerOrdersManagerProps> = ({
  farmerName,
  currentUser,
}) => {
  const effectiveFarmerName = farmerName || currentUser?.name || 'Farmer';
  const [activeTab, setActiveTab] = useState<'customer_orders' | 'bulk_requests' | 'enquiries'>('customer_orders');
  
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [bulkQuotes, setBulkQuotes] = useState<BulkQuoteRequest[]>([]);
  const [enquiries, setEnquiries] = useState<FarmerEnquiry[]>([]);

  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const loadData = () => {
    setCustomerOrders(getCustomerOrders());
    setBulkQuotes(getBulkQuotes());
    setEnquiries(getFarmerEnquiries());
  };

  useEffect(() => {
    loadData();

    const handleUpdate = () => loadData();
    window.addEventListener('farm2door_orders_updated', handleUpdate);
    window.addEventListener('farm2door_bulk_quotes_updated', handleUpdate);
    window.addEventListener('farm2door_enquiries_updated', handleUpdate);

    return () => {
      window.removeEventListener('farm2door_orders_updated', handleUpdate);
      window.removeEventListener('farm2door_bulk_quotes_updated', handleUpdate);
      window.removeEventListener('farm2door_enquiries_updated', handleUpdate);
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleUpdateCustomerOrderStatus = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status);
    loadData();
    showToast(`Order #${orderId} marked as "${status}"`);
  };

  const handleUpdateBulkQuoteStatus = (quoteId: string, status: OrderStatus) => {
    updateBulkQuoteStatus(quoteId, status);
    loadData();
    showToast(`Bulk Quote #${quoteId} marked as "${status}"`);
  };

  const handleSendReply = (enquiryId: string) => {
    const text = replyTextMap[enquiryId];
    if (!text || !text.trim()) return;

    replyToEnquiry(enquiryId, text.trim());
    setReplyTextMap((prev) => ({ ...prev, [enquiryId]: '' }));
    loadData();
    showToast('Reply sent directly to customer!');
  };

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case 'Pending':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-900 border border-amber-300 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Pending</span>
          </span>
        );
      case 'Accepted':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-900 border border-blue-300 flex items-center gap-1">
            <Check className="w-3.5 h-3.5 text-blue-700" />
            <span>Accepted</span>
          </span>
        );
      case 'Ready for Delivery':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-100 text-purple-900 border border-purple-300 flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-purple-700" />
            <span>Ready for Delivery</span>
          </span>
        );
      case 'Delivered':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
            <span>Delivered</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-100 text-rose-900 border border-rose-300 flex items-center gap-1">
            <XCircle className="w-3.5 h-3.5 text-rose-700" />
            <span>Rejected</span>
          </span>
        );
    }
  };

  const pendingCustomerCount = customerOrders.filter((o) => o.status === 'Pending').length;
  const pendingBulkCount = bulkQuotes.filter((q) => q.status === 'Pending').length;
  const unrepliedEnquiriesCount = enquiries.filter((e) => !e.replied).length;

  return (
    <div className="space-y-6">
      
      {/* Toast */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 bg-stone-900 text-white px-5 py-3 rounded-2xl shadow-xl border border-emerald-500 flex items-center gap-3 animate-fade-in">
          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-4 h-4" />
          </div>
          <span className="text-sm font-bold">{toastMsg}</span>
        </div>
      )}

      {/* Header bar */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-bold mb-2">
            <Package className="w-3.5 h-3.5 text-emerald-700" />
            <span>Real-time Order Fulfillment Desk</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-stone-900 font-display">
            Orders & Direct Requests
          </h2>
          <p className="text-stone-600 text-xs sm:text-sm mt-1">
            Manage incoming retail consumer orders, institutional bulk procurement requests, and direct customer messages.
          </p>
        </div>

        {/* Aggregate Stats */}
        <div className="flex items-center gap-3">
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-center min-w-[90px]">
            <span className="text-xs text-stone-500 font-medium block">Total Orders</span>
            <span className="text-xl font-black text-stone-900">{customerOrders.length}</span>
          </div>
          <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 text-center min-w-[90px]">
            <span className="text-xs text-stone-500 font-medium block">Bulk Quotes</span>
            <span className="text-xl font-black text-teal-800">{bulkQuotes.length}</span>
          </div>
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-center min-w-[90px]">
            <span className="text-xs text-emerald-700 font-medium block">Farmer Payout</span>
            <span className="text-xl font-black text-emerald-900">
              ₹{customerOrders.reduce((acc, o) => acc + o.farmerPayout, 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 bg-stone-100 p-1.5 rounded-2xl border border-stone-200">
        <button
          onClick={() => setActiveTab('customer_orders')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'customer_orders'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Package className="w-4 h-4 text-emerald-700" />
          <span>Customer Orders</span>
          {pendingCustomerCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-amber-500 text-stone-950 text-[10px] font-black">
              {pendingCustomerCount} Pending
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('bulk_requests')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'bulk_requests'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <Building2 className="w-4 h-4 text-teal-700" />
          <span>Bulk Buyer Quotes</span>
          {pendingBulkCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-teal-600 text-white text-[10px] font-black">
              {pendingBulkCount} New
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('enquiries')}
          className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
            activeTab === 'enquiries'
              ? 'bg-white text-stone-900 shadow-sm border border-stone-200'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-600" />
          <span>Direct Buyer Enquiries</span>
          {unrepliedEnquiriesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black">
              {unrepliedEnquiriesCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. CUSTOMER ORDERS LIST                                                   */}
      {/* ========================================================================= */}
      {activeTab === 'customer_orders' && (
        <div className="space-y-4">
          {customerOrders.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-2">
              <Package className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-base font-bold text-stone-700">No Customer Orders Yet</h4>
              <p className="text-xs text-stone-500">Orders placed by retail customers will appear here.</p>
            </div>
          ) : (
            customerOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl p-6 border-2 border-stone-200 hover:border-emerald-500 transition-all shadow-xs space-y-5"
              >
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm">
                      #{order.id.slice(-4)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-stone-900 font-display">
                          Order {order.id}
                        </h4>
                        <span className="text-xs text-stone-500">({order.date})</span>
                      </div>
                      <p className="text-xs text-stone-600 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-stone-400" />
                        <span>Customer: <strong className="text-stone-800">{order.customerName}</strong> {order.customerPhone ? `(${order.customerPhone})` : ''}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(order.status)}
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">Farmer Payout</span>
                      <span className="text-base font-black text-emerald-800">
                        ₹{order.farmerPayout}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Items Ordered */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-stone-700 uppercase tracking-wider block">
                    Produce Ordered:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2.5">
                          {item.image && (
                            <img
                              src={item.image}
                              alt={item.productName}
                              className="w-9 h-9 rounded-lg object-cover"
                              referrerPolicy="no-referrer"
                            />
                          )}
                          <div>
                            <div className="font-bold text-stone-900">{item.productName}</div>
                            <div className="text-stone-500 text-[11px]">{item.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className="font-extrabold text-stone-900 text-sm">
                            {item.quantity} {item.unit}
                          </span>
                          <span className="text-stone-500 text-[10px] block">
                            @ ₹{item.pricePerUnit}/{item.unit}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Address */}
                <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200/80 flex items-center gap-2 text-xs text-stone-600">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>Destination: <strong className="text-stone-800">{order.deliveryAddress}</strong></span>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                  <div className="text-xs text-stone-500">
                    Update order status to keep customer and logistics updated:
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {order.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateCustomerOrderStatus(order.id, 'Accepted')}
                          className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Order</span>
                        </button>
                        <button
                          onClick={() => handleUpdateCustomerOrderStatus(order.id, 'Rejected')}
                          className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-rose-100 text-stone-700 hover:text-rose-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </>
                    )}

                    {(order.status === 'Accepted' || order.status === 'Pending') && (
                      <button
                        onClick={() => handleUpdateCustomerOrderStatus(order.id, 'Ready for Delivery')}
                        className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Mark as Ready for Delivery</span>
                      </button>
                    )}

                    {order.status === 'Ready for Delivery' && (
                      <button
                        onClick={() => handleUpdateCustomerOrderStatus(order.id, 'Delivered')}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark as Delivered</span>
                      </button>
                    )}

                    {order.status === 'Delivered' && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Order Fulfilled & Payout Credited</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. BULK BUYER REQUESTS                                                    */}
      {/* ========================================================================= */}
      {activeTab === 'bulk_requests' && (
        <div className="space-y-4">
          {bulkQuotes.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-2">
              <Building2 className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-base font-bold text-stone-700">No Bulk Requests Yet</h4>
              <p className="text-xs text-stone-500">Volume quote requests submitted by wholesalers or retail chains appear here.</p>
            </div>
          ) : (
            bulkQuotes.map((quote) => (
              <div
                key={quote.id}
                className="bg-white rounded-3xl p-6 border-2 border-stone-200 hover:border-teal-500 transition-all shadow-xs space-y-5"
              >
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-sm">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-black text-stone-900 font-display">
                          Bulk Quote #{quote.id}
                        </h4>
                        <span className="text-xs text-stone-500">({quote.date})</span>
                      </div>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Buyer: <strong className="text-stone-800">{quote.buyerName}</strong> &bull; {quote.buyerCompany || 'Commercial Buyer'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {getStatusBadge(quote.status)}
                    <div className="text-right">
                      <span className="text-[10px] text-stone-500 block">Estimated Deal Value</span>
                      <span className="text-base font-black text-teal-800">
                        ₹{(quote.requiredQty * quote.expectedPrice).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Requirements details */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <span className="text-stone-500 block font-medium">Commodity & Volume</span>
                    <div className="font-extrabold text-stone-900 text-sm mt-0.5">
                      {quote.productName}
                    </div>
                    <div className="text-teal-800 font-black text-base mt-0.5">
                      {quote.requiredQty} {quote.unit}
                    </div>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <span className="text-stone-500 block font-medium">Target Offer Price</span>
                    <div className="font-black text-stone-900 text-base mt-0.5">
                      ₹{quote.expectedPrice} / {quote.unit}
                    </div>
                    <span className="text-[11px] text-stone-500">Farm-gate rate</span>
                  </div>

                  <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80">
                    <span className="text-stone-500 block font-medium">Delivery Deadline</span>
                    <div className="font-extrabold text-stone-900 text-sm mt-0.5 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{quote.requiredDeliveryDate}</span>
                    </div>
                  </div>
                </div>

                {/* Destination & Specs */}
                <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200/80 space-y-1.5 text-xs text-stone-700">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                    <span>Destination Hub: <strong className="text-stone-900">{quote.deliveryLocation}</strong></span>
                  </div>
                  {quote.additionalRequirements && (
                    <div className="pl-5 text-stone-600 text-xs">
                      <strong>Specs:</strong> {quote.additionalRequirements}
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-stone-100">
                  <div className="text-xs text-stone-500">
                    Contact: {quote.buyerContact || 'Via Farm2Door Portal'}
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {quote.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateBulkQuoteStatus(quote.id, 'Accepted')}
                          className="px-4 py-2 rounded-xl bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Accept Bulk Quote</span>
                        </button>
                        <button
                          onClick={() => handleUpdateBulkQuoteStatus(quote.id, 'Rejected')}
                          className="px-4 py-2 rounded-xl bg-stone-200 hover:bg-rose-100 text-stone-700 hover:text-rose-800 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Decline</span>
                        </button>
                      </>
                    )}

                    {quote.status === 'Accepted' && (
                      <button
                        onClick={() => handleUpdateBulkQuoteStatus(quote.id, 'Ready for Delivery')}
                        className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Truck className="w-3.5 h-3.5" />
                        <span>Dispatch Ready (Logistics Assigned)</span>
                      </button>
                    )}

                    {quote.status === 'Ready for Delivery' && (
                      <button
                        onClick={() => handleUpdateBulkQuoteStatus(quote.id, 'Delivered')}
                        className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Consignment Delivered</span>
                      </button>
                    )}

                    {quote.status === 'Delivered' && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Contract Completed & Settled</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. DIRECT BUYER ENQUIRIES                                                 */}
      {/* ========================================================================= */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          {enquiries.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-stone-200 space-y-2">
              <MessageSquare className="w-12 h-12 text-stone-300 mx-auto" />
              <h4 className="text-base font-bold text-stone-700">No Direct Enquiries</h4>
              <p className="text-xs text-stone-500">Customer questions asked from product cards will appear here.</p>
            </div>
          ) : (
            enquiries.map((enq) => (
              <div
                key={enq.id}
                className="bg-white rounded-3xl p-6 border border-stone-200 shadow-xs space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-stone-900">
                        Query from {enq.buyerName}
                      </h4>
                      <span className="text-xs px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-bold">
                        {enq.buyerRole === 'bulk_buyer' ? 'Bulk Sourcing Agent' : 'Retail Customer'}
                      </span>
                      <span className="text-xs text-stone-500">({enq.date})</span>
                    </div>
                    <p className="text-xs text-emerald-700 font-bold mt-0.5">
                      Regarding: {enq.productName}
                    </p>
                  </div>

                  {enq.replied ? (
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      <span>Replied</span>
                    </span>
                  ) : (
                    <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
                      Awaiting Reply
                    </span>
                  )}
                </div>

                {/* Customer Message */}
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-stone-800 text-sm leading-relaxed">
                  &ldquo;{enq.message}&rdquo;
                </div>

                {/* Farmer Reply if exists */}
                {enq.replied && enq.replyMessage && (
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                    <div className="font-bold flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Your Reply:</span>
                    </div>
                    <p className="italic leading-relaxed">{enq.replyMessage}</p>
                  </div>
                )}

                {/* Reply input if not replied */}
                {!enq.replied && (
                  <div className="pt-2 flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Type your reply to customer..."
                      value={replyTextMap[enq.id] || ''}
                      onChange={(e) => setReplyTextMap({ ...replyTextMap, [enq.id]: e.target.value })}
                      className="flex-1 px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-600 text-xs font-medium"
                    />
                    <button
                      onClick={() => handleSendReply(enq.id)}
                      className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Reply</span>
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

    </div>
  );
};
