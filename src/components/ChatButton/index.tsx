import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  size?: number;
  offsetX?: number;
  offsetY?: number;
  badgeCount?: number;
  title?: string;
};

export default function FloatingChatButton({
  size = 56,
  offsetX = 20,
  offsetY = 20,
  badgeCount = 0,
  title = "Chat",
}: Props) {
  const [isPulsing, setIsPulsing] = useState(true);
  const router = useRouter();

  const handleChatClick = () => {
    router.push("/chat-history");
  };

  return (
    <>
      <style>{`
        @keyframes chat-bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes chat-pulse-ring {
          0% { transform: scale(0.85); opacity: 0.65; }
          100% { transform: scale(1.35); opacity: 0; }
        }
        .chat-fab {
          position: fixed;
          right: ${offsetX}px;   /* 👈 moved here */
          bottom: ${offsetY}px;
          width: ${size}px;
          height: ${size}px;
          border-radius: 999px;
          border: none;
          cursor: pointer;
          z-index: 2147483000;
          display: grid;
          place-items: center;
          background: linear-gradient(135deg, #2563eb, #7c3aed);
          box-shadow: 0 12px 30px rgba(0,0,0,0.25);
          animation: chat-bob 2.4s ease-in-out infinite;
        }
        .chat-fab:active {
          transform: scale(0.98);
        }
        .pulse-ring {
          position: absolute;
          inset: -10px;
          border-radius: 999px;
          border: 2px solid rgba(37, 99, 235, 0.55);
          animation: chat-pulse-ring 0.9s ease-out;
          pointer-events: none;
        }
        .badge {
          position: absolute;
          top: -6px;
          right: -6px;
          min-width: 20px;
          height: 20px;
          padding: 0 6px;
          border-radius: 999px;
          background: #ef4444;
          color: white;
          font-size: 12px;
          font-weight: 700;
          display: grid;
          place-items: center;
        }
        .icon {
          width: ${Math.round(size * 0.5)}px;
          height: ${Math.round(size * 0.5)}px;
          fill: white;
        }
      `}</style>

      <button
        className="chat-fab"
        onClick={() => handleChatClick()}
        aria-label={title}
        title={title}
      >
        {isPulsing && <span className="pulse-ring" />}
        {badgeCount > 0 && (
          <span className="badge">{badgeCount > 99 ? "99+" : badgeCount}</span>
        )}

        <svg className="icon" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M20 3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3v3.2a.8.8 0 0 0 1.37.57L12.14 18H20a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Zm0 13H11.6a1 1 0 0 0-.7.29L9 18.2V17a1 1 0 0 0-1-1H4V5h16v11Z" />
          <path d="M7 8h10v2H7V8Zm0 4h7v2H7v-2Z" />
        </svg>
      </button>
    </>
  );
}
