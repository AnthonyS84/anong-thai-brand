import { orderService } from '@/services/orders/orderService';
import { authService } from '@/services/authService';
import { enhancedChatbotService } from './enhancedChatbotService';

interface AuthenticatedChatbotResponse {
  text: string;
  type: 'static' | 'order_lookup_request' | 'order_info' | 'auth_required';
  isHTML?: boolean;
  requiresAuth?: boolean;
}

/**
 * Enhanced chatbot service with user authentication support
 * This provides more secure order lookups for logged-in users
 */
class AuthenticatedChatbotService {
  async processMessageWithAuth(userMessage: string): Promise<AuthenticatedChatbotResponse> {
    const lowerMessage = userMessage.toLowerCase();
    
    // Check if this is an order-related query
    if (this.isOrderRelatedQuery(lowerMessage)) {
      // Check if user is authenticated
      const currentUser = await authService.getCurrentUser();
      
      if (!currentUser) {
        return {
          text: "To check your order status, please sign in to your account first. This ensures I only show your personal order information. You can sign in using the link at the top of the page, then come back and ask about your orders.",
          type: 'auth_required',
          requiresAuth: true
        };
      }
      
      // If authenticated, try to find their orders
      return await this.handleAuthenticatedOrderQuery(userMessage, currentUser.id);
    }
    
    // For non-order queries, use the standard service
    const response = await enhancedChatbotService.processMessage(userMessage);
    return {
      text: response.text,
      type: response.type,
      isHTML: response.isHTML
    };
  }

  private async handleAuthenticatedOrderQuery(message: string, userId: string): Promise<AuthenticatedChatbotResponse> {
    try {
      // Get user's orders
      const userOrders = await orderService.getCustomerOrdersByUserId(userId);
      
      if (!userOrders || userOrders.length === 0) {
        return {
          text: "I don't see any orders associated with your account yet. If you've recently placed an order, it might take a few minutes to appear in our system. Feel free to browse our products in the Shop section!",
          type: 'order_info'
        };
      }
      
      // Check if they specified an order number
      const orderNumber = this.extractOrderNumber(message);
      
      if (orderNumber) {
        // Look for specific order
        const specificOrder = userOrders.find(order => 
          order.order_number === orderNumber.toUpperCase()
        );
        
        if (specificOrder) {
          return {
            text: this.formatOrderDetails(specificOrder),
            type: 'order_info',
            isHTML: true
          };
        } else {
          return {
            text: `I couldn't find order ${orderNumber} in your account. Please check the order number or contact support if you believe this is an error.`,
            type: 'order_info'
          };
        }
      }
      
      // Show recent orders
      return {
        text: this.formatRecentOrders(userOrders.slice(0, 3)),
        type: 'order_info',
        isHTML: true
      };
      
    } catch (error) {
      console.error('Error in authenticated order query:', error);
      return {
        text: "I'm having trouble accessing your order information right now. Please try again in a moment or contact our support team.",
        type: 'order_info'
      };
    }
  }

  private formatRecentOrders(orders: any[]): string {
    const ordersList = orders.map(order => {
      const statusColor = this.getStatusColor(order.status);
      return `
        <div class="border-b border-gray-200 pb-2 mb-2">
          <div class="flex justify-between items-center">
            <div class="font-medium">${order.order_number}</div>
            <div class="flex items-center">
              <span class="inline-block w-2 h-2 rounded-full mr-2" style="background-color: ${statusColor}"></span>
              ${this.formatStatus(order.status)}
            </div>
          </div>
          <div class="text-sm text-gray-600">
            ${new Date(order.created_at).toLocaleDateString()} • R${order.total_amount?.toFixed(2) || '0.00'}
          </div>
        </div>
      `;
    }).join('');

    return `
      <div class="space-y-3">
        <div class="font-semibold text-anong-gold">Your Recent Orders</div>
        ${ordersList}
        <div class="text-sm text-gray-600 mt-3">
          Ask me about a specific order by saying "Check order [order number]" or visit your account page to see all orders.
        </div>
      </div>
    `;
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

  private getStatusColor(status: string): string {
    // Reuse status color logic
    const statusColors: { [key: string]: string } = {
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'processing': '#8b5cf6',
      'shipped': '#10b981',
      'delivered': '#059669',
      'cancelled': '#ef4444'
    };
    return statusColors[status?.toLowerCase()] || '#6b7280';
  }

  private formatStatus(status: string): string {
    if (!status) return 'Unknown';
    return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
  }

  private isOrderRelatedQuery(message: string): boolean {
    const orderKeywords = [
      'order', 'orders', 'my order', 'check order', 'order status',
      'track', 'tracking', 'shipment', 'delivery', 'where is my order',
      'recent orders', 'order history', 'purchase', 'bought'
    ];
    return orderKeywords.some(keyword => message.includes(keyword));
  }

  private extractOrderNumber(message: string): string | null {
    const orderNumberPattern = /(?:ANO[-]?)(\d+)|(?:order\s+(?:number|#)?\s*:?\s*)(ANO[-]?\d+|\d+)/i;
    const match = message.match(orderNumberPattern);
    
    if (match) {
      let orderNumber = match[1] || match[2];
      if (orderNumber && !orderNumber.toUpperCase().startsWith('ANO')) {
        orderNumber = 'ANO' + orderNumber;
      }
      return orderNumber?.toUpperCase() || null;
    }
    
    return null;
  }
}

export const authenticatedChatbotService = new AuthenticatedChatbotService();
