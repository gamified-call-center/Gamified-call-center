import Button from "@/commonComponents/Button";
import { Channel, ChatUser, MessagesByThread, PresenceStatus } from "./types";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Users,
  Lock,
  ArrowLeft,
  Phone,
  Video,
  MoreVertical,
  MessageSquare,
  Paperclip,
  Smile,
  Send,
  CheckCheck,
  Search,
  Pin,
  BellOff,
  AlertCircle,
} from "lucide-react";

export function getStatusColor(status: PresenceStatus) {
  switch (status) {
    case "online":
      return "bg-green-500";
    case "away":
      return "bg-yellow-500";
    case "offline":
    default:
      return "bg-gray-400";
  }
}

export function getStatusText(status: PresenceStatus) {
  switch (status) {
    case "online":
      return "Online";
    case "away":
      return "Away";
    case "offline":
    default:
      return "Offline";
  }
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join("");
}

export function useIsBelow1300() {
  const [isBelow, setIsBelow] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1299px)");
    const update = () => setIsBelow(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return isBelow;
}

export function getTimeHour(isoString: string): string {
  const date = new Date(isoString);

  let hours = date.getHours(); // 0–23
  const minutes = date.getMinutes();

  const isPM = hours >= 12;
  hours = hours % 12;
  hours = hours === 0 ? 12 : hours; // 12 instead of 0

  const mm = minutes.toString().padStart(2, "0");

  return `${hours}:${mm}`;
}





import React from "react";

export function IconBtn({
  label,
  className = "",
  onClick,
  type = "button",
  disabled,
  children,
}: {
  label: string;
  className?: string;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      onClick={onClick}
      disabled={disabled}
      className={[
        "p-2 rounded-xl inline-flex items-center justify-center",
        disabled ? "opacity-60 cursor-not-allowed" : "",
        className,
      ].join(" ")}
    >
      {children}
    </button>
  );
}
