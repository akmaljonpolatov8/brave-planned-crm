import type { ReactNode } from "react";

export function Modal({
  open,
  title,
  onClose,
  children,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
        <div className="page-header" style={{ marginBottom: 16 }}>
          <h3>{title}</h3>
          <button className="btn-secondary" onClick={onClose}>
            Yopish
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
