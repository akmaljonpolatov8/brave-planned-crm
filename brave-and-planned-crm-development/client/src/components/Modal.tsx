import { useEffect, useState } from "react";

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
          <h3 style={{ color: '#FFD662', fontSize: '18px', fontWeight: 700, margin: 0 }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            aria-label="Yopish"
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
