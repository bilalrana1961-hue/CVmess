import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Create officer account" };
export default async function OfficerJoinPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code = "" } = await searchParams;
  return code ? <AuthForm mode="signup" officer inviteCode={code} /> : <main className="auth-page"><section className="auth-panel"><div className="auth-box"><h2>Invalid officer invitation</h2><p>Ask an existing mess officer for a new invitation link.</p></div></section></main>;
}
