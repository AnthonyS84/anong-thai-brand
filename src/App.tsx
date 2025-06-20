import React, { Suspense } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from './contexts/LanguageContext';
import { CurrencyProvider } from './contexts/CurrencyContext';
import { CartProvider } from './contexts/CartContext';
import { AuthProvider } from './hooks/useAuth';
import './utils/errorHandler'; // Global error handling for cleaner console

// Faster loading component
const QuickLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-anong-ivory">
    <div className="text-center">
      <div className="w-6 h-6 border-2 border-anong-gold border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
      <p className="text-anong-charcoal text-xs">Loading...</p>
    </div>
  </div>
);

// CRITICAL routes - load immediately (no lazy loading for better UX)
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Shop from "./pages/Shop";
import About from "./pages/About";

// STANDARD routes - lazy load but with higher priority
const Menu = React.lazy(() => import("./pages/Menu"));
const Contact = React.lazy(() => import("./pages/Contact"));
const Recipes = React.lazy(() => import("./pages/Recipes"));
const RecipeDetail = React.lazy(() => import("./pages/RecipeDetail"));
const ProductDetailPage = React.lazy(() => import("./pages/ProductDetailPage"));
const CartPage = React.lazy(() => import("./pages/CartPage"));

// USER AREA routes - lazy load
const Account = React.lazy(() => import("./pages/Account"));
const Profile = React.lazy(() => import("./pages/Profile"));
const Orders = React.lazy(() => import("./pages/Orders"));
const OrderDetailsPage = React.lazy(() => import("./pages/OrderDetailsPage"));
const Settings = React.lazy(() => import("./pages/Settings"));
const AuthPage = React.lazy(() => import("./pages/AuthPage"));

// HEAVY routes - most aggressive lazy loading
const Checkout = React.lazy(() => import("./pages/Checkout"));
const AdminPage = React.lazy(() => import("./pages/AdminPage"));
const AdminSetupPage = React.lazy(() => import("./pages/AdminSetupPage"));
const CreateCustomerPage = React.lazy(() => import("./pages/CreateCustomerPage"));

// SECONDARY routes - lazy load
const Events = React.lazy(() => import("./pages/Events"));
const Shipping = React.lazy(() => import("./pages/Shipping"));
const Returns = React.lazy(() => import("./pages/Returns"));
const Privacy = React.lazy(() => import("./pages/Privacy"));
const Terms = React.lazy(() => import("./pages/Terms"));

// Heavy features - load on demand but not blocking
const ChatBot = React.lazy(() => 
  import('./components/chatbot/ChatBot').catch(() => ({ default: () => null }))
);
const PerformanceMonitor = React.lazy(() => 
  import('./components/PerformanceMonitor').catch(() => ({ default: () => null }))
);

// Route wrapper with faster fallback
const LazyRoute = ({ children }: { children: React.ReactNode }) => (
  <Suspense fallback={<QuickLoader />}>
    {children}
  </Suspense>
);

// Optimized query client with better defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 3 * 60 * 1000, // 3 minutes
      refetchOnWindowFocus: false,
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) return false;
        return failureCount < 1; // Faster failure for better UX
      },
      refetchOnMount: false, // Reduce unnecessary refetches
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <LanguageProvider>
          <CurrencyProvider>
            <CartProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter>
                  <Routes>
                    {/* Critical routes - NO lazy loading for best performance */}
                    <Route path="/" element={<Index />} />
                    <Route path="/shop" element={<Shop />} />
                    <Route path="/about" element={<About />} />
                    <Route path="*" element={<NotFound />} />
                    
                    {/* Standard routes - optimized lazy loading */}
                    <Route path="/menu" element={<LazyRoute><Menu /></LazyRoute>} />
                    <Route path="/contact" element={<LazyRoute><Contact /></LazyRoute>} />
                    <Route path="/events" element={<LazyRoute><Events /></LazyRoute>} />
                    
                    {/* Recipe routes */}
                    <Route path="/recipes" element={<LazyRoute><Recipes /></LazyRoute>} />
                    <Route path="/recipes/:id" element={<LazyRoute><RecipeDetail /></LazyRoute>} />
                    <Route path="/recipe/:id" element={<LazyRoute><RecipeDetail /></LazyRoute>} />
                    
                    {/* Product routes */}
                    <Route path="/product/:id" element={<LazyRoute><ProductDetailPage /></LazyRoute>} />
                    <Route path="/cart" element={<LazyRoute><CartPage /></LazyRoute>} />
                    
                    {/* User account routes */}
                    <Route path="/account" element={<LazyRoute><Account /></LazyRoute>} />
                    <Route path="/profile" element={<LazyRoute><Profile /></LazyRoute>} />
                    <Route path="/orders" element={<LazyRoute><Orders /></LazyRoute>} />
                    <Route path="/orders/:id" element={<LazyRoute><OrderDetailsPage /></LazyRoute>} />
                    <Route path="/settings" element={<LazyRoute><Settings /></LazyRoute>} />
                    
                    {/* Auth routes */}
                    <Route path="/auth" element={<LazyRoute><AuthPage /></LazyRoute>} />
                    
                    {/* Heavy routes - aggressive lazy loading */}
                    <Route path="/checkout" element={<LazyRoute><Checkout /></LazyRoute>} />
                    <Route path="/admin" element={<LazyRoute><AdminPage /></LazyRoute>} />
                    <Route path="/admin-setup" element={<LazyRoute><AdminSetupPage /></LazyRoute>} />
                    <Route path="/create-customer" element={<LazyRoute><CreateCustomerPage /></LazyRoute>} />
                    
                    {/* Legal routes */}
                    <Route path="/shipping" element={<LazyRoute><Shipping /></LazyRoute>} />
                    <Route path="/returns" element={<LazyRoute><Returns /></LazyRoute>} />
                    <Route path="/privacy" element={<LazyRoute><Privacy /></LazyRoute>} />
                    <Route path="/terms" element={<LazyRoute><Terms /></LazyRoute>} />
                  </Routes>
                  
                  {/* Non-blocking features */}
                  <Suspense fallback={null}>
                    <ChatBot />
                  </Suspense>
                  <Suspense fallback={null}>
                    <PerformanceMonitor />
                  </Suspense>
                </BrowserRouter>
              </TooltipProvider>
            </CartProvider>
          </CurrencyProvider>
        </LanguageProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
