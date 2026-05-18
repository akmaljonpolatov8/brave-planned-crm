export function PageShell({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-6">
      <div className="panel flex flex-col gap-4 p-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="font-display text-3xl text-white">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">{description}</p>
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
