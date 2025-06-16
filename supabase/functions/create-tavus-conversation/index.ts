import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface TavusRequest {
  replica_id: string
  conversation_name?: string
  conversational_context?: string
  custom_greeting?: string
  callback_url?: string
  properties?: {
    max_call_duration?: number
    participant_left_timeout?: number
    participant_absent_timeout?: number
    enable_recording?: boolean
    enable_transcription?: boolean
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Verify the request is authenticated
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Verify the user token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    
    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Get the request body
    const tavusRequest: TavusRequest = await req.json()

    // Validate required fields
    if (!tavusRequest.replica_id) {
      return new Response('Missing replica_id', { status: 400, headers: corsHeaders })
    }

    // Get Tavus API key from environment
    const tavusApiKey = Deno.env.get('TAVUS_API_KEY')
    if (!tavusApiKey) {
      console.error('TAVUS_API_KEY not configured')
      return new Response('Service configuration error', { status: 500, headers: corsHeaders })
    }

    // Call Tavus API
    const tavusResponse = await fetch('https://tavusapi.com/v2/conversations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': tavusApiKey,
      },
      body: JSON.stringify(tavusRequest),
    })

    if (!tavusResponse.ok) {
      const errorText = await tavusResponse.text()
      console.error('Tavus API error:', errorText)
      return new Response('Failed to create conversation', { 
        status: tavusResponse.status, 
        headers: corsHeaders 
      })
    }

    const tavusData = await tavusResponse.json()
    
    return new Response(JSON.stringify(tavusData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Edge function error:', error)
    return new Response('Internal Server Error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})