interface ChatbotResponse {
  keywords: string[];
  response: string;
}

export const chatbotResponses: ChatbotResponse[] = [
  // Product-related questions
  {
    keywords: ['products', 'what do you sell', 'curry paste', 'sauce', 'thai food', 'menu', 'catalog'],
    response: "We specialize in authentic Thai curry pastes and sauces made with traditional recipes. Our products include Red Curry Paste, Green Curry Paste, Massaman Curry Paste, Tom Yum Paste, and various Thai sauces. You can browse our full collection in the Shop section."
  },
  {
    keywords: ['ingredients', 'recipe', 'how to use', 'cooking instructions', 'how to cook'],
    response: "All our curry pastes come with detailed cooking instructions on the packaging. You can also find recipes and cooking tips in our Recipes section. Generally, mix 1-2 tablespoons of curry paste with coconut milk, add your choice of meat or vegetables, and simmer until cooked."
  },
  {
    keywords: ['spicy', 'heat level', 'mild', 'hot', 'spice level', 'how spicy'],
    response: "Our curry pastes have varying heat levels: Green Curry is the spiciest, Red Curry is medium-hot, and Massaman is mild and sweet. Each product page shows the spice level to help you choose what suits your taste."
  },
  {
    keywords: ['vegan', 'vegetarian', 'dairy free', 'gluten free', 'allergens', 'dietary'],
    response: "Many of our curry pastes are naturally vegan and gluten-free, but please check individual product labels for specific dietary information and allergen warnings. We clearly mark all ingredients and dietary suitability on our product pages."
  },

  // Shipping and delivery - Enhanced
  {
    keywords: ['shipping', 'delivery', 'how long', 'when will it arrive', 'postage', 'courier', 'dispatch'],
    response: "We offer shipping throughout South Africa. Standard delivery takes 3-5 business days, and we also offer express delivery options. Shipping costs are calculated at checkout based on your location and order size. Free shipping is available on orders over R500."
  },
  {
    keywords: ['tracking', 'track my order', 'where is my order', 'tracking number', 'courier tracking'],
    response: "Once your order is dispatched, you'll receive a tracking number via email. You can track your order using this number on our courier partner's website, or I can help you check your order status right here! Just provide your order number."
  },
  {
    keywords: ['international shipping', 'overseas', 'abroad', 'export', 'outside south africa'],
    response: "Currently, we only ship within South Africa. We're working on expanding our shipping to other countries. Please check back soon or contact us for updates on international shipping."
  },
  {
    keywords: ['shipping cost', 'delivery cost', 'how much shipping', 'postal charges'],
    response: "Shipping costs are calculated based on your location and order size. We offer free shipping on orders over R500. For smaller orders, shipping typically ranges from R50-R120 depending on your location. Express delivery options are also available at checkout."
  },

  // Orders and payments - Enhanced
  {
    keywords: ['order', 'how to order', 'place an order', 'buy', 'purchase', 'checkout'],
    response: "To place an order, browse our products in the Shop section, add items to your cart, and proceed to checkout. You'll need to create an account or sign in, then provide your shipping details and payment information."
  },
  {
    keywords: ['payment', 'pay', 'credit card', 'eft', 'bank transfer', 'payfast', 'payment methods'],
    response: "We accept various payment methods including credit/debit cards, EFT/bank transfers, and PayFast secure payments. All payment information is processed securely. For EFT payments, you'll receive banking details after placing your order."
  },
  {
    keywords: ['cancel order', 'change order', 'modify', 'edit order', 'update order'],
    response: "If you need to cancel or modify your order, please contact us as soon as possible at info@anongthaibrand.com or provide your order number here and I can help check if changes are still possible. Orders can typically be modified or cancelled within 2 hours of placement, before they're prepared for shipping."
  },
  {
    keywords: ['order confirmation', 'confirmation email', 'receipt', 'invoice'],
    response: "You should receive an order confirmation email immediately after placing your order. If you haven't received it, please check your spam folder or contact us with your order details."
  },

  // Order Status - New section
  {
    keywords: ['order status', 'check order', 'my order', 'order update', 'order progress'],
    response: "I can help you check your order status! Please provide your order number (it starts with 'ANO' followed by numbers) and I'll look up the current status and tracking information for you."
  },
  {
    keywords: ['when will my order arrive', 'delivery date', 'expected delivery', 'eta'],
    response: "I can check the expected delivery date for your specific order. Please provide your order number and I'll give you the most up-to-date information about when to expect your delivery."
  },
  {
    keywords: ['order delayed', 'late order', 'order taking long', 'slow delivery'],
    response: "I understand your concern about the delivery timing. Please provide your order number so I can check the current status and see if there are any delays or issues with your shipment."
  },

  // Account and support - Enhanced
  {
    keywords: ['account', 'sign up', 'register', 'login', 'password', 'profile'],
    response: "You can create an account by clicking 'Sign In' in the top menu and selecting 'Create Account'. This allows you to track orders, save addresses, and access exclusive offers. If you're having trouble with your password, use the 'Forgot Password' option."
  },
  {
    keywords: ['contact', 'support', 'help', 'customer service', 'phone number', 'email'],
    response: "For additional support, you can contact us at info@anongthaibrand.com or visit our Contact page. Our team typically responds within 24 hours during business days. I'm also here to help with order tracking and general questions!"
  },
  {
    keywords: ['hours', 'open', 'business hours', 'when are you open', 'operating hours'],
    response: "Our customer service team operates Monday to Friday, 9 AM to 5 PM (SAST). While our online store is available 24/7, email support responses are typically sent during business hours."
  },

  // Company and brand - Enhanced
  {
    keywords: ['about', 'anong', 'company', 'story', 'who are you', 'brand story'],
    response: "Anong Thai Brand is dedicated to bringing authentic Thai flavors to South African kitchens. We create traditional curry pastes and sauces using time-honored recipes and quality ingredients. Learn more about our story in the 'About Anong' section."
  },
  {
    keywords: ['authentic', 'traditional', 'real thai', 'genuine', 'original recipes'],
    response: "Yes! All our products are made using traditional Thai recipes and authentic ingredients. We're committed to preserving the genuine flavors of Thai cuisine and bringing them to your kitchen with the same quality you'd find in Thailand."
  },
  {
    keywords: ['where made', 'manufactured', 'origin', 'made in thailand', 'production'],
    response: "Our products are carefully crafted using authentic Thai recipes and traditional methods. We maintain the highest quality standards to ensure you get the genuine taste of Thailand in every jar."
  },

  // Returns and policies - Enhanced
  {
    keywords: ['return', 'refund', 'exchange', 'money back', 'returns policy'],
    response: "We offer returns on unopened products within 14 days of delivery. If you're not satisfied with your purchase or received a damaged item, please contact us at info@anongthaibrand.com with your order number and we'll help resolve the issue."
  },
  {
    keywords: ['shelf life', 'expiry', 'best before', 'storage', 'how long does it last'],
    response: "Our curry pastes have a shelf life of 12-18 months when stored in a cool, dry place. Once opened, refrigerate and use within 6 months. Each product shows the best-before date on the packaging."
  },
  {
    keywords: ['damaged', 'broken', 'defective', 'wrong item', 'missing item'],
    response: "I'm sorry to hear about the issue with your order. Please provide your order number and details about the problem, and I'll help you get this resolved quickly. We'll arrange for a replacement or refund as appropriate."
  },

  // General greetings and politeness - Enhanced
  {
    keywords: ['hello', 'hi', 'good morning', 'good afternoon', 'good evening', 'hey'],
    response: "Hello! Welcome to Anong Thai Brand. I'm here to help you with any questions about our authentic Thai curry pastes and sauces, check your order status, or assist with any other inquiries. What would you like to know?"
  },
  {
    keywords: ['thank you', 'thanks', 'appreciate', 'grateful'],
    response: "You're very welcome! I'm happy to help. Is there anything else you'd like to know about our products, orders, or services?"
  },
  {
    keywords: ['bye', 'goodbye', 'see you', 'thanks for your help', 'have a good day'],
    response: "Thank you for visiting Anong Thai Brand! Feel free to come back anytime if you have more questions. Enjoy cooking with our authentic Thai flavors!"
  },

  // Cooking and usage tips - New section
  {
    keywords: ['coconut milk', 'how much coconut milk', 'ratio', 'proportions'],
    response: "For best results, use a 400ml can of coconut milk with 1-2 tablespoons of our curry paste. Start with less paste and add more to taste - you can always make it stronger! Add your protein and vegetables, then simmer until cooked through."
  },
  {
    keywords: ['recipe ideas', 'what to cook', 'meal ideas', 'cooking suggestions'],
    response: "Our curry pastes are versatile! Try making traditional curries with chicken, beef, or tofu, use them as marinades, stir into soups, or even mix with mayonnaise for a spicy sandwich spread. Check our Recipes section for detailed cooking ideas."
  },
  {
    keywords: ['too spicy', 'reduce spice', 'make it milder', 'less hot'],
    response: "If your curry is too spicy, try adding more coconut milk, a spoonful of sugar, or some plain yogurt to cool it down. You can also add more vegetables or protein to dilute the heat. Start with less paste next time!"
  }
];
