import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { conversation_id, event_type, data } = await req.json()

    console.log('Tavus webhook received:', { conversation_id, event_type, data })

    // Find the session by tavus_session_id
    const { data: session, error: findError } = await supabaseClient
      .from('ai_chat_sessions')
      .select('*')
      .eq('tavus_session_id', conversation_id)
      .single()

    if (findError || !session) {
      console.error('Session not found:', findError)
      return new Response('Session not found', { status: 404, headers: corsHeaders })
    }

    // Handle different webhook events
    switch (event_type) {
      case 'conversation_started':
        await supabaseClient
          .from('ai_chat_sessions')
          .update({
            status: 'active',
            started_at: new Date().toISOString()
          })
          .eq('id', session.id)
        break

      case 'conversation_ended':
        const duration = data?.duration_seconds || 300
        await supabaseClient
          .from('ai_chat_sessions')
          .update({
            status: 'completed',
            ended_at: new Date().toISOString(),
            duration_seconds: duration
          })
          .eq('id', session.id)
        break

      case 'conversation_failed':
        await supabaseClient
          .from('ai_chat_sessions')
          .update({
            status: 'failed',
            ended_at: new Date().toISOString()
          })
          .eq('id', session.id)
        break

      case 'transcript_available':
        // Store transcript or recording URL if provided
        if (data?.transcript_url || data?.recording_url) {
          await supabaseClient
            .from('ai_chat_sessions')
            .update({
              result_url: data.transcript_url || data.recording_url
            })
            .eq('id', session.id)
        }
        break

      default:
        console.log('Unhandled webhook event:', event_type)
    }

    return new Response('OK', { headers: corsHeaders })
  } catch (error) {
    console.error('Webhook error:', error)
    return new Response('Internal Server Error', { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})