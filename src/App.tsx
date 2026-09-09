import React, { useState, useEffect } from 'react';
import { AppView, LanguageCode, CartItem, FarmerProduct, UserRole, UserAccount } from './types';
import { Navbar } from './components/Navbar';
import { RoleSelectionScreen } from './components/RoleSelectionScreen';
import { RoleAuthPage } from './components/RoleAuthPage';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ConsumerMarketplace } from './components/ConsumerMarketplace';
import { CartDrawer } from './components/CartDrawer';
import { BulkBuyerDashboard } from './components/BulkBuyerDashboard';
import { MarketIntelligence } from './components/MarketIntelligence';
import { LogisticsPage } from './components/LogisticsPage';
import { stopSpeech } from './utils/speech';

export default function App() {
  // Application starts strictly at Role Selection screen as requested
  const [currentView, setCurrentView] = useState<AppView>('role_selection');
  const [selectedRoleForAuth, setSelectedRoleForAuth] = useState<UserRole>('farmer');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Active User session in LocalStorage
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Initialize session from LocalStorage
  useEffect(() => {
    try {
      const savedSession = localStorage.getItem('farm2door_user_session');
      if (savedSession) {
        const user: UserAccount = JSON.parse(savedSession);
        setCurrentUser(user);
        if (user.language) {
          setLanguage(user.language);
        }
      }
    } catch (e) {
      console.warn('Failed to load user session from local storage:', e);
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
        grade: 'Grade A',
        pricePerKg: 34,
        farmerShare: 27,
        logisticsShare: 4.5,
        platformShare: 2.5,
        availableKg: 850,
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

  // Step 2 & 3: User logs in or creates account with language selection
  const handleAuthSuccess = (account: UserAccount) => {
    handleStopSpeech();
    setCurrentUser(account);
    if (account.language) {
      setLanguage(account.language);
    }

    // Automatically redirect based on selected role
    if (account.role === 'farmer') {
      setCurrentView('farmer');
    } else if (account.role === 'consumer') {
      setCurrentView('consumer');
    } else if (account.role === 'bulk_buyer') {
      setCurrentView('bulk_buyer');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Logout returns user to Role Selection page
  const handleLogout = () => {
    handleStopSpeech();
    try {
      localStorage.removeItem('farm2door_user_session');
    } catch (e) {
      console.warn('Failed to remove session:', e);
    }
    setCurrentUser(null);
    setCurrentView('role_selection');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Switch Role option for demonstration purposes
  const handleSwitchRole = () => {
    handleStopSpeech();
    setCurrentView('role_selection');
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

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 flex flex-col font-sans">
      {/* Sticky Navigation Header */}
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
            localStorage.setItem('farm2door_user_session', JSON.stringify(updated));
          }
        }}
        cartCount={cart.reduce((s, i) => s + i.quantityKg, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        isSpeaking={isSpeakingAudio}
        onStopSpeech={handleStopSpeech}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchRole={handleSwitchRole}
        onStartSpeech={handleStartSpeech}
        onEndSpeech={handleEndSpeech}
      />

      {/* Main View Flow */}
      <main className="flex-1">
        {/* FIRST SCREEN: ROLE SELECTION */}
        {currentView === 'role_selection' && (
          <RoleSelectionScreen
            onSelectRole={handleSelectRole}
            onExplorePublicView={(view) => {
              handleStopSpeech();
              setCurrentView(view);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
          />
        )}

        {/* ROLE-SPECIFIC LOGIN / SIGN-UP PAGE */}
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

        {/* FARMER VOICE-FIRST DASHBOARD */}
        {currentView === 'farmer' && (
          <FarmerDashboard
            language={language}
            onLanguageChange={(newLang) => {
              setLanguage(newLang);
              if (currentUser) {
                const updated = { ...currentUser, language: newLang };
                setCurrentUser(updated);
                localStorage.setItem('farm2door_user_session', JSON.stringify(updated));
              }
            }}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
            onNavigateToMarketIntel={() => {
              handleStopSpeech();
              setCurrentView('market_intel');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* CONSUMER MARKETPLACE */}
        {currentView === 'consumer' && (
          <ConsumerMarketplace
            cart={cart}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {/* BULK BUYER DASHBOARD */}
        {currentView === 'bulk_buyer' && (
          <BulkBuyerDashboard />
        )}

        {/* MARKET INTELLIGENCE & APMC MANDI FORECASTS */}
        {currentView === 'market_intel' && (
          <MarketIntelligence
            language={language}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
          />
        )}

        {/* LOGISTICS & FLEET ROUTING */}
        {currentView === 'logistics' && (
          <LogisticsPage />
        )}
      </main>

      {/* Slide-out Consumer Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
      />
    </div>
  );
}
