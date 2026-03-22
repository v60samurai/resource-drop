"use client";

import { useEffect, useState } from "react";

interface ToastProps {
  message: string;
  type: "error" | "success";
  onClose: () => void;
}

export function Toast({ message, type, onClose }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
      setTimeout(onClose, 200); // Wait for exit animation
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 ${isExiting ? "toast-exit" : "toast-enter"}`}
      role="alert"
    >
      <div
        className="flex items-center gap-3 px-5 py-4 border-l-4 rounded-r shadow-lg"
        style={{
          backgroundColor: "var(--surface)",
          borderLeftColor: type === "error" ? "var(--error)" : "var(--success)",
          boxShadow: "0 4px 20px rgba(0,0,0,0.12)",
          fontFamily: "var(--font-source-sans)",
        }}
      >
        {/* Icon */}
        {type === "success" ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--success)" }}
          >
            <polyline points="20 6 9 17 4 12" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--error)" }}
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        )}

        <div className="flex-1">
          <p
            className="text-[14px] font-medium"
            style={{ color: "var(--text)" }}
          >
            {message}
          </p>
        </div>

        <button
          onClick={() => {
            setIsExiting(true);
            setTimeout(onClose, 200);
          }}
          className="p-1 transition-colors duration-200 ml-2"
          style={{ color: "var(--text-muted)" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = "var(--text)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = "var(--text-muted)";
          }}
          aria-label="Dismiss"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
}
