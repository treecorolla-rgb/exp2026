import React from 'react';
import { useStore } from './context/StoreContext';
import { StoreProvider } from './context/StoreContext';
import { TopBar } from './components/TopBar';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetails } from './components/ProductDetails';
import { Cart } from './components/Cart';
import { AdminDashboard } from './components/AdminDashboard';
import { AdminLogin } from './components/AdminLogin';
import { CustomerAuth } from './components/CustomerAuth';
import { Footer } from './components/Footer';
import { NotFound } from './components/NotFound';
import { FAQ } from './components/FAQ';
import { CallbackModal } from './components/CallbackModal';
import { FloatingChat } from './components/FloatingChat';
import { MobileHeader, MobileBottomNav } from './components/MobileLayout';

function AppContent() {
  const { currentView, isMobile, isLoading } = useStore();

  // Show loading screen while fetching data from Supabase
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <img 
            src="https://vdhgagzaeyvrsthxsbxn.supabase.co/storage/v1/object/public/images/favicon1.png" 
            alt="Loading..." 
            className="w-20 h-20 mx-auto mb-4 animate-pulse"
          />
          <p className="text-slate-500">Loading...</p>
        </div>
      </div>
    );
  }

  // If in Admin Dashboard view, render the full screen dashboard
  if (currentView === 'admin_dashboard') {
     return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans relative">
      
      {/* --- DESKTOP HEADER LAYOUT --- */}
      {!isMobile && (
        <>
          <TopBar />
          <Header />
        </>
      )}

      {/* --- MOBILE HEADER LAYOUT --- */}
      {isMobile && currentView !== 'login' && currentView !== 'customer_auth' && (
        <MobileHeader />
      )}

      {/* --- MAIN CONTENT AREA --- */}
      <div className={`max-w-[1300px] mx-auto w-full px-4 flex-1 flex flex-col md:flex-row gap-8 ${isMobile ? 'py-4' : 'py-8'}`}>
        
        {/* Sidebar (Desktop Only for now, or could be part of product grid) */}
        {!isMobile && currentView !== 'login' && currentView !== 'customer_auth' && currentView !== 'not_found' && currentView !== 'cart' && currentView !== 'faq' && (
           <Sidebar />
        )}
        
        {currentView === 'grid' && (
          <ProductGrid />
        )}

        {currentView === 'details' && (
          <ProductDetails />
        )}

        {currentView === 'cart' && (
          <Cart />
        )}

        {currentView === 'login' && (
          <div className="flex-1">
             <AdminLogin />
          </div>
        )}

        {currentView === 'customer_auth' && (
          <CustomerAuth />
        )}

        {currentView === 'not_found' && (
           <NotFound />
        )}

        {currentView === 'faq' && (
           <FAQ />
        )}
      </div>

      {/* --- FOOTER (Hidden on mobile if it clutters, but requested to keep structure mostly same) --- */}
      {!isMobile && <Footer />}
      {/* Simple Footer for Mobile if needed, or just padding for bottom nav */}
      {isMobile && <div className="pb-24"></div>} 

      {/* --- MOBILE BOTTOM NAV --- */}
      {isMobile && (
        <MobileBottomNav />
      )}
      
      {/* Overlays */}
      <CallbackModal />
      <FloatingChat />
    </div>
  );
}

const App: React.FC = () => {
  return (
    <StoreProvider>
      <AppContent />
    </StoreProvider>
  );
};

export default App;