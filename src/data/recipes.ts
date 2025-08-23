export interface Ingredient {
  name: string;
  thaiName?: string;
  amount: string;
  culturalSignificance?: string;
  substitution?: string;
}

export interface CookingTip {
  step: string;
  culturalContext: string;
  traditionalMethod: string;
}

export interface RegionalVariation {
  region: string;
  variation: string;
  significance: string;
}

export interface ServingInfo {
  serves: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  prepTime: number; // in minutes
  cookTime: number; // in minutes
  totalTime: number; // in minutes
}

export interface ThaiRecipe {
  id: string;
  thaiName: string;
  englishName: string;
  shortDescription: string;
  culturalBackground: string;
  historicalOrigins: string;
  culturalSignificance: string;
  ingredients: Ingredient[];
  instructions: string[];
  cookingTips: CookingTip[];
  regionalVariations: RegionalVariation[];
  servingInfo: ServingInfo;
  servingTraditions: string;
  nutritionalPhilosophy: string;
  seasonalContext: string;
  imageUrl: string;
  tags: string[];
  pairing: {
    rice: string[];
    sides: string[];
    beverages: string[];
  };
  schema?: any; // For SEO structured data
}

export const greenCurryRecipe: ThaiRecipe = {
  id: 'gaeng-keow-wan-gai',
  thaiName: 'แกงเขียวหวานไก่',
  englishName: 'Thai Green Curry with Chicken',
  shortDescription: 'A fragrant and aromatic curry that embodies the perfect balance of Thai flavors - spicy, sweet, salty, and creamy.',
  
  culturalBackground: `Green curry, or "Gaeng Keow Wan" (แกงเขียวหวาน), represents the pinnacle of Thai royal cuisine and the sophisticated balance that defines authentic Thai cooking. The name literally translates to "green sweet curry," though the "sweet" refers not to sugar but to the sweet basil that perfumes this iconic dish.

This curry embodies the Thai culinary philosophy of achieving harmony through contrast - the fiery heat of green chilies balanced by cooling coconut milk, the richness of curry paste offset by fresh herbs, and the intensity of spices mellowed by aromatic vegetables. Each spoonful tells the story of Thailand's cultural exchanges with India, China, and neighboring Southeast Asian countries, while maintaining its distinctly Thai character.`,

  historicalOrigins: `Green curry traces its origins to the royal kitchens of the Ayutthaya period (1351-1767), where palace cooks refined and elevated traditional curry-making techniques. The dish gained particular prominence during the reign of King Rama II in the early 19th century, when royal cuisine became increasingly sophisticated and internationally influenced.

The creation of green curry paste itself is considered an art form passed down through generations. Traditional Thai mothers would teach their daughters the precise balance of ingredients, the proper grinding technique using a granite mortar and pestle (khrok and saak), and the importance of patience in developing the complex flavor profile that makes this curry legendary.

The curry's green color comes from fresh green chilies (prik kee noo suan), which were introduced to Thailand by Portuguese traders in the 16th century, perfectly illustrating how Thai cuisine evolved by embracing foreign ingredients while maintaining its unique identity.`,

  culturalSignificance: `In Thai culture, green curry holds special significance beyond its role as food. It represents the concept of "kreng jai" - the art of balance and consideration for others. The curry's complex preparation requires patience, respect for ingredients, and understanding of how flavors interact, reflecting core Thai values.

Green curry is traditionally served during important family gatherings, Buddhist festivals, and special occasions. The communal nature of sharing curry from a central pot symbolizes unity and generosity in Thai society. The dish is also considered auspicious, with its vibrant green color representing prosperity and growth.

Master curry makers are highly respected in Thai communities, and the ability to create an exceptional green curry paste from scratch is considered a mark of culinary maturity and cultural preservation.`,

  ingredients: [
    {
      name: '2-3 tbsp Green Curry Paste',
      thaiName: 'พริกแกงเขียวหวาน',
      amount: '2-3 tbsp',
      culturalSignificance: 'The soul of the dish, traditionally made fresh daily in Thai households using a granite mortar and pestle, representing the patience and dedication required in Thai cooking.',
      substitution: 'Store-bought paste can be used, but look for brands with minimal preservatives for more authentic flavor'
    },
    {
      name: 'Coconut Milk',
      thaiName: 'กะทิ',
      amount: '400ml thick + 200ml thin',
      culturalSignificance: 'Sacred in Thai cooking, coconut milk represents abundance and is used in both savory dishes and religious ceremonies. The thick cream is extracted first for richness, while thin milk adds gentle flavor.',
      substitution: 'Use full-fat canned coconut milk, refrigerated overnight, with thick cream on top separated from thin milk below'
    },
    {
      name: 'Chicken Breast or Thigh',
      thaiName: 'เนื้อไก่',
      amount: '500g, sliced thin',
      culturalSignificance: 'Chicken is considered a symbol of prosperity in Thai culture. Slicing against the grain in traditional Thai style ensures tenderness and respect for the ingredient.',
      substitution: 'Beef, pork, shrimp, or vegetables can be used. Tofu for vegetarian version.'
    },
    {
      name: 'Thai Eggplant',
      thaiName: 'มะเขือพวง',
      amount: '6-8 small, quartered',
      culturalSignificance: 'These small, bitter eggplants add traditional texture and represent the Thai appreciation for diverse flavors, including bitterness, in a balanced dish.',
      substitution: 'Japanese eggplant cut into chunks, or small Indian eggplants'
    },
    {
      name: 'Thai Basil',
      thaiName: 'โหระพา',
      amount: '1 cup fresh leaves',
      culturalSignificance: 'Holy basil or Thai sweet basil is considered sacred in Thai culture. The aroma is believed to bring peace and prosperity to the household.',
      substitution: 'Italian basil can substitute but lacks the distinctive anise-like flavor of Thai basil'
    },
    {
      name: 'Kaffir Lime Leaves',
      thaiName: 'ใบมะกรูด',
      amount: '4-5 leaves, torn',
      culturalSignificance: 'The double leaves represent unity and completeness in Thai symbolism. Their citrusy fragrance is considered essential for authentic Thai flavor.',
      substitution: 'Fresh lime zest can be used sparingly as a last resort'
    },
    {
      name: 'Fish Sauce',
      thaiName: 'น้ำปลา',
      amount: '2-3 tbsp',
      culturalSignificance: 'The essence of umami in Thai cooking, fish sauce connects Thailand to its ancient fishing traditions and represents the harmony between land and sea.',
      substitution: 'Soy sauce for vegetarian version, though flavor will differ significantly'
    },
    {
      name: 'Palm Sugar',
      thaiName: 'น้ำตาลปึก',
      amount: '1-2 tbsp',
      culturalSignificance: 'Made from palm tree sap, this natural sweetener represents sustainability and the Thai connection to nature. It adds depth and balances the curry\'s heat.',
      substitution: 'Brown sugar or coconut sugar, though palm sugar has unique caramel notes'
    },
    {
      name: 'Thai Chilies',
      thaiName: 'พริกขี้หนู',
      amount: '2-4 whole (optional)',
      culturalSignificance: 'These tiny chilies pack intense heat and represent courage and strength in Thai culture. Adding whole chilies during cooking releases subtle heat without overwhelming the dish.',
      substitution: 'Serrano or bird\'s eye chilies, adjust quantity to taste'
    },
    {
      name: 'Bamboo Shoots',
      thaiName: 'หน่อไผ่',
      amount: '100g, sliced',
      culturalSignificance: 'Bamboo represents flexibility and strength in Thai philosophy. The shoots add texture and absorb the curry\'s flavors beautifully.',
      substitution: 'Water chestnuts or young corn can provide similar texture'
    }
  ],

  instructions: [
    'Heat thick coconut milk in a wok or heavy pot over medium heat until it begins to separate and oil appears on surface (about 3-4 minutes). This traditional technique, called "cracking" the coconut milk, creates the proper foundation for curry.',
    
    'Add green curry paste to the separated coconut milk and fry for 2-3 minutes, stirring constantly until fragrant. The paste should sizzle and release its aromatics - this step is crucial for developing deep flavor that distinguishes restaurant-quality curry.',
    
    'Add sliced chicken and stir-fry until pieces are sealed and coated with curry paste (about 3-4 minutes). The chicken should turn white but not be fully cooked at this stage.',
    
    'Gradually add remaining coconut milk, stirring gently to maintain the curry\'s smooth texture. Bring to a gentle simmer - never boil vigorously as this can cause the coconut milk to curdle.',
    
    'Add Thai eggplant, bamboo shoots, and torn kaffir lime leaves. Simmer for 8-10 minutes until vegetables are tender but still have texture. Traditional Thai cooking values the contrast between different textures.',
    
    'Season with fish sauce and palm sugar, tasting and adjusting for the perfect balance of salty, sweet, and spicy. This balancing act is the heart of Thai cooking philosophy.',
    
    'Add whole Thai chilies for extra heat if desired, and simmer for another 2-3 minutes to allow flavors to meld.',
    
    'Remove from heat and stir in fresh Thai basil leaves just before serving. The basil should wilt from residual heat but retain its bright color and fragrance.',
    
    'Taste and adjust seasoning one final time. A perfect green curry should have layers of flavor that unfold with each bite.'
  ],

  cookingTips: [
    {
      step: 'Curry Paste Preparation',
      culturalContext: 'In traditional Thai households, curry paste is made fresh using a granite mortar and pestle, often taking 30-45 minutes of rhythmic pounding.',
      traditionalMethod: 'The ingredients are added in specific order: hardest ingredients (galangal, lemongrass) first, then softer ones (chilies, garlic), finishing with wet ingredients (shrimp paste). The circular pounding motion is considered meditative.'
    },
    {
      step: 'Coconut Milk Technique',
      culturalContext: 'Thai grandmothers teach that coconut milk must be "awakened" by gentle heating until it separates, showing respect for this sacred ingredient.',
      traditionalMethod: 'Use a wooden spoon and stir in one direction only. The oil separation indicates the coconut milk is ready to receive the curry paste - this cannot be rushed.'
    },
    {
      step: 'Heat Balance',
      culturalContext: 'Thai cuisine philosophy emphasizes that true spiciness should build gradually and be balanced by other flavors, never overwhelming the palate.',
      traditionalMethod: 'Start with less paste and add gradually. Traditional Thai cooks taste constantly and adjust, understanding that heat tolerance varies among diners.'
    },
    {
      step: 'Ingredient Timing',
      culturalContext: 'Each ingredient has its moment to enter the curry, reflecting the Thai respect for natural cooking rhythms and ingredient integrity.',
      traditionalMethod: 'Harder vegetables go in first, delicate herbs last. This ensures each component maintains its character while contributing to the harmonious whole.'
    }
  ],

  regionalVariations: [
    {
      region: 'Central Thailand (Bangkok)',
      variation: 'Sweeter version with more palm sugar and coconut milk, often including pineapple chunks',
      significance: 'Reflects the royal court influence and access to diverse ingredients through trade'
    },
    {
      region: 'Northern Thailand (Chiang Mai)',
      variation: 'More herbaceous with additional wild vegetables and less coconut milk',
      significance: 'Shows influence of Lanna kingdom and abundant mountain herbs'
    },
    {
      region: 'Northeastern Thailand (Isan)',
      variation: 'Spicier and saltier, sometimes with fermented fish (pla ra) instead of fish sauce',
      significance: 'Reflects the region\'s bold flavors and preservation techniques due to harsh climate'
    },
    {
      region: 'Southern Thailand',
      variation: 'More coconut-forward with curry leaves and sometimes turmeric for deeper color',
      significance: 'Influenced by Malaysian and Indian trade, with abundant coconut palms'
    }
  ],

  servingInfo: {
    serves: 4,
    difficulty: 'Medium',
    prepTime: 20,
    cookTime: 25,
    totalTime: 45
  },

  servingTraditions: `Green curry is traditionally served family-style in the center of the table, accompanied by jasmine rice and shared among all diners. In Thai culture, curry is never eaten alone but as part of a balanced meal including various dishes representing different flavors and textures.

The curry should be served immediately while hot, with the basil still bright green and aromatic. Traditional Thai etiquette suggests taking only what you can eat from the communal pot, showing respect for both the food and fellow diners.

During Buddhist festivals and family celebrations, green curry is often prepared in large quantities as an offering of hospitality and abundance to guests and monks.`,

  nutritionalPhilosophy: `Thai cuisine philosophy views food as medicine, and green curry exemplifies this approach. The coconut milk provides healthy fats and energy, while the herbs and spices offer anti-inflammatory and digestive benefits.

Green chilies are rich in vitamin C and capsaicin, which promotes circulation. Thai basil contains essential oils that aid digestion, while galangal and other curry paste ingredients have been used medicinally for centuries.

The balance of protein, vegetables, and rice creates a complete meal that satisfies both physical and spiritual hunger, embodying the Thai concept of "gin kao" - eating with mindfulness and gratitude.`,

  seasonalContext: `While available year-round, green curry is particularly cherished during Thailand's cool season (November-February) when families gather more frequently. The warming spices provide comfort during cooler evenings.

Fresh ingredients are crucial - Thai cooks shop daily for the best vegetables and herbs, understanding that seasonal produce at its peak creates the most flavorful curry. During rainy season, when fresh herbs are abundant, green curry appears more frequently on Thai tables.

Buddhist lunar calendar also influences when curries are prepared, with special versions made during religious holidays and temple festivals.`,

  imageUrl: '/images/green-curry-authentic.jpg',
  
  tags: ['curry', 'chicken', 'spicy', 'coconut', 'traditional', 'authentic', 'thai-royal-cuisine', 'main-dish'],

  pairing: {
    rice: [
      'Jasmine Rice (ข้าวหอมมะลิ) - Essential for absorbing curry and balancing heat',
      'Brown Rice (ข้าวกล้อง) - Modern healthy alternative',
      'Coconut Rice (ข้าวมัน) - For special occasions, adds richness'
    ],
    sides: [
      'Som Tam (ส้มตำ) - Papaya salad provides refreshing contrast',
      'Thai Cucumber Salad (แตงกวาดอง) - Cooling and cleansing',
      'Grilled Vegetables (ผักย่าง) - Smoky flavors complement curry',
      'Thai Omelet (ไข่เจียว) - Traditional protein accompaniment'
    ],
    beverages: [
      'Thai Iced Tea (ชาเย็น) - Sweet and creamy, balances spice',
      'Fresh Coconut Water (น้ำมะพร้าวสด) - Natural cooling effect',
      'Chrysanthemum Tea (ชาดอกเก็กฮวย) - Traditional cooling tea',
      'Chang Beer - Light lager that complements spicy food'
    ]
  },

  schema: {
    "@context": "https://schema.org",
    "@type": "Recipe",
    "name": "Authentic Thai Green Curry with Chicken (แกงเขียวหวานไก่)",
    "description": "A traditional Thai green curry recipe with rich cultural background, featuring fresh ingredients and time-honored cooking techniques from Thai royal cuisine.",
    "image": "/images/green-curry-authentic.jpg",
    "author": {
      "@type": "Organization",
      "name": "Anong Thai Brand"
    },
    "prepTime": "PT20M",
    "cookTime": "PT25M",
    "totalTime": "PT45M",
    "recipeYield": "4 servings",
    "recipeCategory": "Main Dish",
    "recipeCuisine": "Thai",
    "keywords": "Thai green curry, authentic recipe, coconut curry, spicy, traditional cooking",
    "nutrition": {
      "@type": "NutritionInformation",
      "servingSize": "1 serving",
      "calories": "420"
    },
    "recipeIngredient": [
      "2-3 tbsp Green Curry Paste (พริกแกงเขียวหวาน)",
      "400ml thick Coconut Milk (กะทิ)",
      "200ml thin Coconut Milk",
      "500g Chicken Breast or Thigh, sliced thin",
      "6-8 Thai Eggplant, quartered",
      "1 cup fresh Thai Basil leaves",
      "4-5 Kaffir Lime Leaves, torn",
      "2-3 tbsp Fish Sauce",
      "1-2 tbsp Palm Sugar",
      "2-4 Thai Chilies (optional)",
      "100g Bamboo Shoots, sliced"
    ],
    "recipeInstructions": [
      {
        "@type": "HowToStep",
        "text": "Heat thick coconut milk in a wok until it separates and oil appears on surface (3-4 minutes)."
      },
      {
        "@type": "HowToStep", 
        "text": "Add green curry paste and fry for 2-3 minutes until fragrant."
      },
      {
        "@type": "HowToStep",
        "text": "Add chicken and stir-fry until sealed and coated (3-4 minutes)."
      },
      {
        "@type": "HowToStep",
        "text": "Gradually add remaining coconut milk and bring to gentle simmer."
      },
      {
        "@type": "HowToStep", 
        "text": "Add eggplant, bamboo shoots, and lime leaves. Simmer 8-10 minutes."
      },
      {
        "@type": "HowToStep",
        "text": "Season with fish sauce and palm sugar to taste."
      },
      {
        "@type": "HowToStep",
        "text": "Add chilies if desired and simmer 2-3 minutes more."
      },
      {
        "@type": "HowToStep",
        "text": "Remove from heat and stir in Thai basil leaves before serving."
      }
    ]
  }
};

export const recipes: ThaiRecipe[] = [greenCurryRecipe];