import React from 'react';
import TraditionalThaiGreenCurry from '@/components/recipe/TraditionalThaiGreenCurry';
import NavigationBanner from '@/components/layout/NavigationBanner';
import Footer from '@/components/layout/Footer';

const TraditionalGreenCurryPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-anong-ivory">
      <NavigationBanner />
      <main className="anong-section">
        <TraditionalThaiGreenCurry />
      </main>
      <Footer />
    </div>
  );
};

export default TraditionalGreenCurryPage;