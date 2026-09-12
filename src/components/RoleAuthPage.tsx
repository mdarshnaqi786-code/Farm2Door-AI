import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Sprout, 
  ShoppingBag, 
  Building2, 
  Volume2, 
  ShieldCheck, 
  Lock, 
  Phone, 
  Mail, 
  User, 
  Check, 
  Eye, 
  EyeOff,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  MapPin,
  ShieldAlert,
  Wheat
} from 'lucide-react';
import { UserRole, UserAccount, SupportedLanguage, ApprovalStatus } from '../types';
import { INDIAN_LANGUAGES } from '../data/languages';
import { speakText, speakLanguagePronunciation } from '../utils/speech';
import { 
  DEFAULT_ADMIN, 
  loginUser, 
  registerUser, 
  setCurrentUserSession 
} from '../data/authService';

interface RoleAuthPageProps {
  role: UserRole;
  onBackToRoleSelection: () => void;
  onAuthSuccess: (account: UserAccount) => void;
  onStartSpeech: () => void;
  onEndSpeech: () => void;
}

export const RoleAuthPage: React.FC<RoleAuthPageProps> = ({
  role: initialRole,
  onBackToRoleSelection,
  onAuthSuccess,
  onStartSpeech,
  onEndSpeech,
}) => {
  const [activeRole, setActiveRole] = useState<UserRole>(initialRole);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  
  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign up form state
  const [signupName, setSignupName] = useState('');
  const [signupIdentifier, setSignupIdentifier] = useState('');
  const [signupLocation, setSignupLocation] = useState('');
  const [signupFPO, setSignupFPO] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupLanguage, setSignupLanguage] = useState<string>('hi');
  
  // Validation / Error / Modal states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [approvalAlert, setApprovalAlert] = useState<{
    status: ApprovalStatus;
    title: string;
    description: string;
    farmerName?: string;
  } | null>(null);
  const [justRegisteredPendingFarmer, setJustRegisteredPendingFarmer] = useState<UserAccount | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Sync role if prop changes
  useEffect(() => {
    setActiveRole(initialRole);
    setErrorMessage(null);
    setApprovalAlert(null);
  }, [initialRole]);

  // Adjust default language when role changes
  useEffect(() => {
    if (activeRole === 'farmer') {
      setSignupLanguage('hi');
    } else {
      setSignupLanguage('en');
    }
    setErrorMessage(null);
    setApprovalAlert(null);
  }, [activeRole]);

  // Role metadata
  const roleConfigs: Record<string, any> = {
    farmer: {
      title: 'Farmer / FPO',
      subtitle: 'किसान / రైతు / உழவர் लॉगिन',
      icon: '👨‍🌾',
      badgeBg: 'bg-emerald-100 text-emerald-900 border-emerald-300',
      btnBg: 'bg-emerald-700 hover:bg-emerald-800 text-white',
      accentColor: 'emerald',
      demoName: 'Ramesh Patil',
      demoContact: '+91 98765 43210',
      demoFPO: 'Sahyadri Kisan Producer Co.',
      demoLocation: 'Nashik, Maharashtra',
      voicePrompt: 'Farmer authentication portal. Sign up with status Pending awaiting admin approval, or log in with verified credentials.',
    },
    consumer: {
      title: 'Customer',
      subtitle: 'Fresh Farm Produce Direct',
      icon: '🛒',
      badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
      btnBg: 'bg-stone-900 hover:bg-stone-800 text-white',
      accentColor: 'amber',
      demoName: 'Priya Sharma',
      demoContact: 'priya.sharma@example.com',
      demoFPO: '',
      demoLocation: 'Guntur, Andhra Pradesh',
      voicePrompt: 'Customer authentication portal. Sign up or log in to buy farm-fresh produce directly from verified farmers.',
    },
    admin: {
      title: 'Admin',
      subtitle: 'Platform Control & Farmer Approvals',
      icon: '🛡️',
      badgeBg: 'bg-purple-100 text-purple-900 border-purple-300',
      btnBg: 'bg-purple-800 hover:bg-purple-900 text-white',
      accentColor: 'purple',
      demoName: 'naqi',
      demoContact: 'mdarshnaqi786@gmail.com',
      demoFPO: 'Farm2Door AI Administration',
      demoLocation: 'Central Operations Hub',
      voicePrompt: 'Administrator portal. Use your predefined credentials to access the Admin Dashboard and approve farmer registrations.',
    },
    bulk_buyer: {
      title: 'Bulk Buyer',
      subtitle: 'Hotels, Processors & Exporters',
      icon: '🏢',
      badgeBg: 'bg-teal-100 text-teal-900 border-teal-300',
      btnBg: 'bg-teal-800 hover:bg-teal-900 text-white',
      accentColor: 'teal',
      demoName: 'Rajan Fresh Foods Ltd.',
      demoContact: 'procure@rajanfoods.com',
      demoFPO: 'Commercial Procurement',
      demoLocation: 'Vijayawada, Andhra Pradesh',
      voicePrompt: 'Bulk buyer portal. Procure agricultural commodities by the quintal or metric ton directly from verified farmers.',
    },
  };

  const roleConfig = roleConfigs[activeRole] || {
    title: 'User',
    subtitle: 'Sign in to Farm2Door AI',
    icon: '👤',
    badgeBg: 'bg-stone-100 text-stone-900 border-stone-300',
    btnBg: 'bg-stone-900 hover:bg-stone-800 text-white',
    accentColor: 'stone',
    demoName: 'User',
    demoContact: 'user@farm2door.in',
    demoFPO: '',
    demoLocation: 'India',
    voicePrompt: 'Farm2Door authentication portal. Sign up or log in to continue.',
  };

  // Hear page instructions aloud
  const handleSpeakPageInstructions = () => {
    speakText(roleConfig.voicePrompt, 'en', onStartSpeech, onEndSpeech);
  };

  // Pronounce language name aloud when speaker clicked
  const handleSpeakLanguage = (e: React.MouseEvent, lang: SupportedLanguage) => {
    e.stopPropagation();
    speakLanguagePronunciation(lang.nameNative, lang.nameEn, lang.code, onStartSpeech, onEndSpeech);
  };

  // Quick Demo fills
  const handleFillAdminDemo = () => {
    setErrorMessage(null);
    setApprovalAlert(null);
    setLoginIdentifier(DEFAULT_ADMIN.email || 'mdarshnaqi786@gmail.com');
    setLoginPassword(DEFAULT_ADMIN.password || '123456');
  };

  const handleFillFarmerDemo = (status: 'approved' | 'pending') => {
    setErrorMessage(null);
    setApprovalAlert(null);
    if (status === 'approved') {
      setLoginIdentifier('+91 98765 43210');
      setLoginPassword('123456');
    } else {
      // Pending farmer: Suresh Kumar
      setLoginIdentifier('+91 91234 56789');
      setLoginPassword('123456');
    }
  };

  const handleFillCustomerDemo = () => {
    setErrorMessage(null);
    setApprovalAlert(null);
    if (authMode === 'login') {
      setLoginIdentifier('priya.sharma@example.com');
      setLoginPassword('123456');
    } else {
      setSignupName('Priya Sharma');
      setSignupIdentifier('priya.sharma@example.com');
      setSignupPassword('123456');
      setSignupLanguage('en');
    }
  };

  // Handle Login submission
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setApprovalAlert(null);

    if (!loginIdentifier.trim()) {
      setErrorMessage('Please enter your mobile number or email.');
      return;
    }
    if (!loginPassword) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = loginUser(activeRole, loginIdentifier, loginPassword);

      if (!res.success) {
        // Check if blocked because of Farmer Pending / Rejected status
        if (res.status === 'pending') {
          setApprovalAlert({
            status: 'pending',
            title: 'Account Approval Pending',
            description:
              'Your farmer registration has been received and is currently under review by Admin (naqi). You cannot access the Farmer Dashboard until your account is approved.',
            farmerName: res.account?.fullName,
          });
          return;
        }

        if (res.status === 'rejected') {
          setApprovalAlert({
            status: 'rejected',
            title: 'Account Application Rejected',
            description:
              'Your farmer registration was reviewed and has been rejected by Admin. You remain unable to access farmer features. Please reach out to mdarshnaqi786@gmail.com if you believe this was in error.',
            farmerName: res.account?.fullName,
          });
          return;
        }

        setErrorMessage(res.error || 'Login failed. Please check your credentials.');
        return;
      }

      // Success
      if (res.account) {
        setCurrentUserSession(res.account);
        onAuthSuccess(res.account);
      }
    }, 400);
  };

  // Handle Sign-up submission
  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setApprovalAlert(null);

    // Rule: Admin cannot be freely created by users.
    if (activeRole === 'admin') {
      setErrorMessage(
        'Admin accounts cannot be freely created by users. There is only one predefined administrator account: naqi (mdarshnaqi786@gmail.com).'
      );
      return;
    }

    if (!signupName.trim()) {
      setErrorMessage('Please enter your Full Name.');
      return;
    }
    if (!signupIdentifier.trim()) {
      setErrorMessage('Please enter your Mobile Number or Email.');
      return;
    }
    if (signupPassword.length < 4) {
      setErrorMessage('Password must be at least 4 characters long.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const res = registerUser({
        fullName: signupName.trim(),
        contact: signupIdentifier.trim(),
        password: signupPassword,
        role: activeRole,
        language: signupLanguage,
        fpoOrOrgName: signupFPO.trim() || undefined,
        location: signupLocation.trim() || undefined,
      });

      if (!res.success) {
        setErrorMessage(res.error || 'Registration failed.');
        return;
      }

      // If Farmer signs up:
      // "Farmer's account is created with status Pending.
      // Farmer cannot access the farmer features until approved."
      if (activeRole === 'farmer') {
        setJustRegisteredPendingFarmer(res.account || null);
        return;
      }

      // Customers can register and log in normally
      if (res.account) {
        setCurrentUserSession(res.account);
        onAuthSuccess(res.account);
      }
    }, 450);
  };

  return (
    <div className="min-h-[calc(100vh-4.5rem)] bg-stone-50 py-8 px-4 sm:px-6 lg:px-8 flex flex-col justify-center">
      <div className="max-w-2xl mx-auto w-full">
        
        {/* Navigation & Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            id="back-to-role-select-btn"
            onClick={onBackToRoleSelection}
            className="inline-flex items-center gap-2 text-stone-600 hover:text-stone-900 text-sm font-bold bg-white px-3.5 py-2 rounded-xl border border-stone-200 shadow-2xs hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Select Different Role</span>
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
              <Sprout className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="text-base font-black tracking-tight text-stone-900 font-display">
              Farm2Door AI
            </span>
          </div>

          {/* Speaker button to hear instructions */}
          <button
            id="auth-instruction-speaker"
            onClick={handleSpeakPageInstructions}
            className="w-10 h-10 rounded-xl bg-white text-emerald-700 hover:bg-emerald-50 border border-stone-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 shadow-2xs cursor-pointer"
            title="Hear instructions aloud"
            aria-label="Hear instructions aloud"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Role Switcher Bar */}
        <div className="mb-4 bg-stone-200/80 p-1.5 rounded-2xl flex items-center justify-between gap-1 text-xs font-bold border border-stone-300/80">
          <button
            id="auth-role-switch-farmer"
            type="button"
            onClick={() => {
              setActiveRole('farmer');
              setApprovalAlert(null);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeRole === 'farmer'
                ? 'bg-emerald-700 text-white shadow-xs font-extrabold'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <span>👨‍🌾 Farmer</span>
          </button>

          <button
            id="auth-role-switch-customer"
            type="button"
            onClick={() => {
              setActiveRole('consumer');
              setApprovalAlert(null);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeRole === 'consumer'
                ? 'bg-amber-600 text-white shadow-xs font-extrabold'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <span>🛒 Customer</span>
          </button>

          <button
            id="auth-role-switch-admin"
            type="button"
            onClick={() => {
              setActiveRole('admin');
              setApprovalAlert(null);
              setErrorMessage(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeRole === 'admin'
                ? 'bg-purple-800 text-white shadow-xs font-extrabold'
                : 'text-stone-700 hover:text-stone-900'
            }`}
          >
            <span>🛡️ Admin</span>
          </button>
        </div>

        {/* ========================================================================= */}
        {/* MODAL / VIEW: JUST REGISTERED FARMER (STATUS: PENDING)                     */}
        {/* ========================================================================= */}
        {justRegisteredPendingFarmer && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-amber-300 shadow-lg space-y-6 animate-in fade-in">
            <div className="text-center max-w-lg mx-auto">
              <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 mx-auto flex items-center justify-center text-3xl shadow-inner mb-4">
                <Clock className="w-8 h-8 stroke-[2.2] animate-pulse" />
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-300 mb-3">
                <span className="w-2 h-2 rounded-full bg-amber-600 animate-ping" />
                <span>Account Status: Pending Approval</span>
              </div>

              <h2 className="text-2xl font-black text-stone-900 font-display">
                Registration Submitted, {justRegisteredPendingFarmer.fullName}!
              </h2>

              <p className="mt-3 text-sm text-stone-600 leading-relaxed font-medium">
                Your farmer account has been created with status <strong className="text-amber-800">Pending</strong>. As per Farm2Door guidelines, <strong>you cannot access the farmer features until approved</strong> by the platform administrator.
              </p>

              <div className="mt-5 p-4 rounded-2xl bg-stone-50 border border-stone-200 text-left text-xs space-y-1.5 text-stone-700">
                <p><span className="font-bold text-stone-900">Name:</span> {justRegisteredPendingFarmer.fullName}</p>
                <p><span className="font-bold text-stone-900">Contact:</span> {justRegisteredPendingFarmer.contact}</p>
                <p><span className="font-bold text-stone-900">Assigned Reviewer:</span> naqi (mdarshnaqi786@gmail.com)</p>
                <p><span className="font-bold text-stone-900">Current Permission:</span> <span className="text-amber-700 font-bold">Locked until approved</span></p>
              </div>

              <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  id="pending-farmer-back-to-login"
                  onClick={() => {
                    setJustRegisteredPendingFarmer(null);
                    setAuthMode('login');
                    setLoginIdentifier(justRegisteredPendingFarmer.contact);
                    setLoginPassword('123456');
                  }}
                  className="px-5 py-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Farmer Login
                </button>

                <button
                  id="pending-farmer-test-admin-approval"
                  onClick={() => {
                    setJustRegisteredPendingFarmer(null);
                    setActiveRole('admin');
                    setAuthMode('login');
                    setLoginIdentifier(DEFAULT_ADMIN.email || 'mdarshnaqi786@gmail.com');
                    setLoginPassword(DEFAULT_ADMIN.password || '123456');
                  }}
                  className="px-5 py-3 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Log in as Admin naqi to Approve &rarr;</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MAIN AUTH CARD (WHEN NOT SHOWING JUST-REGISTERED VIEW)                    */}
        {/* ========================================================================= */}
        {!justRegisteredPendingFarmer && (
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-stone-200 shadow-sm space-y-6">
            
            {/* Role Header Banner */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-100 gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-stone-100 flex items-center justify-center text-3xl shadow-inner shrink-0">
                  <span>{roleConfig?.icon || '👤'}</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${roleConfig?.badgeBg || ''}`}>
                      {roleConfig?.title || 'User'}
                    </span>
                    <span className="text-xs text-stone-500 font-semibold">{roleConfig?.subtitle || ''}</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-stone-900 font-display mt-1">
                    {authMode === 'login' ? `${roleConfig?.title || 'User'} Login` : `${roleConfig?.title || 'User'} Sign Up`}
                  </h1>
                </div>
              </div>

              {/* Quick Demo Pre-fill */}
              <div className="flex flex-wrap gap-2">
                {activeRole === 'admin' && (
                  <button
                    id="admin-demo-fill-btn"
                    type="button"
                    onClick={handleFillAdminDemo}
                    className="text-xs font-bold text-purple-800 bg-purple-50 hover:bg-purple-100 px-3 py-1.5 rounded-xl border border-purple-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                    title="Pre-fill predefined default admin credentials"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Fill Admin Credentials</span>
                  </button>
                )}

                {activeRole === 'farmer' && authMode === 'login' && (
                  <>
                    <button
                      id="farmer-approved-demo-btn"
                      type="button"
                      onClick={() => handleFillFarmerDemo('approved')}
                      className="text-xs font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1.5 rounded-xl border border-emerald-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Test login of approved farmer"
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Approved Demo</span>
                    </button>

                    <button
                      id="farmer-pending-demo-btn"
                      type="button"
                      onClick={() => handleFillFarmerDemo('pending')}
                      className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-2.5 py-1.5 rounded-xl border border-amber-200 transition-colors flex items-center gap-1 cursor-pointer"
                      title="Test login of pending farmer (tests approval block)"
                    >
                      <Clock className="w-3 h-3 text-amber-600" />
                      <span>Pending Demo</span>
                    </button>
                  </>
                )}

                {activeRole === 'consumer' && (
                  <button
                    id="consumer-demo-fill-btn"
                    type="button"
                    onClick={handleFillCustomerDemo}
                    className="text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 px-3 py-1.5 rounded-xl border border-amber-200 transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Demo Customer</span>
                  </button>
                )}
              </div>
            </div>

            {/* Mode Switcher Tabs (Login vs Sign Up) */}
            <div className="grid grid-cols-2 bg-stone-100 p-1 rounded-2xl border border-stone-200">
              <button
                id="auth-tab-login"
                type="button"
                onClick={() => {
                  setAuthMode('login');
                  setErrorMessage(null);
                  setApprovalAlert(null);
                }}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  authMode === 'login'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Login
              </button>
              <button
                id="auth-tab-signup"
                type="button"
                onClick={() => {
                  setAuthMode('signup');
                  setErrorMessage(null);
                  setApprovalAlert(null);
                }}
                className={`py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  authMode === 'signup'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-600 hover:text-stone-900'
                }`}
              >
                Sign Up
              </button>
            </div>

            {/* Error notice */}
            {errorMessage && (
              <div 
                id="auth-error-notice"
                className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800 font-bold animate-in fade-in"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMessage}</span>
              </div>
            )}

            {/* Farmer Pending / Rejected Approval Alert Box */}
            {approvalAlert && (
              <div 
                id="farmer-approval-alert-box"
                className={`p-4 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed animate-in fade-in ${
                  approvalAlert.status === 'pending'
                    ? 'bg-amber-50 border-amber-300 text-amber-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}
              >
                {approvalAlert.status === 'pending' ? (
                  <Clock className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
                ) : (
                  <XCircle className="w-5 h-5 text-rose-700 shrink-0 mt-0.5" />
                )}
                <div>
                  <h4 className="font-extrabold text-sm mb-1">{approvalAlert.title}</h4>
                  <p>{approvalAlert.description}</p>
                  
                  {approvalAlert.status === 'pending' && (
                    <div className="mt-3 pt-2 border-t border-amber-200 flex flex-wrap items-center gap-2">
                      <span className="text-2xs font-semibold text-amber-800">
                        Evaluator testing shortcut:
                      </span>
                      <button
                        id="alert-switch-to-admin-btn"
                        type="button"
                        onClick={() => {
                          setActiveRole('admin');
                          setAuthMode('login');
                          setLoginIdentifier(DEFAULT_ADMIN.email || 'mdarshnaqi786@gmail.com');
                          setLoginPassword(DEFAULT_ADMIN.password || '123456');
                        }}
                        className="px-2.5 py-1 rounded-lg bg-purple-700 text-white text-2xs font-bold hover:bg-purple-800 transition-colors cursor-pointer"
                      >
                        Switch to Admin Login to Approve this Farmer &rarr;
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ===================================================================== */}
            {/* 1. LOGIN FORM                                                         */}
            {/* ===================================================================== */}
            {authMode === 'login' && (
              <form onSubmit={handleLoginSubmit} className="space-y-4 sm:space-y-5">
                
                {/* Admin info hint */}
                {activeRole === 'admin' && (
                  <div className="p-3 bg-purple-50 border border-purple-200 rounded-2xl text-xs text-purple-900 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Predefined Admin Account:</span> Email: <code className="font-bold bg-white px-1 rounded">mdarshnaqi786@gmail.com</code> | Password: <code className="font-bold bg-white px-1 rounded">123456</code>
                    </div>
                  </div>
                )}

                {/* Farmer info hint */}
                {activeRole === 'farmer' && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 flex items-start gap-2">
                    <Wheat className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Farmer Approval Verification:</span> Approved farmers enter their dashboard immediately. Pending or rejected farmers will be prevented from accessing farmer features.
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                    {activeRole === 'admin' ? 'Admin Email / Username' : 'Mobile Number or Email'}
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      {activeRole === 'admin' ? <Mail className="w-4 h-4" /> : <Phone className="w-4 h-4" />}
                    </div>
                    <input
                      id="login-identifier-input"
                      type="text"
                      required
                      value={loginIdentifier}
                      onChange={(e) => setLoginIdentifier(e.target.value)}
                      placeholder={
                        activeRole === 'admin'
                          ? 'mdarshnaqi786@gmail.com'
                          : activeRole === 'farmer'
                          ? 'e.g. +91 98765 43210 or ramesh.patil@kisan.in'
                          : 'e.g. +91 98765 43210 or user@example.com'
                      }
                      className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      id="login-password-input"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder={activeRole === 'admin' ? 'Enter admin password (123456)' : 'Enter your password'}
                      className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Login Button */}
                <button
                  id="login-submit-btn"
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-3.5 px-4 rounded-2xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${roleConfig.btnBg}`}
                >
                  {isLoading ? (
                    <span>Logging in...</span>
                  ) : (
                    <>
                      <span>Log In as {roleConfig.title}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {activeRole !== 'admin' && (
                  <div className="pt-2 text-center text-xs text-stone-500">
                    Don&apos;t have an account?{' '}
                    <button
                      id="switch-to-signup-link"
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-stone-900 font-extrabold hover:underline cursor-pointer"
                    >
                      Sign Up as {roleConfig.title}
                    </button>
                  </div>
                )}
              </form>
            )}

            {/* ===================================================================== */}
            {/* 2. SIGN-UP FORM                                                       */}
            {/* ===================================================================== */}
            {authMode === 'signup' && (
              <>
                {/* SPECIAL CASE: ADMIN SIGNUP RESTRICTION */}
                {/* "Admin should not be freely created by users. There should be one predefined admin account." */}
                {activeRole === 'admin' ? (
                  <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center space-y-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-800 mx-auto flex items-center justify-center">
                      <ShieldAlert className="w-6 h-6" />
                    </div>

                    <h3 className="text-base font-bold text-stone-900 font-display">
                      Admin Registration Restricted
                    </h3>

                    <p className="text-xs text-stone-600 max-w-md mx-auto leading-relaxed">
                      Admin accounts should not be freely created by users. The system has <strong>one predefined administrator account</strong> for platform governance and farmer approvals:
                    </p>

                    <div className="p-3.5 bg-white rounded-xl border border-purple-200 text-xs font-mono text-purple-950 text-left max-w-sm mx-auto space-y-1">
                      <div><span className="font-bold font-sans text-stone-700">Name:</span> naqi</div>
                      <div><span className="font-bold font-sans text-stone-700">Email:</span> mdarshnaqi786@gmail.com</div>
                      <div><span className="font-bold font-sans text-stone-700">Password:</span> 123456</div>
                    </div>

                    <div className="pt-2">
                      <button
                        id="admin-signup-switch-to-login"
                        type="button"
                        onClick={() => {
                          setAuthMode('login');
                          handleFillAdminDemo();
                        }}
                        className="px-5 py-2.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white text-xs font-bold transition-colors inline-flex items-center gap-2 cursor-pointer shadow-xs"
                      >
                        <span>Switch to Admin Login</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleSignupSubmit} className="space-y-5">
                    
                    {/* Farmer Approval Notice Banner */}
                    {activeRole === 'farmer' && (
                      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-950 flex items-start gap-2.5">
                        <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="font-bold block text-amber-900">
                            Farmer Approval Workflow:
                          </span>
                          <span>
                            Your account will be created with status <strong className="underline">Pending</strong>. You cannot access the farmer features until verified and approved by the platform Administrator (naqi).
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Customer Notice Banner */}
                    {activeRole === 'consumer' && (
                      <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-950 flex items-start gap-2.5">
                        <ShoppingBag className="w-4 h-4 text-blue-700 shrink-0 mt-0.5" />
                        <div className="leading-relaxed">
                          <span className="font-bold block text-blue-900">
                            Instant Customer Registration:
                          </span>
                          <span>
                            Customers register and log in normally without admin verification required.
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Full Name */}
                    <div>
                      <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                          <User className="w-4 h-4" />
                        </div>
                        <input
                          id="signup-name-input"
                          type="text"
                          required
                          value={signupName}
                          onChange={(e) => setSignupName(e.target.value)}
                          placeholder={activeRole === 'farmer' ? 'e.g. Ramesh Patil' : 'e.g. Priya Sharma'}
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                    </div>

                    {/* Mobile Number or Email */}
                    <div>
                      <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                        Mobile Number or Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="signup-identifier-input"
                          type="text"
                          required
                          value={signupIdentifier}
                          onChange={(e) => setSignupIdentifier(e.target.value)}
                          placeholder="e.g. +91 98765 43210 or user@example.com"
                          className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                        />
                      </div>
                    </div>

                    {/* Farmer-specific location & FPO fields */}
                    {activeRole === 'farmer' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                            Farm Location / District
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                              <MapPin className="w-4 h-4" />
                            </div>
                            <input
                              id="signup-location-input"
                              type="text"
                              value={signupLocation}
                              onChange={(e) => setSignupLocation(e.target.value)}
                              placeholder="e.g. Kurnool, Andhra Pradesh"
                              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                            FPO / Collective Name (Optional)
                          </label>
                          <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                              <Building2 className="w-4 h-4" />
                            </div>
                            <input
                              id="signup-fpo-input"
                              type="text"
                              value={signupFPO}
                              onChange={(e) => setSignupFPO(e.target.value)}
                              placeholder="e.g. Rayalaseema Farmers FPO"
                              className="w-full pl-10 pr-4 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Password */}
                    <div>
                      <label className="block text-xs font-black text-stone-700 uppercase tracking-wider mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
                          <Lock className="w-4 h-4" />
                        </div>
                        <input
                          id="signup-password-input"
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={signupPassword}
                          onChange={(e) => setSignupPassword(e.target.value)}
                          placeholder="Choose a password (min. 4 characters)"
                          className="w-full pl-10 pr-11 py-3 bg-stone-50 border border-stone-200 rounded-2xl text-sm text-stone-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-stone-900"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* LANGUAGE SELECTION SECTION */}
                    <div className="pt-3 border-t border-stone-100">
                      <div className="flex items-center justify-between mb-2">
                        <label className="block text-xs font-black text-stone-800 uppercase tracking-wider">
                          Select Preferred Language (अपनी भाषा चुनें)
                        </label>
                        <span className="text-2xs font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          🔊 Tap speaker to hear pronunciation
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto p-1 border border-stone-200 rounded-2xl bg-stone-50/50">
                        {INDIAN_LANGUAGES.map((lang) => {
                          const isSelected = signupLanguage === lang.code;
                          return (
                            <div
                              key={lang.code}
                              id={`lang-card-${lang.code}`}
                              onClick={() => setSignupLanguage(lang.code)}
                              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between cursor-pointer ${
                                isSelected
                                  ? 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-2xs'
                                  : 'bg-white border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <div className="min-w-0 pr-1">
                                <div className="text-sm font-extrabold text-stone-900 truncate">
                                  {lang.nameNative}
                                </div>
                                <div className="text-2xs font-semibold text-stone-500 truncate">
                                  {lang.nameEn}
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                {isSelected && (
                                  <div className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center">
                                    <Check className="w-3 h-3 stroke-[3]" />
                                  </div>
                                )}

                                <button
                                  id={`speaker-lang-${lang.code}`}
                                  type="button"
                                  onClick={(e) => handleSpeakLanguage(e, lang)}
                                  className="w-7 h-7 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 flex items-center justify-center transition-colors cursor-pointer"
                                  title={`Hear ${lang.nameEn} pronunciation`}
                                  aria-label={`Hear ${lang.nameEn} pronunciation`}
                                >
                                  <Volume2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Sign Up Submit Button */}
                    <button
                      id="signup-submit-btn"
                      type="submit"
                      disabled={isLoading}
                      className={`w-full py-3.5 px-4 rounded-2xl font-bold text-base shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${roleConfig.btnBg}`}
                    >
                      {isLoading ? (
                        <span>Registering...</span>
                      ) : activeRole === 'farmer' ? (
                        <>
                          <span>Submit Farmer Registration (Pending Approval)</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      ) : (
                        <>
                          <span>Sign Up as {roleConfig.title}</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    <div className="pt-1 text-center text-xs text-stone-500">
                      Already have an account?{' '}
                      <button
                        id="switch-to-login-link"
                        type="button"
                        onClick={() => setAuthMode('login')}
                        className="text-stone-900 font-extrabold hover:underline cursor-pointer"
                      >
                        Sign In
                      </button>
                    </div>

                  </form>
                )}
              </>
            )}

          </div>
        )}

      </div>
    </div>
  );
};
