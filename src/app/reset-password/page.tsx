import type { Metadata } from "next";
import { PasswordForm } from "@/components/password-form";

export const metadata: Metadata = { title: "Choose a new password" };
export default function ResetPasswordPage() { return <PasswordForm mode="update" />; }
