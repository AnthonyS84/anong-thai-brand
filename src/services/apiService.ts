// Environment-aware backend URL configuration
const getBackendURL = () => {
  const envURL = import.meta.env.VITE_BACKEND_URL;
  const environment = import.meta.env.VITE_ENVIRONMENT;
  
  // Only use backend API in development with localhost
  if (environment === 'development' && 
      (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return envURL || 'http://localhost:5000';
  }
  
  // In production, always return null to skip API and use Supabase directly
  return null;
};

const BACKEND_URL = getBackendURL();

export interface Customer {
  id: string
  fullName: string
  email: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string
  price: number
  category: string
  image_url?: string
  created_at: string
}

export interface ProductsResponse {
  products: Product[]
}

export interface CreateCustomerRequest {
  fullName: string
  email: string
}

class ApiService {
  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    // If no backend URL configured, throw error to trigger fallback
    if (!BACKEND_URL) {
      throw new Error('No backend configured - using Supabase fallback');
    }

    const url = `${BACKEND_URL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed:`, error);
      throw error;
    }
  }

  async getProducts(params?: { category?: string }): Promise<ProductsResponse> {
    const queryParams = new URLSearchParams();
    if (params?.category) {
      queryParams.append('category', params.category);
    }
    
    const endpoint = `/api/products${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    return this.request<ProductsResponse>(endpoint);
  }

  async getProduct(id: string): Promise<{ product: Product }> {
    const endpoint = `/api/products/${id}`;
    return this.request<{ product: Product }>(endpoint);
  }

  async createCustomer(customerData: CreateCustomerRequest): Promise<Customer> {
    return this.request<Customer>('/api/customers', {
      method: 'POST',
      body: JSON.stringify(customerData),
    });
  }

  // Check if backend is available
  isBackendAvailable(): boolean {
    return BACKEND_URL !== null;
  }
}

export const apiService = new ApiService();
