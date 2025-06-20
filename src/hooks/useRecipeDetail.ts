import { useState, useEffect, useMemo } from "react";
import { loadRecipeDetail } from "@/data/recipesMeta";
import { products } from "@/data/products";
import { Recipe } from "@/types";

export const useRecipeDetail = (id: string | undefined) => {
  const [isLoading, setIsLoading] = useState(true);
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  
  // Load recipe data asynchronously for better performance
  useEffect(() => {
    if (!id) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    
    // Use the optimized loader
    loadRecipeDetail(id).then((foundRecipe) => {
      if (foundRecipe) {
        console.log('Found recipe via lazy loading:', foundRecipe.id);
        setRecipe(foundRecipe);
      } else {
        console.log('No recipe found for ID:', id);
        setRecipe(null);
      }
      setIsLoading(false);
    }).catch((error) => {
      console.error('Error loading recipe:', error);
      setRecipe(null);
      setIsLoading(false);
    });

    // Scroll to top when recipe changes
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
  }, [id]);
  
  const relatedProducts = useMemo(() => {
    if (!recipe) return [];
    
    console.log('Recipe related products:', recipe.relatedProducts);
    const matchedProducts = products.filter(product => 
      recipe.relatedProducts.includes(product.id)
    );
    console.log('Matched products:', matchedProducts.map(p => p.id));
    return matchedProducts;
  }, [recipe]);

  return {
    recipe,
    relatedProducts,
    isLoading
  };
};
