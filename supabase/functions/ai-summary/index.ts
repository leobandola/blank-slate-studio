import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch recent activities
    const { data: activities } = await supabase
      .from("activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    const { data: osiActivities } = await supabase
      .from("osi_activities")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    const totalActivities = activities?.length || 0;
    const completed = activities?.filter(a => a.status === "CONCLUÍDO").length || 0;
    const pending = activities?.filter(a => a.status === "PENDENTE").length || 0;
    const overdue = activities?.filter(a => {
      if (!a.prazo || a.status === "CONCLUÍDO" || a.status === "CANCELADO") return false;
      return new Date(a.prazo) < new Date();
    }).length || 0;

    const statusCounts: Record<string, number> = {};
    activities?.forEach(a => {
      statusCounts[a.status] = (statusCounts[a.status] || 0) + 1;
    });

    const teamCounts: Record<string, number> = {};
    activities?.forEach(a => {
      teamCounts[a.equipe || "Não informado"] = (teamCounts[a.equipe || "Não informado"] || 0) + 1;
    });

    const prompt = `Você é um assistente de produtividade corporativa. Analise os dados das atividades e forneça um resumo executivo em português do Brasil.

Dados:
- Total de atividades: ${totalActivities}
- Concluídas: ${completed}
- Pendentes: ${pending}
- Atrasadas: ${overdue}
- OSI total: ${osiActivities?.length || 0}
- Distribuição por status: ${JSON.stringify(statusCounts)}
- Distribuição por equipe: ${JSON.stringify(teamCounts)}

Forneça:
1. **Resumo Geral** (2-3 frases)
2. **Pontos de Atenção** (itens atrasados ou críticos)
3. **Sugestões de Produtividade** (2-3 dicas práticas)
4. **Tendência** (como está a evolução)

Seja conciso e direto. Use emojis moderadamente.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "user", content: prompt }],
        max_tokens: 1000,
      }),
    });

    const aiData = await aiResponse.json();
    const summary = aiData.choices?.[0]?.message?.content || "Não foi possível gerar o resumo.";

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
