// Test file for the Enhanced Chatbot
// You can run these in the browser console to test the chatbot service directly

import { enhancedChatbotService } from './src/components/chatbot/enhancedChatbotService';

// Test order lookup patterns
const testMessages = [
  // Order status queries
  "What's my order status?",
  "Check my order ANO123456",
  "Where is order ANO-789012?", 
  "Track my order",
  "I want to check my order status",
  
  // Static responses
  "What products do you have?",
  "How spicy is the green curry?",
  "What are your shipping costs?",
  "How do I cook with curry paste?",
  
  // Greetings
  "Hello",
  "Thanks for your help",
  "Goodbye"
];

// Function to test multiple messages
async function testChatbot() {
  console.log('Testing Enhanced Chatbot...\n');
  
  for (const message of testMessages) {
    console.log(`User: "${message}"`);
    try {
      const response = await enhancedChatbotService.processMessage(message);
      console.log(`Bot (${response.type}):`, response.text);
      if (response.awaitingInfo) {
        console.log('Awaiting:', response.awaitingInfo);
      }
    } catch (error) {
      console.error('Error:', error);
    }
    console.log('---');
  }
}

// Test specific order lookup
async function testOrderLookup(orderNumber) {
  console.log(`Testing order lookup for: ${orderNumber}`);
  try {
    const response = await enhancedChatbotService.lookupOrder('order_number', orderNumber);
    console.log('Response:', response);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Test pattern matching
function testPatternMatching() {
  const testCases = [
    "My order number is ANO123456",
    "Track order ANO-789012",
    "Check order number: 123456",
    "Order #ANO555777",
    "hello@example.com",
    "No order number here"
  ];
  
  console.log('Testing pattern extraction...\n');
  
  testCases.forEach(message => {
    console.log(`Message: "${message}"`);
    // These are private methods, so this is more for demonstration
    console.log('Would extract order number and email patterns');
    console.log('---');
  });
}

// Export test functions
export {
  testChatbot,
  testOrderLookup,
  testPatternMatching
};

// Example usage in browser console:
/*
1. Open your website in the browser
2. Open Developer Tools (F12)
3. Go to Console tab
4. Import and run tests:

import('./chatbot-tests.js').then(tests => {
  // Test general chatbot responses
  tests.testChatbot();
  
  // Test specific order (replace with real order number)
  tests.testOrderLookup('ANO123456');
  
  // Test pattern matching
  tests.testPatternMatching();
});

*/
