import React from 'react';

interface CompletionPopupProps {
  message: string;
  onDismiss: () => void;
}

export const CompletionPopup: React.FC<CompletionPopupProps> = ({
  message,
  onDismiss,
}) => {
  return (
    <div className="completion-popup-overlay">
      <div className="completion-popup">
        <div className="popup-content">
          <h3>Session Complete!</h3>
          <p>{message}</p>
          <button className="dismiss-btn" onClick={onDismiss}>
            Start New Session
          </button>
        </div>
      </div>
      
      <style>{`
        .completion-popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }

        .completion-popup {
          background: white;
          border-radius: 16px;
          padding: 2rem;
          max-width: 400px;
          width: 90%;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .popup-content h3 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.5rem;
        }

        .popup-content p {
          margin: 0 0 1.5rem 0;
          color: #666;
          line-height: 1.5;
        }

        .dismiss-btn {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 0.75rem 2rem;
          border-radius: 50px;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s ease;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .dismiss-btn:hover {
          background: #45a049;
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
};
