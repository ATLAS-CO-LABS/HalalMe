import AuthGuard from "@/components/auth/AuthGuard";

export default function HubFeedLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard>{children}</AuthGuard>;
}
