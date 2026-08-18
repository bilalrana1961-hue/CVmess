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
    const { data: officer } = await caller.from("officer_accounts").select("level").eq("user_id", user.id).maybeSingle();
    if (!officer || officer.level !== "head_officer") return new Response(JSON.stringify({ error: "Only the Head Officer can manage accounts." }), { status: 403, headers });

    const { targetId, targetType, action, temporaryPassword } = await request.json();
    if (!targetId || !["member", "officer"].includes(targetType) || !["reset_password", "delete"].includes(action)) {
      return new Response(JSON.stringify({ error: "A valid account and action are required." }), { status: 400, headers });
    }
    if (targetId === user.id) return new Response(JSON.stringify({ error: "The Head Officer cannot modify or delete their own account here." }), { status: 400, headers });

    const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: target } = await admin.from("profiles").select("id, role").eq("id", targetId).maybeSingle();
    if (!target || target.role !== (targetType === "officer" ? "officer" : "member")) {
      return new Response(JSON.stringify({ error: "The selected account was not found." }), { status: 404, headers });
    }
    if (targetType === "officer") {
      const { data: targetOfficer } = await admin.from("officer_accounts").select("level").eq("user_id", targetId).maybeSingle();
      if (!targetOfficer || targetOfficer.level !== "mess_officer") return new Response(JSON.stringify({ error: "Head Officer accounts cannot be managed from this action." }), { status: 403, headers });
    }

    if (action === "reset_password") {
      if (typeof temporaryPassword !== "string" || temporaryPassword.length < 8) return new Response(JSON.stringify({ error: "The temporary password must contain at least 8 characters." }), { status: 400, headers });
      const { error } = await admin.auth.admin.updateUserById(targetId, { password: temporaryPassword });
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { status: 200, headers });
    }

    const { error } = await admin.auth.admin.deleteUser(targetId);
    if (error) throw error;
    return new Response(JSON.stringify({ success: true }), { status: 200, headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unable to manage account" }), { status: 400, headers });
  }
});
