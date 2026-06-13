import { useEffect, useState, useId } from "react";

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const titleId = useId();

  useEffect(() => {
    setIsMobile(window.innerWidth < 640);
    const handler = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center',
        background: 'rgba(0,0,0,0.75)',
        padding: isMobile ? 0 : '16px',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        style={{
          background: '#1a0f2e',
          border: isMobile ? 'none' : '1px solid rgba(255,214,98,0.2)',
          borderRadius: isMobile ? '20px 20px 0 0' : '20px',
          padding: isMobile ? '20px 16px 32px' : '28px',
          width: '100%',
          maxWidth: isMobile ? '100%' : '640px',
          maxHeight: isMobile ? '92vh' : '90vh',
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}>
          <h3
            id={titleId}
            style={{ color: '#FFD662', fontSize: '18px', fontWeight: 700, margin: 0 }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Yopish"
            className="hover:bg-white/10 focus:ring-2 focus:ring-[#FFD662] focus:outline-none transition-all"
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.15)',
              borderRadius: '10px',
              padding: '8px 14px',
              color: 'rgba(255,255,255,0.7)',
              fontSize: '14px',
              cursor: 'pointer',
            }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
