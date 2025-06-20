import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, MessageCircle, Send } from "lucide-react";
import { orderService } from '@/services/orders/orderService';
import { chatbotResponses } from './chatbotResponses';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  isHTML?: boolean;
}

interface ChatSession {
  awaitingOrderInfo?: {
    type: 'order_number' | 'email' | 'phone';
    question: string;
  };
}

interface ChatbotResponse {
  text: string;
  type: 'static' | 'order_lookup_request' | 'order_info';
  isHTML?: boolean;
  awaitingInfo?: {
    type: 'order_number' | 'email' | 'phone';
    question: string;
  };
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm here to help you with questions about Anong Thai Brand. I can help you with:\n\n• Product information and cooking tips\n• Order status and tracking\n• Shipping and delivery information\n• Returns and policies\n• General questions\n\nWhat can I help you with today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<ChatSession>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const addMessage = (text: string, sender: 'user' | 'bot', isHTML = false) => {
    const message: Message = {
      id: Date.now().toString(),
      text,
      sender,
      timestamp: new Date(),
      isHTML
    };
    setMessages(prev => [...prev, message]);
  };

  // Enhanced message processing
  const processMessage = async (userMessage: string): Promise<ChatbotResponse> => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for order-related queries
    if (isOrderStatusQuery(lowerMessage)) {
      return handleOrderStatusQuery(userMessage);
    }
    
    // Check for order tracking queries
    if (isOrderTrackingQuery(lowerMessage)) {
      return handleOrderTrackingQuery(userMessage);
    }
    
    // Check if user provided order number directly
    const orderNumber = extractOrderNumber(userMessage);
    if (orderNumber) {
      return await lookupOrderByNumber(orderNumber);
    }
    
    // Fall back to static responses
    return findStaticResponse(userMessage);
  };

  const isOrderStatusQuery = (message: string): boolean => {
    const orderStatusKeywords = [
      'order status', 'check order', 'my order', 'order update',
      'where is my order', 'track order', 'order progress'
    ];
    return orderStatusKeywords.some(keyword => message.includes(keyword));
  };

  const isOrderTrackingQuery = (message: string): boolean => {
    const trackingKeywords = [
      'track', 'tracking', 'shipment', 'delivery status',
      'when will it arrive', 'shipping status'
    ];
    return trackingKeywords.some(keyword => message.includes(keyword));
  };

  const extractOrderNumber = (message: string): string | null => {
    // Look for patterns like ANO123456, ANO-123456, or just order numbers
    const orderNumberPattern = /(?:ANO[-]?)(\d+)|(?:order\s+(?:number|#)?\s*:?\s*)(ANO[-]?\d+|\d+)/i;
    const match = message.match(orderNumberPattern);
    
    if (match) {
      // Return the full order number, adding ANO prefix if missing
      let orderNumber = match[1] || match[2];
      if (orderNumber && !orderNumber.toUpperCase().startsWith('ANO')) {
        orderNumber = 'ANO' + orderNumber;
      }
      return orderNumber?.toUpperCase() || null;
    }
    
    return null;
  };

  const lookupOrderByNumber = async (orderNumber: string): Promise<ChatbotResponse> => {
    try {
      // Clean up the order number
      const cleanOrderNumber = orderNumber.trim().toUpperCase();
      
      // Get all orders and find by order_number
      const orders = await orderService.getAllOrders();
      const order = orders.find(o => o.order_number === cleanOrderNumber);
      
      if (!order) {
        return {
          text: `I couldn't find an order with number "${cleanOrderNumber}". Please check the order number and try again, or contact our support team at info@anongthaibrand.com.`,
          type: 'static'
        };
      }
      
      return {
        text: formatOrderDetails(order),
        type: 'order_info',
        isHTML: true
      };
    } catch (error) {
      console.error('Error looking up order by number:', error);
      return {
        text: "I'm sorry, I'm having trouble accessing order information right now. Please try again in a moment or contact our support team at info@anongthaibrand.com.",
        type: 'static'
      };
    }
  };

  const formatOrderDetails = (order: any): string => {
    const statusColor = getStatusColor(order.status);
    const paymentStatusColor = getStatusColor(order.payment_status);
    
    return `
      <div style="font-family: system-ui, -apple-system, sans-serif;">
        <div style="font-weight: 600; color: #d4af37; margin-bottom: 12px;">Order Details</div>
        
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 14px;">
          <div style="font-weight: 500;">Order Number:</div>
          <div>${order.order_number}</div>
          
          <div style="font-weight: 500;">Status:</div>
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${statusColor}; margin-right: 8px;"></span>
            ${formatStatus(order.status)}
          </div>
          
          <div style="font-weight: 500;">Payment:</div>
          <div style="display: flex; align-items: center;">
            <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${paymentStatusColor}; margin-right: 8px;"></span>
            ${formatStatus(order.payment_status)}
          </div>
          
          <div style="font-weight: 500;">Total:</div>
          <div>R${order.total_amount?.toFixed(2) || '0.00'}</div>
          
          <div style="font-weight: 500;">Ordered:</div>
          <div>${new Date(order.created_at).toLocaleDateString()}</div>
          
          ${order.tracking_number ? `
          <div style="font-weight: 500;">Tracking:</div>
          <div style="color: #d4af37; font-weight: 500;">${order.tracking_number}</div>
          ` : ''}
          
          ${order.shipped_at ? `
          <div style="font-weight: 500;">Shipped:</div>
          <div>${new Date(order.shipped_at).toLocaleDateString()}</div>
          ` : ''}
          
          ${order.delivered_at ? `
          <div style="font-weight: 500;">Delivered:</div>
          <div>${new Date(order.delivered_at).toLocaleDateString()}</div>
          ` : ''}
        </div>
        
        ${getOrderStatusMessage(order)}
      </div>
    `;
  };

  const getStatusColor = (status: string): string => {
    const statusColors: { [key: string]: string } = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'processing': '#8b5cf6',
      'shipped': '#10b981',
      'delivered': '#059669',
      'cancelled': '#ef4444',
      'paid': '#10b981',
      'unpaid': '#ef4444',
      'refunded': '#6b7280'
    };
    return statusColors[status?.toLowerCase()] || '#6b7280';
  };

  const formatStatus = (status: string): string => {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  };

  const getOrderStatusMessage = (order: any): string => {
    const status = order.status?.toLowerCase();
    
    switch (status) {
      case 'pending':
        return '<div style="margin-top: 12px; padding: 8px; background-color: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px; font-size: 14px;">Your order is being processed. You will receive a confirmation email soon.</div>';
      case 'confirmed':
        return '<div style="margin-top: 12px; padding: 8px; background-color: #dbeafe; border: 1px solid #3b82f6; border-radius: 4px; font-size: 14px;">Your order has been confirmed and is being prepared for shipping.</div>';
      case 'processing':
        return '<div style="margin-top: 12px; padding: 8px; background-color: #ede9fe; border: 1px solid #8b5cf6; border-radius: 4px; font-size: 14px;">Your order is currently being prepared in our warehouse.</div>';
      case 'shipped':
        return `<div style="margin-top: 12px; padding: 8px; background-color: #dcfce7; border: 1px solid #10b981; border-radius: 4px; font-size: 14px;">Great news! Your order has been shipped. ${order.tracking_number ? `Track it with: ${order.tracking_number}` : 'You should receive it within 3-5 business days.'}</div>`;
      case 'delivered':
        return '<div style="margin-top: 12px; padding: 8px; background-color: #dcfce7; border: 1px solid #059669; border-radius: 4px; font-size: 14px;">Your order has been delivered! We hope you enjoy your Anong Thai products.</div>';
      case 'cancelled':
        return '<div style="margin-top: 12px; padding: 8px; background-color: #fecaca; border: 1px solid #ef4444; border-radius: 4px; font-size: 14px;">This order has been cancelled. If you have questions, please contact our support team.</div>';
      default:
        return '';
    }
  };

  const handleOrderStatusQuery = (message: string): ChatbotResponse => {
    // Check if they provided order number in the message
    const orderNumber = extractOrderNumber(message);
    if (orderNumber) {
      // Process the order lookup
      return lookupOrderByNumber(orderNumber);
    }
    
    return {
      text: "I can help you check your order status! Please provide your order number (it starts with 'ANO' followed by numbers, like ANO123456).",
      type: 'order_lookup_request',
      awaitingInfo: {
        type: 'order_number',
        question: 'Please provide your order number:'
      }
    };
  };

  const handleOrderTrackingQuery = (message: string): ChatbotResponse => {
    const orderNumber = extractOrderNumber(message);
    if (orderNumber) {
      return lookupOrderByNumber(orderNumber);
    }
    
    return {
      text: "I can help you track your order! Please provide your order number so I can look up the tracking information.",
      type: 'order_lookup_request',
      awaitingInfo: {
        type: 'order_number',
        question: 'Please provide your order number:'
      }
    };
  };

  const findStaticResponse = (userMessage: string): ChatbotResponse => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Find the best matching response from static responses
    for (const response of chatbotResponses) {
      if (response.keywords.some(keyword => lowerMessage.includes(keyword.toLowerCase()))) {
        return {
          text: response.response,
          type: 'static'
        };
      }
    }
    
    // Default response if no match found
    return {
      text: "I'm sorry, I don't have a specific answer for that question. For more detailed assistance, please contact our support team at info@anongthaibrand.com or visit our Contact page. Is there anything else I can help you with about our products, shipping, or orders?",
      type: 'static'
    };
  };

  const lookupOrder = async (type: 'order_number' | 'email' | 'phone', value: string): Promise<ChatbotResponse> => {
    try {
      switch (type) {
        case 'order_number':
          return await lookupOrderByNumber(value);
        default:
          throw new Error('Invalid lookup type');
      }
    } catch (error) {
      console.error('Order lookup error:', error);
      return {
        text: "I'm sorry, I couldn't find any orders with that information. Please double-check and try again, or contact our support team at info@anongthaibrand.com.",
        type: 'static'
      };
    }
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Add user message
    addMessage(inputValue, 'user');
    const userInput = inputValue;
    setInputValue('');
    setIsTyping(true);

    try {
      // Check if we're awaiting specific order information
      if (session.awaitingOrderInfo) {
        await handleOrderInfoResponse(userInput);
      } else {
        // Process normal message
        const response = await processMessage(userInput);
        
        // Handle different response types
        if (response.type === 'order_lookup_request') {
          setSession({ awaitingOrderInfo: response.awaitingInfo });
          addMessage(response.text, 'bot');
        } else if (response.type === 'order_info') {
          addMessage(response.text, 'bot', true);
        } else {
          addMessage(response.text, 'bot', response.isHTML);
        }
      }
    } catch (error) {
      console.error('Chatbot error:', error);
      addMessage("I'm sorry, I encountered an error. Please try again or contact our support team at info@anongthaibrand.com.", 'bot');
    }

    setIsTyping(false);
  };

  const handleOrderInfoResponse = async (userInput: string) => {
    if (!session.awaitingOrderInfo) return;

    try {
      const response = await lookupOrder(
        session.awaitingOrderInfo.type,
        userInput
      );
      
      addMessage(response.text, 'bot', response.isHTML);
      setSession({}); // Clear session
    } catch (error) {
      console.error('Order lookup error:', error);
      addMessage("I'm sorry, I couldn't find any orders with that information. Please double-check and try again, or contact our support team.", 'bot');
      setSession({}); // Clear session
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMessage = (message: Message) => {
    if (message.isHTML) {
      return (
        <div
          className={`max-w-[80%] p-3 rounded-lg text-sm ${
            message.sender === 'user'
              ? 'bg-anong-gold text-anong-black'
              : 'bg-gray-100 text-gray-800'
          }`}
          dangerouslySetInnerHTML={{ __html: message.text }}
        />
      );
    }

    return (
      <div
        className={`max-w-[80%] p-3 rounded-lg text-sm whitespace-pre-line ${
          message.sender === 'user'
            ? 'bg-anong-gold text-anong-black'
            : 'bg-gray-100 text-gray-800'
        }`}
      >
        {message.text}
      </div>
    );
  };

  return (
    <>
      {/* Chat Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg bg-anong-gold hover:bg-anong-gold/90 text-anong-black transition-all duration-300 ${
          isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
        }`}
      >
        <MessageCircle className="w-6 h-6" />
      </Button>

      {/* Chat Window */}
      <Card className={`fixed bottom-6 right-6 z-50 w-80 h-96 shadow-xl transition-all duration-300 ${
        isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
      }`}>
        <CardHeader className="pb-3 bg-anong-gold text-anong-black">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Anong Assistant</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-anong-black hover:bg-anong-black/10"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-0 flex flex-col h-full">
          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {renderMessage(message)}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-800 p-3 rounded-lg text-sm">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>
          
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  session.awaitingOrderInfo 
                    ? `Enter your ${session.awaitingOrderInfo.type.replace('_', ' ')}...`
                    : "Ask me anything..."
                }
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-anong-gold hover:bg-anong-gold/90 text-anong-black"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
};

export default ChatBot;
