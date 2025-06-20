
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get PayFast credentials from Supabase secrets
    const config = {
      merchantId: Deno.env.get('PAYFAST_MERCHANT_ID') || '',
      merchantKey: Deno.env.get('PAYFAST_MERCHANT_KEY') || '',
      passphrase: Deno.env.get('PAYFAST_PASSPHRASE') || '',
      sandbox: Deno.env.get('PAYFAST_SANDBOX') === 'true' || true // Default to sandbox
    }

    // Don't log actual credentials for security
    console.log('PayFast config requested:', {
      hasMerchantId: !!config.merchantId,
      hasMerchantKey: !!config.merchantKey,
      hasPassphrase: !!config.passphrase,
      sandbox: config.sandbox
    })

    return new Response(
      JSON.stringify(config),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error getting PayFast config:', error)
    return new Response(
      JSON.stringify({ error: 'Failed to get PayFast configuration' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
