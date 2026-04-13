// Hub landing (/hub) is public. Auth is enforced per-route:
//   /hub/feed → src/app/hub/feed/layout.tsx
// Post detail (/hub/post/[id]) is intentionally public (readable without login).
export default function HubLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
