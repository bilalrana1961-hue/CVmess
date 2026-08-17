import type { Metadata } from "next";
import { PasswordForm } from "@/components/password-form";

export const metadata: Metadata = { title: "Reset password" };
export default function ForgotPasswordPage() { return <PasswordForm mode="request" />; }
