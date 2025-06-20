import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, MessageCircle, Send } from "lucide-react";
import { enhancedChatbotService } from './enhancedChatbotService';

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

const EnhancedChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hello! I'm here to help you with questions about Anong Thai Brand. I can help you with:\n\n• Product information\n• Order status and tracking\n• Shipping and delivery\n• Returns and policies\n• General questions\n\nWhat can I help you with today?",
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
        const response = await enhancedChatbotService.processMessage(userInput);
        
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
      const response = await enhancedChatbotService.lookupOrder(
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

export default EnhancedChatBot;
