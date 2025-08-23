import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Users, ChefHat, Globe, Heart, Star } from "lucide-react";
import { greenCurryRecipe } from "@/data/recipes";

const TraditionalThaiGreenCurry: React.FC = () => {
  const [language, setLanguage] = useState<'en' | 'th'>('en');
  const recipe = greenCurryRecipe;

  const LanguageToggle = () => (
    <div className="flex items-center space-x-2 mb-4">
      <button
        onClick={() => setLanguage('en')}
        className={`px-3 py-1 rounded-md ${language === 'en' ? 'bg-anong-gold text-white' : 'bg-gray-200'}`}
      >
        English
      </button>
      <button
        onClick={() => setLanguage('th')}
        className={`px-3 py-1 rounded-md ${language === 'th' ? 'bg-anong-gold text-white' : 'bg-gray-200'}`}
      >
        ภาษาไทย
      </button>
    </div>
  );

  const RecipeHeader = () => (
    <div className="relative bg-gradient-to-r from-anong-deep-green to-anong-sage text-white rounded-lg p-8 mb-8">
      <div className="absolute top-4 right-4">
        <LanguageToggle />
      </div>
      
      <div className="max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">
          {recipe.englishName}
        </h1>
        <p className="text-2xl text-anong-gold mb-4 font-thai">
          {recipe.thaiName}
        </p>
        
        <p className="text-lg opacity-90 mb-6">
          {recipe.shortDescription}
        </p>

        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            <span>Serves {recipe.servingInfo.serves}</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <span>{recipe.servingInfo.totalTime} mins</span>
          </div>
          <div className="flex items-center gap-2">
            <ChefHat className="w-5 h-5" />
            <span>{recipe.servingInfo.difficulty}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {recipe.tags.map((tag, index) => (
            <Badge key={index} variant="secondary" className="bg-anong-gold/20 text-anong-gold border-anong-gold">
              {tag}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );

  const CulturalBackground = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-anong-deep-green" />
          Cultural Heritage
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-xl font-semibold mb-3 text-anong-deep-green">Cultural Background</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {recipe.culturalBackground}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-anong-deep-green">Historical Origins</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {recipe.historicalOrigins}
          </p>
        </div>

        <div>
          <h3 className="text-xl font-semibold mb-3 text-anong-deep-green">Cultural Significance</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {recipe.culturalSignificance}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const IngredientsWithCulture = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-anong-charcoal" />
          Sacred Ingredients & Their Stories
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          {recipe.ingredients.map((ingredient, index) => (
            <div key={index} className="border-l-4 border-anong-gold pl-4">
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-semibold text-lg">
                  {ingredient.name}
                </h4>
                <span className="text-anong-sage font-medium">
                  {ingredient.amount}
                </span>
              </div>
              
              {ingredient.thaiName && (
                <p className="text-anong-deep-green font-thai text-lg mb-2">
                  {ingredient.thaiName}
                </p>
              )}
              
              <p className="text-gray-700 mb-2 italic">
                {ingredient.culturalSignificance}
              </p>
              
              {ingredient.substitution && (
                <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                  <strong>Traditional Substitution:</strong> {ingredient.substitution}
                </p>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const CookingInstructions = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ChefHat className="w-6 h-6 text-anong-gold" />
          Traditional Cooking Method
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recipe.instructions.map((step, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 bg-anong-gold text-white rounded-full flex items-center justify-center font-bold">
                {index + 1}
              </div>
              <p className="text-gray-700 leading-relaxed pt-1">
                {step}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const CookingTips = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-6 h-6 text-anong-charcoal" />
          Traditional Wisdom & Cooking Tips
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {recipe.cookingTips.map((tip, index) => (
            <div key={index} className="bg-gradient-to-r from-anong-ivory to-white p-4 rounded-lg border-l-4 border-anong-gold">
              <h4 className="font-semibold text-lg mb-2 text-anong-deep-green">
                {tip.step}
              </h4>
              <div className="space-y-3">
                <div>
                  <p className="font-medium text-anong-sage mb-1">Cultural Context:</p>
                  <p className="text-gray-700 italic">
                    {tip.culturalContext}
                  </p>
                </div>
                <div>
                  <p className="font-medium text-anong-charcoal mb-1">Traditional Method:</p>
                  <p className="text-gray-700">
                    {tip.traditionalMethod}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const RegionalVariations = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="w-6 h-6 text-anong-sage" />
          Regional Variations Across Thailand
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          {recipe.regionalVariations.map((variation, index) => (
            <div key={index} className="bg-gradient-to-br from-anong-ivory to-white p-4 rounded-lg border-2 border-anong-gold/20">
              <h4 className="font-semibold text-lg mb-2 text-anong-deep-green">
                {variation.region}
              </h4>
              <p className="text-gray-700 mb-3">
                {variation.variation}
              </p>
              <div className="bg-anong-gold/10 p-3 rounded">
                <p className="text-sm font-medium text-anong-sage mb-1">Cultural Significance:</p>
                <p className="text-sm text-gray-600">
                  {variation.significance}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );

  const ServingTradition = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-6 h-6 text-anong-charcoal" />
          Serving Traditions & Philosophy
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-3 text-anong-deep-green">Serving Traditions</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {recipe.servingTraditions}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-anong-deep-green">Nutritional Philosophy</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {recipe.nutritionalPhilosophy}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-3 text-anong-deep-green">Seasonal Context</h3>
          <p className="text-gray-700 leading-relaxed whitespace-pre-line">
            {recipe.seasonalContext}
          </p>
        </div>
      </CardContent>
    </Card>
  );

  const TraditionalPairing = () => (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Traditional Pairings & Accompaniments</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="rice" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rice">Rice</TabsTrigger>
            <TabsTrigger value="sides">Side Dishes</TabsTrigger>
            <TabsTrigger value="beverages">Beverages</TabsTrigger>
          </TabsList>
          
          <TabsContent value="rice" className="mt-4">
            <div className="space-y-3">
              {recipe.pairing.rice.map((item, index) => (
                <div key={index} className="bg-anong-ivory p-3 rounded-lg">
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="sides" className="mt-4">
            <div className="space-y-3">
              {recipe.pairing.sides.map((item, index) => (
                <div key={index} className="bg-anong-ivory p-3 rounded-lg">
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="beverages" className="mt-4">
            <div className="space-y-3">
              {recipe.pairing.beverages.map((item, index) => (
                <div key={index} className="bg-anong-ivory p-3 rounded-lg">
                  <p className="text-gray-700">{item}</p>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <RecipeHeader />
      
      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <CulturalBackground />
          <CookingInstructions />
          <CookingTips />
          <RegionalVariations />
          <ServingTradition />
          <TraditionalPairing />
        </div>
        
        <div className="space-y-8">
          <IngredientsWithCulture />
          
          <Card>
            <CardHeader>
              <CardTitle>Recipe Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-anong-ivory rounded">
                <span className="font-medium">Prep Time:</span>
                <span>{recipe.servingInfo.prepTime} minutes</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-anong-ivory rounded">
                <span className="font-medium">Cook Time:</span>
                <span>{recipe.servingInfo.cookTime} minutes</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-anong-ivory rounded">
                <span className="font-medium">Total Time:</span>
                <span>{recipe.servingInfo.totalTime} minutes</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-anong-ivory rounded">
                <span className="font-medium">Difficulty:</span>
                <span>{recipe.servingInfo.difficulty}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TraditionalThaiGreenCurry;