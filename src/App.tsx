import React, { useState, useEffect } from 'react';
import { 
  AppView, 
  LanguageCode, 
  CartItem, 
  FarmerProduct, 
  UserRole, 
  UserAccount 
} from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { RoleAuthPage } from './components/RoleAuthPage';
import { FarmerDashboard } from './components/FarmerDashboard';
import { CustomerHomeView } from './components/CustomerHomeView';
import { ConsumerMarketplace } from './components/ConsumerMarketplace';
import { CustomerOrdersView } from './components/CustomerOrdersView';
import { FarmerProductManager } from './components/FarmerProductManager';
import { FarmerOrdersManager } from './components/FarmerOrdersManager';
import { BulkBuyerHomeView } from './components/BulkBuyerHomeView';
import { BulkBuyerDashboard } from './components/BulkBuyerDashboard';
import { MarketIntelligence } from './components/MarketIntelligence';
import { LogisticsPage } from './components/LogisticsPage';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { UserProfileModal } from './components/UserProfileModal';
import { stopSpeech } from './utils/speech';
import { safeStorage } from './utils/safeStorage';

export default function App() {
  console.log('[BOOT] App component function running');
  // Website opens at Landing Page with top Navbar
  const [currentView, setCurrentView] = useState<AppView>('role_selection');
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<UserRole>('farmer');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Active User session
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Initialize session from safeStorage
  useEffect(() => {
    try {
      const savedSession = safeStorage.getItem('farm2door_user_session');
      if (savedSession) {
        const user: UserAccount = JSON.parse(savedSession);
        
        setCurrentUser(user);
        if (user.language) {
          setLanguage(user.language);
        }

        // Direct to role home if logged in
        if (user.role === 'farmer') {
          setCurrentView('farmer_home');
        } else if (user.role === 'consumer') {
          setCurrentView('customer_home');
        } else if (user.role === 'admin') {
          setCurrentView('admin_dashboard');
        } else if (user.role === 'bulk_buyer') {
          setCurrentView('bulk_home');
        }
      }
    } catch (e) {
      console.warn('Failed to load user session from storage:', e);
    }
  }, []);

  // Consumer Cart
  const [cart, setCart] = useState<CartItem[]>([
    {
      product: {
        id: 'prod-tomato-1',
        name: 'Farm Fresh Desi Tomato',
        hindiName: 'देसी लाल टमाटर',
        teluguName: 'నాటు తాజా టమోటా',
        farmerName: 'Ramesh Patil',
        fpoName: 'Sahyadri Kisan Producer Co.',
        location: 'Nashik, Maharashtra',
        category: 'Vegetables',
        grade: 'Grade A',
        pricePerKg: 34,
        pricePerUnit: 34,
        farmerShare: 27,
        logisticsShare: 4.5,
        platformShare: 2.5,
        availableKg: 850,
        availableQty: 850,
        harvestDate: 'Harvested Today at 5:00 AM',
        image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=500&auto=format&fit=crop&q=80',
        description: 'Naturally vine-ripened, firm and juicy red tomatoes. Plucked fresh this morning with zero chemical ripening.',
        unit: 'kg',
      },
      quantityKg: 2,
    },
  ]);

  const handleStartSpeech = () => {
    setIsSpeakingAudio(true);
  };

  const handleEndSpeech = () => {
    setIsSpeakingAudio(false);
  };

  const handleStopSpeech = () => {
    stopSpeech();
    setIsSpeakingAudio(false);
  };

  // Step 1: User selects role on First Screen
  const handleSelectRole = (role: UserRole) => {
    handleStopSpeech();
    setSelectedRoleForAuth(role);
    setCurrentView('auth');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Step 2 & 3: User logs in or signs up with preferred language
  const handleAuthSuccess = (account: UserAccount) => {
    handleStopSpeech();
    setCurrentUser(account);
    if (account.language) {
      setLanguage(account.language);
    }

    // Redirect to respective role home
    if (account.role === 'farmer') {
      setCurrentView('farmer_home');
    } else if (account.role === 'consumer') {
      setCurrentView('customer_home');
    } else if (account.role === 'admin') {
      setCurrentView('admin_dashboard');
    } else if (account.role === 'bulk_buyer') {
      setCurrentView('bulk_home');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Logout returns user to Role Selection page and resets session
  const handleLogout = () => {
    handleStopSpeech();
    try {
      safeStorage.removeItem('farm2door_user_session');
    } catch (e) {
      console.warn('Failed to remove session:', e);
    }
    setCurrentUser(null);
    setCurrentView('role_selection');
    setIsProfileModalOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleAddToCart = (product: FarmerProduct, quantityKg: number) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantityKg: item.quantityKg + quantityKg }
            : item
        );
      }
      return [...prev, { product, quantityKg }];
    });
  };

  const handleUpdateCartQuantity = (productId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveCartItem(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantityKg: newQty } : item
      )
    );
  };

  const handleRemoveCartItem = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const handleClearCart = () => {
    setCart([]);
  };

  // Check whether top navigation bar should be visible:
  // Hide during standalone role selection screen or auth screen
  const isAuthFlow = currentView === 'role_selection' || currentView === 'auth';

  console.log('[BOOT] App rendering view:', currentView, 'currentUser:', currentUser ? currentUser.role : 'none');
  console.log('[BOOT] App returning JSX layout');

  return (
    <div id="app-root-wrapper" className="min-h-screen min-h-[100dvh] w-full bg-stone-50 text-stone-900 flex flex-col font-sans">
      
      {/* Top Navigation Bar: Shown on Landing and authenticated pages; hidden during standalone role selection / auth */}
      {!isAuthFlow && (
        <Navbar
          currentView={currentView}
          onNavigate={(view) => {
            handleStopSpeech();
            setCurrentView(view);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          language={language}
          onLanguageChange={(newLang) => {
            handleStopSpeech();
            setLanguage(newLang);
            if (currentUser) {
              const updated = { ...currentUser, language: newLang };
              setCurrentUser(updated);
              safeStorage.setItem('farm2door_user_session', JSON.stringify(updated));
            }
          }}
          cartCount={cart.reduce((s, i) => s + i.quantityKg, 0)}
          onOpenCart={() => setIsCartOpen(true)}
          isSpeaking={isSpeakingAudio}
          onStopSpeech={handleStopSpeech}
          currentUser={currentUser}
          onLogout={handleLogout}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onStartSpeech={handleStartSpeech}
          onEndSpeech={handleEndSpeech}
        />
      )}

      {/* Main View Flow */}
      <main id="app-main-content" className="flex-1 flex flex-col">
        
        {/* LANDING PAGE (Hero & 3 Interactive Role Cards) */}
        {currentView === 'landing' && (
          <LandingPage
            onSelectRole={(role) => {
              handleStopSpeech();
              if (role === 'farmer' || role === 'consumer' || role === 'bulk_buyer' || role === 'admin') {
                setSelectedRoleForAuth(role as UserRole);
                setCurrentView('auth');
              } else {
                setCurrentView('role_selection');
              }
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            language={language}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
          />
        )}

        {/* GUEST EXPLORE: PUBLIC MARKETPLACE */}
        {!currentUser && (currentView === 'customer_marketplace' || currentView === 'consumer') && (
          <ConsumerMarketplace
            cart={cart}
            currentUser={null}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {/* GUEST EXPLORE: PUBLIC MARKET INTEL */}
        {!currentUser && (currentView === 'farmer_market_intel' || currentView === 'market_intel') && (
          <MarketIntelligence
            language={language}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
          />
        )}

        {/* GUEST EXPLORE: VOICE AI ASSISTANT */}
        {!currentUser && currentView === 'farmer_voice_hub' && (
          <FarmerDashboard
            language={language}
            onLanguageChange={(newLang) => setLanguage(newLang)}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
            onNavigateToMarketIntel={() => {
              handleStopSpeech();
              setCurrentView('farmer_market_intel');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToProducts={() => {
              handleStopSpeech();
              setCurrentView('role_selection');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToOrders={() => {
              handleStopSpeech();
              setCurrentView('role_selection');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToLogistics={() => {
              handleStopSpeech();
              setCurrentView('farmer_logistics');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToMarketplace={() => {
              handleStopSpeech();
              setCurrentView('customer_marketplace');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onNavigateToHome={() => {
              handleStopSpeech();
              setCurrentView('landing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            activeSection="voice_hub"
          />
        )}

        {/* FIRST SCREEN: ROLE SELECTION (No top nav, clean welcome screen) */}
        {currentView === 'role_selection' && (
          <RoleSelectionScreen
            onSelectRole={handleSelectRole}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
          />
        )}

        {/* ROLE-SPECIFIC LOGIN / SIGN-UP (No top nav) */}
        {currentView === 'auth' && (
          <RoleAuthPage
            role={selectedRoleForAuth}
            onBackToRoleSelection={() => {
              handleStopSpeech();
              setCurrentView('role_selection');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onAuthSuccess={handleAuthSuccess}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
          />
        )}

        {/* ========================================================================= */}
        {/* ADMIN POST-LOGIN VIEWS                                                    */}
        {/* ========================================================================= */}
        {currentUser?.role === 'admin' && (currentView === 'admin_dashboard' || currentView === 'admin') && (
          <AdminDashboard
            currentUser={currentUser}
            onLogout={handleLogout}
          />
        )}

        {/* ========================================================================= */}
        {/* FARMER POST-LOGIN VIEWS                                                   */}
        {/* ========================================================================= */}
        {currentUser?.role === 'farmer' && (currentUser.approvalStatus === 'pending' || currentUser.approvalStatus === 'rejected') && (
          <div className="max-w-xl mx-auto my-16 p-8 bg-white rounded-3xl border border-amber-300 shadow-md text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-800 mx-auto flex items-center justify-center text-3xl mb-4">
              ⏳
            </div>
            <h2 className="text-xl font-bold text-stone-900 mb-2">Farmer Account Awaiting Admin Approval</h2>
            <p className="text-sm text-stone-600 mb-6">
              Your farmer account is currently marked as <strong>{currentUser.approvalStatus}</strong>. You cannot access farmer features until verified and approved by the platform Administrator (naqi).
            </p>
            <button
              onClick={handleLogout}
              className="px-6 py-2.5 rounded-xl bg-stone-900 text-white font-bold text-xs cursor-pointer hover:bg-stone-800 transition-colors"
            >
              Sign Out & Return to Login
            </button>
          </div>
        )}

        {currentUser?.role === 'farmer' && currentUser.approvalStatus !== 'pending' && currentUser.approvalStatus !== 'rejected' && (
          <>
            {/* Farmer Home */}
            {(currentView === 'farmer_home' || currentView === 'farmer') && (
              <FarmerDashboard
                language={language}
                onLanguageChange={(newLang) => {
                  setLanguage(newLang);
                  if (currentUser) {
                    const updated = { ...currentUser, language: newLang };
                    setCurrentUser(updated);
                    safeStorage.setItem('farm2door_user_session', JSON.stringify(updated));
                  }
                }}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
                onNavigateToMarketIntel={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_market_intel');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToProducts={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToOrders={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_orders');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToLogistics={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_logistics');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToMarketplace={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToHome={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                activeSection="home"
              />
            )}

            {/* Farmer Product Management (My Products) */}
            {currentView === 'farmer_products' && (
              <FarmerProductManager
                currentUser={currentUser}
                language={language}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
              />
            )}

            {/* Farmer Orders & Enquiries Management */}
            {currentView === 'farmer_orders' && (
              <FarmerOrdersManager
                currentUser={currentUser}
                language={language}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
              />
            )}

            {/* Farmer Voice Hub */}
            {currentView === 'farmer_voice_hub' && (
              <FarmerDashboard
                language={language}
                onLanguageChange={(newLang) => {
                  setLanguage(newLang);
                  if (currentUser) {
                    const updated = { ...currentUser, language: newLang };
                    setCurrentUser(updated);
                    safeStorage.setItem('farm2door_user_session', JSON.stringify(updated));
                  }
                }}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
                onNavigateToMarketIntel={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_market_intel');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToProducts={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_products');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToOrders={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_orders');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToLogistics={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_logistics');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToMarketplace={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToHome={() => {
                  handleStopSpeech();
                  setCurrentView('farmer_home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                activeSection="voice_hub"
              />
            )}

            {/* Farmer View of Consumer Marketplace */}
            {currentView === 'farmer_marketplace' && (
              <ConsumerMarketplace
                cart={cart}
                currentUser={currentUser}
                onAddToCart={handleAddToCart}
                onOpenCart={() => setIsCartOpen(true)}
              />
            )}

            {/* Farmer Market Intelligence */}
            {(currentView === 'farmer_market_intel' || currentView === 'market_intel') && (
              <MarketIntelligence
                language={language}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
              />
            )}

            {/* Farmer Logistics */}
            {(currentView === 'farmer_logistics' || currentView === 'logistics') && (
              <LogisticsPage
                currentUser={currentUser}
                language={language}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
              />
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* CUSTOMER POST-LOGIN VIEWS                                                 */}
        {/* ========================================================================= */}
        {currentUser?.role === 'consumer' && (
          <>
            {/* Customer Home */}
            {currentView === 'customer_home' && (
              <CustomerHomeView
                onNavigateToMarketplace={() => {
                  handleStopSpeech();
                  setCurrentView('customer_marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onAddToCart={handleAddToCart}
                cart={cart}
                language={language}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
                onViewOrders={() => {
                  handleStopSpeech();
                  setCurrentView('customer_orders');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}

            {/* Customer Marketplace */}
            {(currentView === 'customer_marketplace' || currentView === 'consumer') && (
              <ConsumerMarketplace
                cart={cart}
                currentUser={currentUser}
                onAddToCart={handleAddToCart}
                onOpenCart={() => setIsCartOpen(true)}
              />
            )}

            {/* Customer My Orders */}
            {currentView === 'customer_orders' && (
              <CustomerOrdersView
                language={language}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
                onContinueShopping={() => {
                  handleStopSpeech();
                  setCurrentView('customer_marketplace');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
              />
            )}
          </>
        )}

        {/* ========================================================================= */}
        {/* BULK BUYER POST-LOGIN VIEWS                                               */}
        {/* ========================================================================= */}
        {currentUser?.role === 'bulk_buyer' && (
          <>
            {/* Bulk Buyer Home */}
            {currentView === 'bulk_home' && (
              <BulkBuyerHomeView
                onNavigateToBulkOrders={() => {
                  handleStopSpeech();
                  setCurrentView('bulk_orders');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToMarketIntel={() => {
                  handleStopSpeech();
                  setCurrentView('bulk_market_intel');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                onNavigateToLogistics={() => {
                  handleStopSpeech();
                  setCurrentView('bulk_logistics');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                language={language}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
              />
            )}

            {/* Bulk Marketplace (Wholesale) */}
            {currentView === 'bulk_marketplace' && (
              <ConsumerMarketplace
                cart={cart}
                currentUser={currentUser}
                onAddToCart={handleAddToCart}
                onOpenCart={() => setIsCartOpen(true)}
                bulkMode={true}
              />
            )}

            {/* Bulk Orders */}
            {(currentView === 'bulk_orders' || currentView === 'bulk_buyer') && (
              <BulkBuyerDashboard />
            )}

            {/* Bulk Market Intelligence */}
            {(currentView === 'bulk_market_intel' || currentView === 'market_intel') && (
              <MarketIntelligence
                language={language}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
              />
            )}

            {/* Bulk Logistics */}
            {(currentView === 'bulk_logistics' || currentView === 'logistics') && (
              <LogisticsPage
                currentUser={currentUser}
                language={language}
                onStartSpeech={handleStartSpeech}
                onEndSpeech={handleEndSpeech}
              />
            )}
          </>
        )}

      </main>

      {/* Slide-out Consumer Cart Drawer (Only when customer uses cart) */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        currentUser={currentUser}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />

      {/* User Profile Modal */}
      {isProfileModalOpen && currentUser && (
        <UserProfileModal
          user={currentUser}
          onClose={() => setIsProfileModalOpen(false)}
          onLogout={handleLogout}
          onOpenLanguageSelector={() => {
            setIsProfileModalOpen(false);
            // Language modal can be opened from Navbar or we can toggle
          }}
        />
      )}

    </div>
  );
}
