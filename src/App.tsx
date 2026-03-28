import { useEffect, useState } from "react";
import ScrollToTop from "./components/ScrollToTop";
import AdminLogin from "./components/AdminLogin";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./components/AdminDashboard";
import MenuManagement from "./components/MenuManagement";
import OrderManagement from "./components/OrderManagement";
import ReservationManagement from "./components/ReservationManagement";
import SlideManagement from "./components/SlideManagement";

// Client Components
import ClientLayout from "./components/ClientLayout";
import ClientHome from "./components/ClientHome";
import ClientMenu from "./components/ClientMenu";
import ClientCart from "./components/ClientCart";
import ClientReservation from "./components/ClientReservation";
import ClientAuth from "./components/ClientAuth";
import ClientHistory from "./components/ClientHistory";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentFailure from "./pages/PaymentFailure";
import { CartProvider } from "./context/CartContext";

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'client' | 'admin'>('client');
  const [clientPage, setClientPage] = useState('home');
  const [secretBuffer, setSecretBuffer] = useState('');
  const [showAdminLogin, setShowAdminLogin] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only track alphanumeric keys
      if (!/^[a-zA-Z0-9]$/.test(e.key)) return;
      
      const newBuffer = (secretBuffer + e.key.toLowerCase()).slice(-5);
      setSecretBuffer(newBuffer);
      
      if (newBuffer === 'admin') {
        if (!user || user.role !== 'admin') {
          setShowAdminLogin(true);
        } else {
          setView('admin');
        }
        setSecretBuffer('');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [secretBuffer, user]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path === '/paiement/succes') {
      setClientPage('payment-success');
    } else if (path === '/paiement/echec') {
      setClientPage('payment-failure');
    } else if (path === '/admin') {
      setView('admin');
    }

    const savedUser = localStorage.getItem('user');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedUser !== 'undefined' && savedToken && savedToken !== 'undefined') {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setToken(savedToken);
        // If user is admin, default to admin view
        if (parsedUser.role === 'admin') {
          setView('admin');
        }
      } catch (e) {
        console.error('[App] Failed to parse saved user:', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    setIsAuthReady(true);
  }, []);

  const handleLogin = (newToken: string, newUser: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
    setShowAdminLogin(false);
    if (newUser.role === 'admin') {
      setView('admin');
    } else {
      setView('client');
      setClientPage('home');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setView('client');
    setClientPage('home');
  };

  if (!isAuthReady) return null;

  // Admin View
  if (view === 'admin') {
    if (!token || !user || user.role !== 'admin') {
      return (
        <>
          <ScrollToTop activePage={clientPage} activeTab={activeTab} />
          <AdminLogin onLogin={handleLogin} />
        </>
      );
    }

    const renderAdminContent = () => {
      switch (activeTab) {
        case 'dashboard': return <AdminDashboard />;
        case 'menu': return <MenuManagement />;
        case 'orders': return <OrderManagement />;
        case 'reservations': return <ReservationManagement />;
        case 'slides': return <SlideManagement />;
        default: return <AdminDashboard />;
      }
    };

    return (
      <AdminLayout 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onLogout={handleLogout}
        user={user}
      >
        <ScrollToTop activePage={clientPage} activeTab={activeTab} />
        {renderAdminContent()}
      </AdminLayout>
    );
  }

  // Client View
  const renderClientContent = () => {
    switch (clientPage) {
      case 'home': return <ClientHome onNavigate={setClientPage} />;
      case 'menu': return <ClientMenu />;
      case 'cart': return <ClientCart onNavigate={setClientPage} user={user} />;
      case 'reservation': return <ClientReservation onNavigate={setClientPage} user={user} />;
      case 'payment-success': return <PaymentSuccess />;
      case 'payment-failure': return <PaymentFailure />;
      default: return <ClientHome onNavigate={setClientPage} />;
    }
  };

  return (
    <CartProvider>
      <ScrollToTop activePage={clientPage} activeTab={activeTab} />
      <ClientLayout 
        activePage={clientPage} 
        setActivePage={setClientPage}
        user={user}
        onLogout={handleLogout}
      >
        {renderClientContent()}
      </ClientLayout>

      {showAdminLogin && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-md">
            <button 
              onClick={() => setShowAdminLogin(false)}
              className="absolute -top-12 right-0 text-white/60 hover:text-white text-sm uppercase tracking-widest font-sans font-bold"
            >
              Fermer [ESC]
            </button>
            <AdminLogin onLogin={handleLogin} />
          </div>
        </div>
      )}
    </CartProvider>
  );
}
