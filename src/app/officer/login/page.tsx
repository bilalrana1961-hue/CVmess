import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";

export const metadata: Metadata = { title: "Officer sign in" };
export default function OfficerLoginPage() { return <AuthForm mode="login" officer />; }
