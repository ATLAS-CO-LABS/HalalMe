import AuthGuard from "@/components/auth/AuthGuard";

export default function AiAssistantLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
