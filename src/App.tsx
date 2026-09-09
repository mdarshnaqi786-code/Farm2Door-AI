import React, { useState } from 'react';
import { AppView, LanguageCode, CartItem, FarmerProduct } from './types';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { FarmerDashboard } from './components/FarmerDashboard';
import { ConsumerMarketplace } from './components/ConsumerMarketplace';
import { CartDrawer } from './components/CartDrawer';
import { BulkBuyerDashboard } from './components/BulkBuyerDashboard';
import { MarketIntelligence } from './components/MarketIntelligence';
import { LogisticsPage } from './components/LogisticsPage';
import { stopSpeech } from './utils/speech';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [isSpeakingAudio, setIsSpeakingAudio] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Consumer Cart
  const [cart, setCart] = useState<CartItem[]>([
    // Start with a small sample item to show immediate value
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
      {/* Primary Sticky Header Navigation */}
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
        }}
        cartCount={cart.reduce((s, i) => s + i.quantityKg, 0)}
        onOpenCart={() => setIsCartOpen(true)}
        isSpeaking={isSpeakingAudio}
        onStopSpeech={handleStopSpeech}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            onSelectRole={(role) => {
              handleStopSpeech();
              setCurrentView(role);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            language={language}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
          />
        )}

        {currentView === 'farmer' && (
          <FarmerDashboard
            language={language}
            onLanguageChange={setLanguage}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
            onNavigateToMarketIntel={() => {
              handleStopSpeech();
              setCurrentView('market_intel');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {currentView === 'consumer' && (
          <ConsumerMarketplace
            cart={cart}
            onAddToCart={handleAddToCart}
            onOpenCart={() => setIsCartOpen(true)}
          />
        )}

        {currentView === 'bulk_buyer' && (
          <BulkBuyerDashboard />
        )}

        {currentView === 'market_intel' && (
          <MarketIntelligence
            language={language}
            onStartSpeech={handleStartSpeech}
            onEndSpeech={handleEndSpeech}
          />
        )}

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
