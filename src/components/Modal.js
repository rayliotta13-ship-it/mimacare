/**
 * Composant Modal réutilisable pour MimaCare
 */

export const Modal = ({ isOpen, title, children, onClose, primaryAction, primaryText = "Valider", secondaryText = "Annuler" }) => {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      background: "rgba(0,0,0,0.5)",
      display: "flex",
      alignItems: "flex-end",
      zIndex: 1000,
      animation: "slideUp 0.3s ease-out"
    }}>
      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
      `}</style>
      <div style={{
        width: "100%",
        background: "#FFFFFF",
        borderRadius: "24px 24px 0 0",
        padding: "24px 20px 20px",
        maxHeight: "85vh",
        overflowY: "auto",
        boxShadow: "0 -2px 10px rgba(0,0,0,0.1)"
      }}>
        {title && (
          <div style={{
            fontSize: "20px",
            fontWeight: "800",
            color: "#1A1A1A",
            marginBottom: "16px"
          }}>
            {title}
          </div>
        )}
        <div style={{ marginBottom: "20px" }}>
          {children}
        </div>
        <div style={{
          display: "flex",
          gap: "10px"
        }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              padding: "13px",
              background: "#F7F7F5",
              color: "#1A1A1A",
              border: "1px solid #EAEAEA",
              borderRadius: "12px",
              fontSize: "15px",
              fontWeight: "700",
              cursor: "pointer"
            }}
          >
            {secondaryText}
          </button>
          {primaryAction && (
            <button
              onClick={primaryAction}
              style={{
                flex: 1,
                padding: "13px",
                background: "#2D7A4F",
                color: "#FFFFFF",
                border: "none",
                borderRadius: "12px",
                fontSize: "15px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              {primaryText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
