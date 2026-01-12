export default function KitchenLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="pt-14 md:pt-16">
      {children}
    </div>
  );
}
