
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse PayFast webhook data
    const formData = await req.formData()
    const webhookData: Record<string, string> = {}
    
    for (const [key, value] of formData.entries()) {
      webhookData[key] = value.toString()
    }

    console.log('PayFast webhook received:', {
      payment_status: webhookData.payment_status,
      m_payment_id: webhookData.m_payment_id,
      pf_payment_id: webhookData.pf_payment_id
    })

    // Verify the payment status and update order
    if (webhookData.payment_status === 'COMPLETE') {
      const orderNumber = webhookData.m_payment_id
      
      // Update order status in database
      const { error } = await supabaseClient
        .from('orders')
        .update({ 
          payment_status: 'paid',
          status: 'confirmed',
          updated_at: new Date().toISOString()
        })
        .eq('order_number', orderNumber)

      if (error) {
        console.error('Error updating order:', error)
        return new Response('Database error', { status: 500 })
      }

      console.log('Order updated successfully:', orderNumber)
    }

    // Log the webhook for audit purposes
    await supabaseClient.rpc('log_security_event', {
      p_action: 'payfast_webhook_received',
      p_resource_type: 'payment',
      p_resource_id: webhookData.pf_payment_id,
      p_details: webhookData,
      p_success: true
    })

    return new Response('OK', { status: 200 })
  } catch (error) {
    console.error('PayFast webhook error:', error)
    return new Response('Internal server error', { status: 500 })
  }
})
