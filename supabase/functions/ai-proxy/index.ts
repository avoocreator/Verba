import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || "";
const PRIMARY_MODEL = Deno.env.get("OPENROUTER_MODEL") || "google/gemini-2.0-flash-lite:free";
const FALLBACK_MODELS = (Deno.env.get("OPENROUTER_MODEL_FALLBACKS") || "meta-llama/llama-3.3-70b-instruct:free,mistralai/mistral-7b-instruct:free").split(",");
const DAILY_LIMIT = parseInt(Deno.env.get("AI_DAILY_LIMIT_PER_USER") || "15", 10);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization token" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized user" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: allowed } = await supabaseClient
      .from("allowed_emails")
      .select("email")
      .eq("email", user.email)
      .single();

    if (!allowed) {
      return new Response(JSON.stringify({ error: "Akses terbatas: Email tidak terdaftar dalam undangan." }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const today = new Date().toISOString().split("T")[0];
    const { data: usage } = await supabaseClient
      .from("ai_usage")
      .select("count")
      .eq("user_id", user.id)
      .eq("day", today)
      .single();

    const currentCount = usage?.count || 0;
    if (currentCount >= DAILY_LIMIT) {
      return new Response(
        JSON.stringify({ error: `Batas harian AI (${DAILY_LIMIT}/hari) telah tercapai. Fitur penilaian bebas dijeda sampai besok.` }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    await supabaseClient.from("ai_usage").upsert({
      user_id: user.id,
      day: today,
      count: currentCount + 1,
    });

    const { action, prompt, systemPrompt } = await req.json();

    const modelsToTry = [PRIMARY_MODEL, ...FALLBACK_MODELS];
    let aiText = "";
    let lastError = "";

    for (const model of modelsToTry) {
      try {
        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
            "HTTP-Referer": "https://verba.app",
            "X-Title": "Verba AI Vocabulary",
          },
          body: JSON.stringify({
            model: model.trim(),
            messages: [
              { role: "system", content: systemPrompt || "You are a precise English vocabulary assistant for Indonesian learners. Output only valid JSON." },
              { role: "user", content: prompt },
            ],
            temperature: 0.3,
          }),
        });

        if (response.ok) {
          const json = await response.json();
          aiText = json.choices[0]?.message?.content || "";
          if (aiText) break;
        } else {
          lastError = `Model ${model} returned HTTP ${response.status}`;
        }
      } catch (err) {
        lastError = String(err);
      }
    }

    if (!aiText) {
      throw new Error(`Semua model AI sedang tidak tersedia: ${lastError}`);
    }

    return new Response(JSON.stringify({ ok: true, data: aiText }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
