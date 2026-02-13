import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Verify the calling user is authenticated and is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    )

    const token = authHeader.replace('Bearer ', '')
    const { data: claimsData, error: claimsError } = await supabaseClient.auth.getClaims(token)
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), { 
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const callerUserId = claimsData.claims.sub

    // Check if caller is admin using service role
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { autoRefreshToken: false, persistSession: false } }
    )

    const { data: callerRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', callerUserId)
      .single()

    if (!callerRole || callerRole.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Permissão negada. Apenas administradores podem gerenciar usuários.' }), { 
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      })
    }

    const { action, ...payload } = await req.json()

    switch (action) {
      case 'create': {
        const { email, password, name, role } = payload

        if (!email || !password) {
          return new Response(JSON.stringify({ error: 'Email e senha são obrigatórios' }), { 
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          })
        }

        // Create user via admin API
        const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
          email,
          password,
          email_confirm: true,
          user_metadata: { name: name || email }
        })

        if (authError) throw authError

        if (authData.user) {
          // Create profile
          await supabaseAdmin.from('profiles').insert({
            id: authData.user.id,
            email,
            name: name || email
          })

          // Assign role
          await supabaseAdmin.from('user_roles').insert({
            user_id: authData.user.id,
            role: role || 'analista'
          })
        }

        return new Response(JSON.stringify({ success: true, user: authData.user }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      case 'delete': {
        const { userId } = payload

        if (!userId) {
          return new Response(JSON.stringify({ error: 'userId é obrigatório' }), { 
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          })
        }

        // Prevent self-deletion
        if (userId === callerUserId) {
          return new Response(JSON.stringify({ error: 'Você não pode excluir sua própria conta' }), { 
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          })
        }

        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId)
        if (deleteError) throw deleteError

        return new Response(JSON.stringify({ success: true }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      case 'update-role': {
        const { userId, role } = payload

        if (!userId || !role) {
          return new Response(JSON.stringify({ error: 'userId e role são obrigatórios' }), { 
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
          })
        }

        const { error: roleError } = await supabaseAdmin
          .from('user_roles')
          .upsert({ user_id: userId, role }, { onConflict: 'user_id' })

        if (roleError) throw roleError

        return new Response(JSON.stringify({ success: true }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
      }

      default:
        return new Response(JSON.stringify({ error: 'Ação inválida' }), { 
          status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        })
    }

  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: error.message || 'Erro interno', success: false }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})