import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, ChefHat, Star, Globe, Heart } from "lucide-react";

const FeaturedTraditionalRecipeCard: React.FC = () => {
  return (
    <div className="w-full bg-gradient-to-br from-anong-cream via-anong-ivory to-white p-8 rounded-2xl shadow-lg border-2 border-anong-gold/20 mb-12">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 bg-anong-gold/10 px-4 py-2 rounded-full mb-4">
          <Star className="w-5 h-5 text-anong-gold fill-current" />
          <span className="text-anong-deep-green font-semibold">Featured Traditional Recipe</span>
        </div>
        
        <h2 className="text-3xl md:text-4xl font-heading text-anong-black mb-2">
          Traditional Thai Green Curry
        </h2>
        <p className="text-xl text-anong-gold font-thai mb-4">
          แกงเขียวหวานไก่
        </p>
        
        <p className="text-lg text-anong-charcoal/80 max-w-2xl mx-auto leading-relaxed">
          Discover the authentic royal recipe with rich cultural heritage, traditional cooking wisdom, 
          and the sacred ingredients that make this Thailand's most beloved curry.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 items-center">
        <div className="relative">
          <div className="aspect-[4/3] bg-gradient-to-br from-anong-deep-green to-anong-sage rounded-xl overflow-hidden relative">
            {/* Decorative Thai Pattern Overlay */}
            <div className="absolute inset-0 thai-pattern-bg opacity-20"></div>
            
            {/* Recipe Preview Content */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white p-6">
                <Globe className="w-16 h-16 mx-auto mb-4 text-anong-gold" />
                <h3 className="text-2xl font-heading mb-2">Cultural Heritage Recipe</h3>
                <p className="text-sm opacity-90">
                  From Royal Thai Kitchens to Your Table
                </p>
              </div>
            </div>
            
            {/* Special Badge */}
            <div className="absolute top-4 right-4">
              <Badge className="bg-anong-gold text-anong-black font-semibold">
                Royal Cuisine
              </Badge>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2 bg-white/60 p-3 rounded-lg">
              <Users className="w-5 h-5 text-anong-deep-green" />
              <span className="text-sm font-medium">4 Servings</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 p-3 rounded-lg">
              <Clock className="w-5 h-5 text-anong-deep-green" />
              <span className="text-sm font-medium">45 Minutes</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 p-3 rounded-lg">
              <ChefHat className="w-5 h-5 text-anong-deep-green" />
              <span className="text-sm font-medium">Medium</span>
            </div>
            <div className="flex items-center gap-2 bg-white/60 p-3 rounded-lg">
              <Heart className="w-5 h-5 text-anong-deep-green" />
              <span className="text-sm font-medium">Traditional</span>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-anong-deep-green mb-3">What Makes This Special:</h4>
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-anong-gold rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-anong-charcoal">Royal court cooking techniques from Ayutthaya period</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-anong-gold rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-anong-charcoal">Cultural stories behind each sacred ingredient</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-anong-gold rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-anong-charcoal">Traditional wisdom from Thai grandmothers</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-anong-gold rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-anong-charcoal">Regional variations across Thailand</p>
              </div>
            </div>
          </div>

          <Link
            to="/traditional-green-curry"
            className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-anong-gold to-anong-warm-yellow hover:from-anong-warm-yellow hover:to-anong-gold text-anong-black font-semibold py-4 px-8 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl anong-hover-lift group"
          >
            <Globe className="w-5 h-5 group-hover:rotate-6 transition-transform duration-300" />
            Discover the Cultural Recipe
            <span className="text-sm opacity-80 ml-1">→</span>
          </Link>

          <div className="flex flex-wrap gap-2 justify-center">
            <Badge variant="outline" className="border-anong-gold/30 text-anong-deep-green">
              Authentic
            </Badge>
            <Badge variant="outline" className="border-anong-gold/30 text-anong-deep-green">
              Cultural Heritage
            </Badge>
            <Badge variant="outline" className="border-anong-gold/30 text-anong-deep-green">
              Royal Cuisine
            </Badge>
            <Badge variant="outline" className="border-anong-gold/30 text-anong-deep-green">
              Traditional Wisdom
            </Badge>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedTraditionalRecipeCard;