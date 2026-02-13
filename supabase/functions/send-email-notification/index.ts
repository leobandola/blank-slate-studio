import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const { type, user_id, activity_id, details } = await req.json();

    // Check user notification preferences
    const { data: prefs } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', user_id)
      .single();

    if (!prefs?.email_enabled) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'email_disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check specific preference
    const shouldSend = (() => {
      switch (type) {
        case 'deadline': return prefs.email_deadlines;
        case 'status_change': return prefs.email_status_changes;
        case 'new_assignment': return prefs.email_new_assignments;
        case 'daily_summary': return prefs.email_daily_summary;
        default: return true;
      }
    })();

    if (!shouldSend) {
      return new Response(JSON.stringify({ success: true, skipped: true, reason: 'preference_disabled' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user email
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', user_id)
      .single();

    if (!profile?.email) {
      return new Response(JSON.stringify({ success: false, error: 'no_email' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create in-app notification
    const notificationTitle = (() => {
      switch (type) {
        case 'deadline': return 'Prazo se aproximando!';
        case 'status_change': return 'Status atualizado';
        case 'new_assignment': return 'Nova atribuição';
        case 'daily_summary': return 'Resumo diário';
        default: return 'Notificação';
      }
    })();

    await supabase.from('notifications').insert({
      user_id,
      title: notificationTitle,
      message: details || 'Você tem uma nova notificação.',
      type: type === 'deadline' ? 'warning' : 'info',
      entity_type: 'email_notification',
      entity_id: activity_id || null,
    });

    // Log the email attempt (actual email sending would require an email service like Resend/SendGrid)
    console.log(`Email notification queued for ${profile.email}: ${notificationTitle} - ${details}`);

    return new Response(JSON.stringify({ 
      success: true, 
      email: profile.email,
      type,
      message: 'Notification created. Email service integration pending.' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in send-email-notification:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
