
interface PayFastCredentials {
  merchantId: string;
  merchantKey: string;
  passphrase?: string;
  sandbox: boolean;
}

interface PayFastPaymentRequest {
  merchantId: string;
  merchantKey: string;
  returnUrl: string;
  cancelUrl: string;
  notifyUrl: string;
  amount: number;
  itemName: string;
  itemDescription?: string;
  orderNumber: string;
  customerEmail: string;
  customerFirstName?: string;
  customerLastName?: string;
}

interface PayFastPaymentResponse {
  success: boolean;
  paymentUrl?: string;
  paymentId?: string;
  error?: string;
  requiresManualProcessing?: boolean;
}

export class PayFastService {
  private credentials: PayFastCredentials | null = null;

  constructor() {
    console.log('🏦 PayFastService: Initializing service');
    this.loadCredentials();
  }

  private async loadCredentials() {
    console.log('🔑 PayFastService: Loading secure credentials from Supabase');
    
    try {
      // Get Supabase URL from environment
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
      
      if (!supabaseUrl) {
        console.log('⚠️ PayFastService: No Supabase URL configured');
        this.credentials = null;
        return;
      }

      // Load credentials from Supabase Edge Function that accesses secrets
      const response = await fetch(`${supabaseUrl}/functions/v1/get-payfast-config`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });

      if (response.ok) {
        const config = await response.json();
        if (config.merchantId && config.merchantKey) {
          this.credentials = {
            merchantId: config.merchantId,
            merchantKey: config.merchantKey,
            passphrase: config.passphrase,
            sandbox: config.sandbox || false
          };
          console.log('✅ PayFastService: Secure credentials loaded successfully');
        } else {
          console.log('⚠️ PayFastService: Credentials not configured in Supabase secrets');
          this.credentials = null;
        }
      } else {
        console.log('⚠️ PayFastService: Could not load credentials from Edge Function');
        this.credentials = null;
      }
    } catch (error) {
      console.error('❌ PayFastService: Error loading credentials:', error);
      this.credentials = null;
    }
  }

  public isApiIntegrationEnabled(): boolean {
    const isEnabled = this.credentials !== null && 
           this.credentials.merchantId !== '' && 
           this.credentials.merchantKey !== '';
    
    console.log('🔍 PayFastService: API integration enabled:', isEnabled);
    return isEnabled;
  }

  public async createPayment(request: PayFastPaymentRequest): Promise<PayFastPaymentResponse> {
    console.log('🏦 PayFast: Creating payment for order', request.orderNumber);

    if (!this.isApiIntegrationEnabled()) {
      console.log('⚠️ PayFast API not configured, using manual processing');
      return {
        success: true,
        requiresManualProcessing: true,
        paymentId: `MANUAL_${request.orderNumber}_${Date.now()}`
      };
    }

    try {
      const paymentData = this.buildPaymentData(request);
      const paymentUrl = this.generatePaymentUrl(paymentData);

      console.log('✅ PayFast payment created:', paymentUrl);

      return {
        success: true,
        paymentUrl,
        paymentId: paymentData.m_payment_id
      };
    } catch (error) {
      console.error('❌ PayFast payment creation failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment creation failed',
        requiresManualProcessing: true
      };
    }
  }

  private buildPaymentData(request: PayFastPaymentRequest) {
    if (!this.credentials) {
      throw new Error('PayFast credentials not configured');
    }

    const paymentData = {
      merchant_id: this.credentials.merchantId,
      merchant_key: this.credentials.merchantKey,
      return_url: request.returnUrl,
      cancel_url: request.cancelUrl,
      notify_url: request.notifyUrl,
      amount: request.amount.toFixed(2),
      item_name: request.itemName,
      item_description: request.itemDescription || '',
      m_payment_id: request.orderNumber,
      email_address: request.customerEmail,
      name_first: request.customerFirstName || '',
      name_last: request.customerLastName || ''
    };

    // Add signature when passphrase is available
    const result: any = { ...paymentData };
    if (this.credentials.passphrase) {
      result.signature = this.generateSignature(paymentData);
    }

    return result;
  }

  private generateSignature(data: any): string {
    if (!this.credentials?.passphrase) return '';
    
    // Build parameter string for signature
    const paramString = Object.keys(data)
      .filter(key => key !== 'signature' && data[key] !== '')
      .sort()
      .map(key => `${key}=${encodeURIComponent(data[key])}`)
      .join('&') + `&passphrase=${encodeURIComponent(this.credentials.passphrase)}`;

    // Generate MD5 hash (PayFast requirement)
    const crypto = require('crypto');
    return crypto.createHash('md5').update(paramString).digest('hex');
  }

  private generatePaymentUrl(paymentData: any): string {
    const baseUrl = this.credentials?.sandbox 
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';

    const queryString = new URLSearchParams(paymentData).toString();
    return `${baseUrl}?${queryString}`;
  }

  public async verifyPayment(paymentId: string, pfData: any): Promise<boolean> {
    console.log('🔍 PayFast: Verifying payment', paymentId);

    if (!this.isApiIntegrationEnabled()) {
      console.log('⚠️ PayFast API not configured, manual verification required');
      return false;
    }

    try {
      // Verify signature if passphrase is available
      if (this.credentials?.passphrase) {
        const isValid = this.verifySignature(pfData);
        if (!isValid) {
          console.error('❌ PayFast signature verification failed');
          return false;
        }
      }

      // Additional verification logic would go here
      return true;
    } catch (error) {
      console.error('❌ PayFast payment verification failed:', error);
      return false;
    }
  }

  private verifySignature(data: any): boolean {
    if (!this.credentials?.passphrase) return true;
    
    const receivedSignature = data.signature;
    delete data.signature;
    
    const expectedSignature = this.generateSignature(data);
    return receivedSignature === expectedSignature;
  }

  public generatePaymentReference(orderNumber: string): string {
    return `PAY-${orderNumber}-${Date.now()}`;
  }

  public getPaymentMethods(): Array<{id: string, name: string, description: string}> {
    console.log('📋 PayFastService: Getting payment methods');
    
    const methods = [
      {
        id: 'eft',
        name: 'EFT/Bank Transfer',
        description: 'Direct bank transfer - manual processing'
      },
      {
        id: 'payfast_card',
        name: 'Credit/Debit Card',
        description: this.isApiIntegrationEnabled() 
          ? 'Secure card payment via PayFast' 
          : 'Card payment - requires PayFast integration'
      },
      {
        id: 'payfast_eft',
        name: 'PayFast EFT',
        description: this.isApiIntegrationEnabled()
          ? 'Instant EFT via PayFast'
          : 'Instant EFT - requires PayFast integration'
      }
    ];

    console.log('📋 PayFastService: Available methods:', methods);
    return methods;
  }
}

export const payFastService = new PayFastService();
