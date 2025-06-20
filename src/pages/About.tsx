
import { useLanguage } from "@/contexts/LanguageContext";
import NavigationBanner from "@/components/layout/NavigationBanner";
import Footer from "@/components/layout/Footer";
import AboutContent from "@/components/about/AboutContent";
import { useEffect } from "react";

const About = () => {
  const { language } = useLanguage();
  
  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);
  
  return (
    <div className="min-h-screen flex flex-col">
      <NavigationBanner />
      
      <main className="flex-grow">
        <AboutContent />
      </main>
      
      <Footer />
    </div>
  );
};

export default About;
