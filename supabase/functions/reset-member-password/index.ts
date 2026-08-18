import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (request) => {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    const url = Deno.env.get("SUPABASE_URL")!;
    const caller = createClient(url, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authorization } } });
    const { data: { user }, error: userError } = await caller.auth.getUser();
    if (userError || !user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    const { data: officer } = await caller.from("officer_accounts").select("user_id, level").eq("user_id", user.id).maybeSingle();
    if (!officer || officer.level !== "head_officer") return new Response(JSON.stringify({ error: "Only the Head Officer can reset member passwords." }), { status: 403, headers });

    const { memberId, temporaryPassword } = await request.json();
    if (!memberId || typeof temporaryPassword !== "string" || temporaryPassword.length < 8) {
      return new Response(JSON.stringify({ error: "Select a member and provide a temporary password of at least 8 characters." }), { status: 400, headers });
    }
    const { data: member, error: memberError } = await caller.from("profiles").select("id, role").eq("id", memberId).maybeSingle();
    if (memberError || !member || member.role !== "member") {
      return new Response(JSON.stringify({ error: "The selected member account was not found." }), { status: 404, headers });
    }

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { error } = await admin.auth.admin.updateUserById(memberId, { password: temporaryPassword });
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to reset member password" }), { status: 400, headers });
  }
});
