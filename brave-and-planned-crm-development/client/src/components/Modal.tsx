export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="panel w-full max-w-2xl p-6">
        <div className="mb-5 flex items-center justify-between">
          <h3 className="font-display text-2xl text-white">{title}</h3>
          <button className="btn-secondary" onClick={onClose}>
            Yopish
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
