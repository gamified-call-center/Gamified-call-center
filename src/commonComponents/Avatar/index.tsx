"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, LogOut, User2, Settings } from "lucide-react";
import clsx from "clsx";
import { useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

export default function AvatarMenu({
  onLogout,
  fallbackName = "User",
}: {
  onLogout?: () => void;
  fallbackName?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const { data: session, status } = useSession();

  const { name, role } = useMemo(() => {
    const email = session?.user?.email ?? "";
    const role = session?.user?.systemRole ?? "USER";

    const displayName =
      (session?.user as any)?.firstName
        ? `${(session?.user as any)?.firstName} ${(session?.user as any)?.lastName ?? ""}`.trim()
        : email
          ? email.split("@")[0]
          : fallbackName;

    const displayRole =
      role === "ADMIN" ? "Administrator" : String(role);

    return { name: displayName, role: displayRole };
  }, [session, fallbackName]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleProfile = () => {
    setOpen(false);
    router.push("/userprofile");
  };

  const handleSettings = () => {
    setOpen(false);
    router.push("/settings");
  };

  const handleLogout = async () => {
    setOpen(false);
    onLogout?.();
    await signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-black/5 transition"
        aria-label="Open profile menu"
        aria-expanded={open}
      >
        <div className="h-9 w-9 rounded-full bg-black/10 flex items-center justify-center">
          <span className="text-sm font-bold text-black/60">
            {name?.[0]?.toUpperCase() ?? "U"}
          </span>
        </div>

        <div className="hidden sm:flex flex-col leading-tight text-left">
          <span className="text-sm font-bold text-[#111827]">
            {status === "loading" ? "Loading..." : name}
          </span>
          <span className="text-xs text-black/50">
            {status === "loading" ? "..." : role}
          </span>
        </div>

        <ChevronDown className="h-4 w-4 text-black/50 hidden sm:block" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-[10px] py-2 bg-white shadow-xl border border-black/10 z-50 overflow-hidden">
          <button
            className="w-full flex items-center gap-2 font-bold text-gray-700 px-4 md:py-2 py-1 text-sm hover:bg-black/5"
            onClick={handleProfile}
          >
            <User2 className="h-4 w-4" />
            Profile
          </button>

          <button
            className="w-full flex items-center text-gray-700 font-bold gap-2 px-4 md:py-2 py-1 text-sm hover:bg-black/5"
            onClick={handleSettings}
          >
            <Settings className="h-4 w-4" />
            Settings
          </button>

          <div className="h-px bg-black/10" />

          <button
            className={clsx(
              "w-full flex items-center gap-2 px-4 py-3 font-bold text-sm",
              "hover:bg-red-50 text-red-600"
            )}
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
