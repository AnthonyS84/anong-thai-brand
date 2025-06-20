
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { toast } from "@/hooks/use-toast";
import SearchOverlay from '@/components/navigation/SearchOverlay';
import MobileMenu from '@/components/navigation/MobileMenu';
import LogoSection from '@/components/navigation/LogoSection';
import DesktopNav from '@/components/navigation/DesktopNav';
import RightActions from '@/components/navigation/RightActions';
import { navigationTranslations } from '@/translations/navigation';

const NavigationBanner = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { user, signOut, mfaPending } = useAuth();
  const currentPath = location.pathname;
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
    if (isSearchOpen) {
      setSearchQuery('');
    }
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const handleLogout = async () => {
    try {
      console.log('🔄 NavigationBanner: Starting logout');
      await signOut();
      console.log('✅ NavigationBanner: Logout successful');
      
      toast({
        title: t.logoutSuccess || 'Successfully logged out',
      });
      
      navigate('/');
      
    } catch (error: any) {
      console.error('❌ NavigationBanner: Logout error:', error);
      
      toast({
        title: 'Logged out successfully',
        description: 'You have been logged out of your account',
      });
      
      navigate('/');
    }
  };

  const handleMobileLogin = () => {
    // Handled by Link to /account in MobileMenu
  };
  
  const t = navigationTranslations[language];

  const navItems = [
    { path: '/', label: t.home },
    { path: '/shop', label: t.shop },
    { path: '/about', label: language === 'en' ? 'About Anong' : 'เกี่ยวกับอนงค์' },
    { path: '/recipes', label: t.recipes },
    { path: '/contact', label: t.contact },
  ];

  const mobileTranslations = {
    ...t,
    account: t.account || (language === 'en' ? 'Account' : 'บัญชี'),
    orders: t.orders || (language === 'en' ? 'Orders' : 'คำสั่งซื้อ'),
    settings: t.settings || (language === 'en' ? 'Settings' : 'การตั้งค่า'),
  };

  // Redirect to auth if MFA is pending
  useEffect(() => {
    if (mfaPending && currentPath !== '/auth') {
      navigate("/auth", { replace: true });
    }
  }, [mfaPending, currentPath, navigate]);

  const isLoggedIn = !!user && !mfaPending;

  return (
    <div className="bg-anong-black nav-premium sticky top-0 z-40 border-b border-anong-gold/20">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center">
            <LogoSection />
            <DesktopNav navItems={navItems} />
          </div>

          <RightActions
            language={language}
            isLoggedIn={isLoggedIn}
            isMenuOpen={isMenuOpen}
            onToggleLanguage={toggleLanguage}
            onToggleSearch={toggleSearch}
            onToggleMenu={toggleMenu}
            onLogout={handleLogout}
            translations={mobileTranslations}
          />
        </div>

        <SearchOverlay 
          isOpen={isSearchOpen}
          searchQuery={searchQuery}
          onSearchChange={(e) => setSearchQuery(e.target.value)}
          onClear={handleClearSearch}
          onClose={toggleSearch}
          translations={mobileTranslations}
        />
      </div>
      
      <MobileMenu 
        isOpen={isMenuOpen}
        navItems={navItems}
        isLoggedIn={isLoggedIn}
        onMenuItemClick={() => setIsMenuOpen(false)}
        onSearchClick={toggleSearch}
        onLoginClick={handleMobileLogin}
        onLogoutClick={handleLogout}
        translations={mobileTranslations}
      />
    </div>
  );
};

export default NavigationBanner;
