import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

Deno.serve(async (request) => {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
  if (request.method === "OPTIONS") return new Response("ok", { headers });
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers });
    const url = Deno.env.get("SUPABASE_URL")!;
    const key = Deno.env.get("SUPABASE_ANON_KEY")!;
    const caller = createClient(url, key, { global: { headers: { Authorization: authorization } } });
    const { data: invite, error: inviteError } = await caller.rpc("create_officer_invite");
    if (inviteError) throw inviteError;

    const { name, email, password, unit } = await request.json();
    if (!name || !email || !password || !unit || password.length < 8) {
      return new Response(JSON.stringify({ error: "Name, email, unit and an 8-character password are required." }), { status: 400, headers });
    }
    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await admin.auth.admin.createUser({
      email, password, email_confirm: true,
      user_metadata: { full_name: name, room: unit, unit, account_type: "officer", officer_invite: invite },
      app_metadata: { cvmess_role: "mess_officer" },
    });
    if (error) throw error;
    return new Response(JSON.stringify({ id: data.user.id }), { status: 201, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to create officer" }), { status: 400, headers });
  }
});
