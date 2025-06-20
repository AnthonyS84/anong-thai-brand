
import React from 'react';
import NavigationBanner from '@/components/layout/NavigationBanner';
import HeroBanner from '@/components/home/HeroBanner';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import BrandStory from '@/components/home/BrandStory';
import EventsBanner from '@/components/events/EventsBanner';
import RestaurantBanner from '@/components/RestaurantBanner';
import Footer from '@/components/layout/Footer';

const Index = () => {
  return (
    <div className="min-h-screen">
      <NavigationBanner />
      <HeroBanner />
      <FeaturedProducts />
      <BrandStory />
      <EventsBanner />
      <RestaurantBanner />
      <Footer />
    </div>
  );
};

export default Index;
