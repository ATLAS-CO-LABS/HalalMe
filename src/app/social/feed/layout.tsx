// Publicly browsable, same as /social/post/[id] — posting, liking, bookmarking
// and the Following/Saved tabs are gated individually via useAuthGate
// instead of the whole page requiring login.
export default function HubFeedLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
