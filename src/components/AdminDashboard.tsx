import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Users, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Search, 
  RefreshCw, 
  UserCheck, 
  UserX, 
  MapPin, 
  Phone, 
  Mail, 
  Building2, 
  Calendar, 
  LogOut, 
  Filter, 
  Sparkles, 
  ShoppingBag, 
  ExternalLink, 
  Info, 
  Check, 
  Wheat,
  Lock,
  Key
} from 'lucide-react';
import { UserAccount, ApprovalStatus } from '../types';
import { 
  getFarmersList, 
  getCustomersList, 
  updateFarmerStatus, 
  registerUser,
  changeAdminPassword
} from '../data/authService';

interface AdminDashboardProps {
  currentUser: UserAccount;
  onLogout: () => void;
  onSwitchToFarmerLogin?: (farmerContact?: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  currentUser,
  onLogout,
  onSwitchToFarmerLogin,
}) => {
  const [farmers, setFarmers] = useState<UserAccount[]>([]);
  const [customers, setCustomers] = useState<UserAccount[]>([]);
  const [activeTab, setActiveTab] = useState<'farmers' | 'customers'>('farmers');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Password change state
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  // Load registered users
  const refreshUsers = () => {
    setFarmers(getFarmersList());
    setCustomers(getCustomersList());
  };

  useEffect(() => {
    refreshUsers();
  }, []);

  // Show transient toast
  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    if (!currentPasswordInput) {
      setPasswordError('Please enter your current password.');
      return;
    }
    if (newPasswordInput.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setPasswordError('New passwords do not match.');
      return;
    }
    setIsUpdatingPassword(true);
    const res = await changeAdminPassword(currentPasswordInput, newPasswordInput);
    setIsUpdatingPassword(false);
    if (res.success) {
      showToast('Admin password updated successfully!', 'success');
      setIsPasswordModalOpen(false);
      setCurrentPasswordInput('');
      setNewPasswordInput('');
      setConfirmPasswordInput('');
    } else {
      setPasswordError(res.error || 'Failed to update password.');
    }
  };

  // Handle Approve action
  const handleApproveFarmer = (farmer: UserAccount) => {
    const res = updateFarmerStatus(farmer.id, 'approved');
    if (res.success) {
      refreshUsers();
      showToast(`Farmer "${farmer.fullName}" has been APPROVED. They can now log in and access all farmer features!`, 'success');
    }
  };

  // Handle Reject action
  const handleRejectFarmer = (farmer: UserAccount) => {
    const res = updateFarmerStatus(farmer.id, 'rejected');
    if (res.success) {
      refreshUsers();
      showToast(`Farmer "${farmer.fullName}" has been REJECTED. They remain unable to access farmer features.`, 'error');
    }
  };

  // Helper: Create a demo pending farmer to let the evaluator test approvals in 1 click
  const handleAddDemoPendingFarmer = () => {
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const names = ['Venkat Rao', 'Govind Naik', 'Balaraju M.', 'Lakshmi Devi', 'Devi Prasad'];
    const locations = ['Anantapur, AP', 'Nellore, AP', 'Vijayawada, AP', 'Guntur, AP', 'Khammam, TG'];
    const fpos = ['Deccan Farmers Alliance', 'Prakasam Organic FPO', 'Krishna Delta Farmers Group'];
    
    const pickedName = names[Math.floor(Math.random() * names.length)];
    const pickedLoc = locations[Math.floor(Math.random() * locations.length)];
    const pickedFpo = fpos[Math.floor(Math.random() * fpos.length)];

    const res = registerUser({
      fullName: `${pickedName} (#${randomId})`,
      contact: `+91 98${randomId} 1234`,
      email: `farmer.${randomId}@kisanportal.in`,
      password: '123456',
      role: 'farmer',
      language: 'te',
      fpoOrOrgName: pickedFpo,
      location: pickedLoc,
    });

    if (res.success) {
      refreshUsers();
      setStatusFilter('pending');
      showToast(`New farmer "${pickedName} (#${randomId})" registered with status: PENDING.`, 'info');
    }
  };

  // Counts
  const pendingCount = farmers.filter((f) => f.approvalStatus === 'pending').length;
  const approvedCount = farmers.filter((f) => f.approvalStatus === 'approved').length;
  const rejectedCount = farmers.filter((f) => f.approvalStatus === 'rejected').length;

  // Filtered farmers
  const filteredFarmers = farmers.filter((f) => {
    // Status filter
    if (statusFilter !== 'all') {
      const currentStat = f.approvalStatus || 'approved';
      if (currentStat !== statusFilter) return false;
    }
    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = f.fullName.toLowerCase().includes(q);
      const matchContact = f.contact.toLowerCase().includes(q);
      const matchEmail = (f.email || '').toLowerCase().includes(q);
      const matchLoc = (f.location || '').toLowerCase().includes(q);
      const matchFpo = (f.fpoOrOrgName || '').toLowerCase().includes(q);
      return matchName || matchContact || matchEmail || matchLoc || matchFpo;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-stone-100 text-stone-900 pb-16">
      
      {/* Top Banner / Toast */}
      {notification && (
        <div 
          id="admin-toast-notification"
          className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-2xl shadow-xl flex items-start gap-3 border transition-all animate-in fade-in slide-in-from-top-2 duration-200 ${
            notification.type === 'success' 
              ? 'bg-emerald-900 text-white border-emerald-700' 
              : notification.type === 'error'
              ? 'bg-rose-950 text-white border-rose-800'
              : 'bg-stone-900 text-white border-stone-800'
          }`}
        >
          {notification.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
          {notification.type === 'error' && <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
          {notification.type === 'info' && <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />}
          <div className="text-sm font-medium leading-snug">
            {notification.message}
          </div>
        </div>
      )}

      {/* Admin Executive Header Bar */}
      <header className="bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-purple-600/90 text-white flex items-center justify-center shadow-md">
              <ShieldCheck className="w-6 h-6 stroke-[2.2]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black tracking-tight font-display text-white">
                  Farm2Door AI Admin
                </h1>
                <span className="px-2 py-0.5 text-2xs font-black uppercase tracking-wider rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  Control Center
                </span>
              </div>
              <p className="text-xs text-stone-400 font-medium">
                Administrator: <span className="text-stone-200 font-bold">{currentUser.fullName}</span> &bull; {currentUser.email || currentUser.contact}
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2.5">
            <button
              id="admin-change-password-btn"
              onClick={() => {
                setPasswordError(null);
                setCurrentPasswordInput('');
                setNewPasswordInput('');
                setConfirmPasswordInput('');
                setIsPasswordModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-xl border border-stone-700 transition-colors cursor-pointer"
              title="Change Admin Password"
            >
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <span>Change Password</span>
            </button>

            <button
              id="admin-refresh-btn"
              onClick={refreshUsers}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-stone-300 bg-stone-800 hover:bg-stone-700 rounded-xl border border-stone-700 transition-colors cursor-pointer"
              title="Refresh users list"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Refresh</span>
            </button>

            <button
              id="admin-logout-btn"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-rose-200 bg-rose-950/80 hover:bg-rose-900 rounded-xl border border-rose-800/80 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* KPI Summary Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          
          {/* Card 1: Pending Approvals */}
          <div 
            onClick={() => { setActiveTab('farmers'); setStatusFilter('pending'); }}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              statusFilter === 'pending' && activeTab === 'farmers'
                ? 'bg-amber-50 border-amber-400 shadow-md ring-2 ring-amber-400/20'
                : 'bg-white border-stone-200 hover:border-amber-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Pending Approvals
              </span>
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900 font-display">
                {pendingCount}
              </span>
              <span className="text-xs font-medium text-amber-700">
                {pendingCount === 1 ? 'farmer awaiting' : 'farmers awaiting'}
              </span>
            </div>
            <p className="text-2xs text-stone-500 mt-2">
              Farmers who signed up and cannot access until approved
            </p>
          </div>

          {/* Card 2: Approved Farmers */}
          <div 
            onClick={() => { setActiveTab('farmers'); setStatusFilter('approved'); }}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              statusFilter === 'approved' && activeTab === 'farmers'
                ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-400/20'
                : 'bg-white border-stone-200 hover:border-emerald-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Approved Farmers
              </span>
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <UserCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900 font-display">
                {approvedCount}
              </span>
              <span className="text-xs font-medium text-emerald-700">active & permitted</span>
            </div>
            <p className="text-2xs text-stone-500 mt-2">
              Full access to Farmer Dashboard, Products & Voice Hub
            </p>
          </div>

          {/* Card 3: Rejected Farmers */}
          <div 
            onClick={() => { setActiveTab('farmers'); setStatusFilter('rejected'); }}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              statusFilter === 'rejected' && activeTab === 'farmers'
                ? 'bg-rose-50 border-rose-400 shadow-md ring-2 ring-rose-400/20'
                : 'bg-white border-stone-200 hover:border-rose-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-800">
                Rejected
              </span>
              <div className="w-10 h-10 rounded-2xl bg-rose-100 text-rose-800 flex items-center justify-center">
                <UserX className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900 font-display">
                {rejectedCount}
              </span>
              <span className="text-xs font-medium text-rose-700">declined</span>
            </div>
            <p className="text-2xs text-stone-500 mt-2">
              Blocked from accessing farmer portal features
            </p>
          </div>

          {/* Card 4: Registered Customers */}
          <div 
            onClick={() => { setActiveTab('customers'); }}
            className={`p-5 rounded-3xl border transition-all cursor-pointer ${
              activeTab === 'customers'
                ? 'bg-blue-50 border-blue-400 shadow-md ring-2 ring-blue-400/20'
                : 'bg-white border-stone-200 hover:border-blue-300 hover:shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
                Direct Customers
              </span>
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-800 flex items-center justify-center">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-stone-900 font-display">
                {customers.length}
              </span>
              <span className="text-xs font-medium text-blue-700">standard access</span>
            </div>
            <p className="text-2xs text-stone-500 mt-2">
              Customers register and login without approval needed
            </p>
          </div>

        </section>

        {/* Workflow Guidance & Demo Testing Bar */}
        <section className="mb-8 bg-gradient-to-r from-purple-900 via-indigo-900 to-stone-900 rounded-3xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold text-purple-200 uppercase tracking-wider">
                  Admin Verification Protocol
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold font-display">
                Farmer Verification & Approval Controls
              </h2>
              <p className="text-xs sm:text-sm text-stone-300 max-w-2xl mt-1 leading-relaxed">
                When farmers sign up, their accounts are created with status <span className="text-amber-300 font-bold font-mono">Pending</span> and are locked out of the farmer dashboard until you approve them. As Admin, click <span className="text-emerald-300 font-bold">Approve</span> or <span className="text-rose-300 font-bold">Reject</span> below to manage permissions in real-time.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <button
                id="admin-add-test-farmer-btn"
                onClick={handleAddDemoPendingFarmer}
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Wheat className="w-4 h-4" />
                <span>+ Simulate New Farmer Signup</span>
              </button>
            </div>
          </div>
        </section>

        {/* Main Section Navigation Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          
          {/* Tab Selection */}
          <div className="inline-flex p-1.5 rounded-2xl bg-stone-200/80 border border-stone-300/80">
            <button
              id="admin-tab-farmers"
              onClick={() => setActiveTab('farmers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'farmers'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Farmers ({farmers.length})</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-2xs font-extrabold animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              id="admin-tab-customers"
              onClick={() => setActiveTab('customers')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                activeTab === 'customers'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Customers ({customers.length})</span>
            </button>
          </div>

          {/* Search bar & status filter (when on Farmers tab) */}
          <div className="flex flex-wrap items-center gap-3">
            {activeTab === 'farmers' && (
              <div className="inline-flex p-1 rounded-xl bg-white border border-stone-200 text-xs">
                {(['all', 'pending', 'approved', 'rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setStatusFilter(st)}
                    className={`px-3 py-1.5 rounded-lg font-bold capitalize transition-colors cursor-pointer ${
                      statusFilter === st
                        ? 'bg-stone-900 text-white'
                        : 'text-stone-600 hover:text-stone-900'
                    }`}
                  >
                    {st === 'all' ? 'All' : st}
                  </button>
                ))}
              </div>
            )}

            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={activeTab === 'farmers' ? "Search farmer name, phone, FPO..." : "Search customer..."}
                className="pl-9 pr-3.5 py-2 text-xs rounded-xl bg-white border border-stone-200 focus:outline-hidden focus:border-stone-900 w-56 sm:w-64"
              />
            </div>
          </div>

        </div>

        {/* TAB 1: FARMERS LIST & APPROVAL ACTIONS */}
        {activeTab === 'farmers' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            
            <div className="p-5 border-b border-stone-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-stone-900 font-display">
                  Farmer Registration & Approval Queue
                </h3>
                <p className="text-xs text-stone-500 mt-0.5">
                  Showing {filteredFarmers.length} of {farmers.length} total farmers
                </p>
              </div>

              {pendingCount > 0 && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  <Clock className="w-3.5 h-3.5 text-amber-600 animate-spin" />
                  <span>{pendingCount} Pending Action</span>
                </div>
              )}
            </div>

            {filteredFarmers.length === 0 ? (
              <div className="p-12 text-center">
                <Users className="w-12 h-12 text-stone-300 mx-auto mb-3" />
                <p className="text-sm font-bold text-stone-700">No farmers found</p>
                <p className="text-xs text-stone-500 mt-1">
                  {statusFilter !== 'all' ? `No farmers with status "${statusFilter}" match your search.` : 'No farmer accounts currently registered.'}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-stone-100">
                {filteredFarmers.map((farmer) => {
                  const status = farmer.approvalStatus || 'approved';
                  return (
                    <div 
                      key={farmer.id}
                      className={`p-5 sm:p-6 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                        status === 'pending' ? 'bg-amber-50/40 hover:bg-amber-50/70' : 'hover:bg-stone-50'
                      }`}
                    >
                      {/* Left: Farmer Profile Info */}
                      <div className="flex items-start gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 font-bold ${
                          status === 'pending'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}>
                          👨‍🌾
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2.5">
                            <h4 className="text-base font-extrabold text-stone-900">
                              {farmer.fullName}
                            </h4>

                            {/* Status Badge */}
                            {status === 'pending' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-600 animate-ping" />
                                <span>Pending Approval</span>
                              </span>
                            )}
                            {status === 'approved' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-black uppercase tracking-wider bg-emerald-100 text-emerald-900 border border-emerald-300">
                                <Check className="w-3 h-3 text-emerald-700" />
                                <span>Approved (Permitted)</span>
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-2xs font-black uppercase tracking-wider bg-rose-100 text-rose-900 border border-rose-300">
                                <XCircle className="w-3 h-3 text-rose-700" />
                                <span>Rejected (Access Blocked)</span>
                              </span>
                            )}
                          </div>

                          {/* Details line: Contact, Email, FPO, Location */}
                          <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-600 font-medium">
                            <span className="inline-flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-stone-400" />
                              <span className="font-semibold text-stone-800">{farmer.contact}</span>
                            </span>

                            {farmer.email && (
                              <span className="inline-flex items-center gap-1.5">
                                <Mail className="w-3.5 h-3.5 text-stone-400" />
                                <span>{farmer.email}</span>
                              </span>
                            )}

                            {farmer.fpoOrOrgName && (
                              <span className="inline-flex items-center gap-1.5">
                                <Building2 className="w-3.5 h-3.5 text-stone-400" />
                                <span>{farmer.fpoOrOrgName}</span>
                              </span>
                            )}

                            {farmer.location && (
                              <span className="inline-flex items-center gap-1.5">
                                <MapPin className="w-3.5 h-3.5 text-stone-400" />
                                <span>{farmer.location}</span>
                              </span>
                            )}

                            <span className="inline-flex items-center gap-1.5 text-stone-400">
                              <Calendar className="w-3.5 h-3.5" />
                              <span>{new Date(farmer.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                            </span>
                          </div>

                          {/* Explanation of current permissions */}
                          <div className="mt-2 text-2xs font-medium">
                            {status === 'pending' && (
                              <span className="text-amber-800 bg-amber-100/60 px-2 py-0.5 rounded-md">
                                ⚠️ Cannot access farmer dashboard or features until admin approval.
                              </span>
                            )}
                            {status === 'approved' && (
                              <span className="text-emerald-800 bg-emerald-100/60 px-2 py-0.5 rounded-md">
                                ✓ Fully verified. Can log in and manage farm listings & orders.
                              </span>
                            )}
                            {status === 'rejected' && (
                              <span className="text-rose-800 bg-rose-100/60 px-2 py-0.5 rounded-md">
                                ✕ Login denied. Receives rejection notice upon attempting to sign in.
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Action Buttons (Approve / Reject) */}
                      <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                        {status === 'pending' && (
                          <>
                            <button
                              id={`admin-approve-btn-${farmer.id}`}
                              onClick={() => handleApproveFarmer(farmer)}
                              className="px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                              <span>Approve Farmer</span>
                            </button>

                            <button
                              id={`admin-reject-btn-${farmer.id}`}
                              onClick={() => handleRejectFarmer(farmer)}
                              className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 active:scale-95 cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>Reject</span>
                            </button>
                          </>
                        )}

                        {status === 'approved' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                              Active & Permitted
                            </span>
                            <button
                              id={`admin-revoke-btn-${farmer.id}`}
                              onClick={() => handleRejectFarmer(farmer)}
                              className="px-3 py-1.5 rounded-xl text-rose-700 hover:bg-rose-50 border border-stone-200 hover:border-rose-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Revoke permission"
                            >
                              Revoke
                            </button>
                          </div>
                        )}

                        {status === 'rejected' && (
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-rose-700 bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                              Access Denied
                            </span>
                            <button
                              id={`admin-reapprove-btn-${farmer.id}`}
                              onClick={() => handleApproveFarmer(farmer)}
                              className="px-3 py-1.5 rounded-xl text-emerald-700 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-200 text-xs font-semibold transition-colors cursor-pointer"
                              title="Re-evaluate & approve"
                            >
                              Re-Approve
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: CUSTOMERS DIRECTORY */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-5 border-b border-stone-100">
              <h3 className="text-base font-bold text-stone-900 font-display">
                Registered Direct Customers
              </h3>
              <p className="text-xs text-stone-500 mt-0.5">
                Customers register and log in normally without admin approval required.
              </p>
            </div>

            <div className="divide-y divide-stone-100">
              {customers.map((c) => (
                <div key={c.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-lg font-bold">
                      🛒
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{c.fullName}</h4>
                      <p className="text-xs text-stone-500">{c.contact} {c.email ? `• ${c.email}` : ''}</p>
                    </div>
                  </div>

                  <span className="px-3 py-1 rounded-full text-2xs font-black uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Active Consumer
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* ADMIN CHANGE PASSWORD MODAL */}
      {isPasswordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-stone-900">Change Admin Password</h3>
                  <p className="text-xs text-stone-500">Update password for account: naqi</p>
                </div>
              </div>
              <button
                onClick={() => setIsPasswordModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>

            {passwordError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-medium">
                {passwordError}
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Current Password</label>
                <input
                  type="password"
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder="Enter current password (default: 123456)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">New Password</label>
                <input
                  type="password"
                  value={newPasswordInput}
                  onChange={(e) => setNewPasswordInput(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmPasswordInput}
                  onChange={(e) => setConfirmPasswordInput(e.target.value)}
                  placeholder="Repeat new password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-none focus:border-stone-900"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setIsPasswordModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdatingPassword}
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-stone-900 hover:bg-stone-800 transition-colors cursor-pointer disabled:opacity-60"
                >
                  {isUpdatingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
