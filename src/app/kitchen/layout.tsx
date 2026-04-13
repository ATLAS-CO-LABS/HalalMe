import ErrorBoundary from "@/components/ErrorBoundary";

// /kitchen (landing page) is public.
// Sub-routes protect themselves via their own layouts.
export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ErrorBoundary>
      <div className="pt-14 md:pt-16">
        {children}
      </div>
    </ErrorBoundary>
  );
}
