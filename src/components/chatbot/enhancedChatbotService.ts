import { orderService } from '@/services/orders/orderService';
import { chatbotResponses } from './chatbotResponses';

interface ChatbotResponse {
  text: string;
  type: 'static' | 'order_lookup_request' | 'order_info';
  isHTML?: boolean;
  awaitingInfo?: {
    type: 'order_number' | 'email' | 'phone';
    question: string;
  };
}

class EnhancedChatbotService {
  async processMessage(userMessage: string): Promise<ChatbotResponse> {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check for order-related queries
    if (this.isOrderStatusQuery(lowerMessage)) {
      return this.handleOrderStatusQuery(userMessage);
    }
    
    // Check for order tracking queries
    if (this.isOrderTrackingQuery(lowerMessage)) {
      return this.handleOrderTrackingQuery(userMessage);
    }
    
    // Check if user provided order number directly
    const orderNumber = this.extractOrderNumber(userMessage);
    if (orderNumber) {
      return await this.lookupOrderByNumber(orderNumber);
    }
    
    // Check if user provided email
    const email = this.extractEmail(userMessage);
    if (email && this.isOrderRelated(lowerMessage)) {
      return await this.lookupOrderByEmail(email);
    }
    
    // Fall back to static responses
    return this.findStaticResponse(userMessage);
  }

  async lookupOrder(type: 'order_number' | 'email' | 'phone', value: string): Promise<ChatbotResponse> {
    try {
      switch (type) {
        case 'order_number':
          return await this.lookupOrderByNumber(value);
        case 'email':
          return await this.lookupOrderByEmail(value);
        case 'phone':
          return await this.lookupOrderByPhone(value);
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
  }

  private async lookupOrderByNumber(orderNumber: string): Promise<ChatbotResponse> {
    try {
      // Clean up the order number
      const cleanOrderNumber = orderNumber.trim().toUpperCase();
      
      // Get all orders and find by order_number
      const orders = await orderService.getAllOrders();
      const order = orders.find(o => o.order_number === cleanOrderNumber);
      
      if (!order) {
        return {
          text: `I couldn't find an order with number "${cleanOrderNumber}". Please check the order number and try again, or contact our support team.`,
          type: 'static'
        };
      }
      
      return {
        text: this.formatOrderDetails(order),
        type: 'order_info',
        isHTML: true
      };
    } catch (error) {
      console.error('Error looking up order by number:', error);
      throw error;
    }
  }

  private async lookupOrderByEmail(email: string): Promise<ChatbotResponse> {
    try {
      // Note: This would require a customer lookup first, then orders by customer_id
      // For now, return a message asking for order number
      return {
        text: "To look up your order by email, I'll need your order number as well. Could you please provide your order number? It should start with 'ANO' followed by numbers.",
        type: 'order_lookup_request',
        awaitingInfo: {
          type: 'order_number',
          question: 'Please provide your order number:'
        }
      };
    } catch (error) {
      console.error('Error looking up order by email:', error);
      throw error;
    }
  }

  private async lookupOrderByPhone(phone: string): Promise<ChatbotResponse> {
    try {
      // Similar to email - would need customer lookup first
      return {
        text: "To look up your order by phone number, I'll need your order number as well. Could you please provide your order number?",
        type: 'order_lookup_request',
        awaitingInfo: {
          type: 'order_number',
          question: 'Please provide your order number:'
        }
      };
    } catch (error) {
      console.error('Error looking up order by phone:', error);
      throw error;
    }
  }

  private formatOrderDetails(order: any): string {
    const statusColor = this.getStatusColor(order.status);
    const paymentStatusColor = this.getStatusColor(order.payment_status);
    
    return `
      <div class="space-y-3">
        <div class="font-semibold text-anong-gold">Order Details</div>
        
        <div class="grid grid-cols-2 gap-2 text-sm">
          <div class="font-medium">Order Number:</div>
          <div>${order.order_number}</div>
          
          <div class="font-medium">Status:</div>
          <div class="flex items-center">
            <span class="inline-block w-2 h-2 rounded-full mr-2" style="background-color: ${statusColor}"></span>
            ${this.formatStatus(order.status)}
          </div>
          
          <div class="font-medium">Payment:</div>
          <div class="flex items-center">
            <span class="inline-block w-2 h-2 rounded-full mr-2" style="background-color: ${paymentStatusColor}"></span>
            ${this.formatStatus(order.payment_status)}
          </div>
          
          <div class="font-medium">Total:</div>
          <div>R${order.total_amount?.toFixed(2) || '0.00'}</div>
          
          <div class="font-medium">Ordered:</div>
          <div>${new Date(order.created_at).toLocaleDateString()}</div>
          
          ${order.tracking_number ? `
          <div class="font-medium">Tracking:</div>
          <div class="text-anong-gold font-medium">${order.tracking_number}</div>
          ` : ''}
          
          ${order.shipped_at ? `
          <div class="font-medium">Shipped:</div>
          <div>${new Date(order.shipped_at).toLocaleDateString()}</div>
          ` : ''}
          
          ${order.delivered_at ? `
          <div class="font-medium">Delivered:</div>
          <div>${new Date(order.delivered_at).toLocaleDateString()}</div>
          ` : ''}
        </div>
        
        ${this.getOrderStatusMessage(order)}
      </div>
    `;
  }

  private getStatusColor(status: string): string {
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
  }

  private formatStatus(status: string): string {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  private getOrderStatusMessage(order: any): string {
    const status = order.status?.toLowerCase();
    
    switch (status) {
      case 'pending':
        return '<div class="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm">Your order is being processed. You will receive a confirmation email soon.</div>';
      case 'confirmed':
        return '<div class="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm">Your order has been confirmed and is being prepared for shipping.</div>';
      case 'processing':
        return '<div class="mt-3 p-2 bg-purple-50 border border-purple-200 rounded text-sm">Your order is currently being prepared in our warehouse.</div>';
      case 'shipped':
        return `<div class="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">Great news! Your order has been shipped. ${order.tracking_number ? `Track it with: ${order.tracking_number}` : 'You should receive it within 3-5 business days.'}</div>`;
      case 'delivered':
        return '<div class="mt-3 p-2 bg-green-50 border border-green-200 rounded text-sm">Your order has been delivered! We hope you enjoy your Anong Thai products.</div>';
      case 'cancelled':
        return '<div class="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm">This order has been cancelled. If you have questions, please contact our support team.</div>';
      default:
        return '';
    }
  }

  private isOrderStatusQuery(message: string): boolean {
    const orderStatusKeywords = [
      'order status', 'check order', 'my order', 'order update',
      'where is my order', 'track order', 'order progress'
    ];
    return orderStatusKeywords.some(keyword => message.includes(keyword));
  }

  private isOrderTrackingQuery(message: string): boolean {
    const trackingKeywords = [
      'track', 'tracking', 'shipment', 'delivery status',
      'when will it arrive', 'shipping status'
    ];
    return trackingKeywords.some(keyword => message.includes(keyword));
  }

  private isOrderRelated(message: string): boolean {
    const orderKeywords = [
      'order', 'purchase', 'bought', 'ordered', 'track', 'delivery', 'shipment'
    ];
    return orderKeywords.some(keyword => message.includes(keyword));
  }

  private extractOrderNumber(message: string): string | null {
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
  }

  private extractEmail(message: string): string | null {
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
    const match = message.match(emailPattern);
    return match ? match[0] : null;
  }

  private handleOrderStatusQuery(message: string): ChatbotResponse {
    // Check if they provided order number in the message
    const orderNumber = this.extractOrderNumber(message);
    if (orderNumber) {
      // Process the order lookup
      return this.lookupOrderByNumber(orderNumber);
    }
    
    return {
      text: "I can help you check your order status! Please provide your order number (it starts with 'ANO' followed by numbers, like ANO123456).",
      type: 'order_lookup_request',
      awaitingInfo: {
        type: 'order_number',
        question: 'Please provide your order number:'
      }
    };
  }

  private handleOrderTrackingQuery(message: string): ChatbotResponse {
    const orderNumber = this.extractOrderNumber(message);
    if (orderNumber) {
      return this.lookupOrderByNumber(orderNumber);
    }
    
    return {
      text: "I can help you track your order! Please provide your order number so I can look up the tracking information.",
      type: 'order_lookup_request',
      awaitingInfo: {
        type: 'order_number',
        question: 'Please provide your order number:'
      }
    };
  }

  private findStaticResponse(userMessage: string): ChatbotResponse {
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
  }
}

export const enhancedChatbotService = new EnhancedChatbotService();();
