// src/components/ui/Modal/Modal.tsx
import React, { Fragment, ReactNode, useMemo } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { X } from "lucide-react";
import { cn } from "@/Utils/common/cn";

type ModalSize = "sm" | "md" | "lg" | "xl" | "2xl" | "full";

type ModalProps = {
    open: boolean;
    onClose: () => void;

    title?: ReactNode;
    subtitle?: ReactNode;

    children: ReactNode;

    footer?: ReactNode;

    primaryAction?: {
        label: string;
        onClick: () => void;
        disabled?: boolean;
        loading?: boolean;
    };
    secondaryAction?: {
        label: string;
        onClick?: () => void;
        disabled?: boolean;
    };
    size?: ModalSize;
    showCloseIcon?: boolean;
    closeOnOverlayClick?: boolean;
    closeOnEsc?: boolean;
    preventClose?: boolean;
    shouldConfirmClose?: boolean;
    onConfirmClose?: () => void;
    className?: string;
    overlayClassName?: string;
    headerClassName?: string;
    bodyClassName?: string;
    footerClassName?: string;
    scrollBody?: boolean;
};

export default function Modal({
    open,
    onClose,

    title,
    subtitle,
    children,

    footer,
    primaryAction,
    secondaryAction,

    size = "lg",
    showCloseIcon = true,

    closeOnOverlayClick = true,
    closeOnEsc = true,
    preventClose = false,
    shouldConfirmClose = false,
    onConfirmClose,

    className,
    overlayClassName,
    headerClassName,
    bodyClassName,
    footerClassName,

    scrollBody = true,
}: ModalProps) {
    const maxWidth = useMemo(() => {
        switch (size) {
            case "sm":
                return "max-w-md";
            case "md":
                return "max-w-lg";
            case "lg":
                return "max-w-2xl";
            case "xl":
                return "max-w-4xl";
            case "2xl":
                return "max-w-6xl";
            case "full":
                return "max-w-[96vw] h-[92vh]";
            default:
                return "max-w-2xl";
        }
    }, [size]);

    const canClose = !preventClose;

    const handleRequestClose = () => {
        if (!canClose) return;

        if (shouldConfirmClose && onConfirmClose) {
            onConfirmClose();
            return;
        }

        onClose();
    };

       const headlessOnClose = () => {
        if (!canClose) return;
        if (!closeOnOverlayClick) return;
        handleRequestClose();
    };

    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog
                as="div"
                className="relative z-100"
                onClose={headlessOnClose}
                static={!closeOnOverlayClick} 
            >
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-200"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-150"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div
                        className={cn(
                            "fixed inset-0 app-text backdrop-blur-[2px]",
                            overlayClassName
                        )}
                        onClick={() => {
                            if (!closeOnOverlayClick) return;
                            handleRequestClose();
                        }}
                    />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-200"
                            enterFrom="opacity-0 scale-95 translate-y-2"
                            enterTo="opacity-100 scale-100 translate-y-0"
                            leave="ease-in duration-150"
                            leaveFrom="opacity-100 scale-100 translate-y-0"
                            leaveTo="opacity-0 scale-95 translate-y-2"
                        >
                            <Dialog.Panel
                                className={cn(
                                    "relative w-full rounded-2xl app-card shadow-xl ring-1 ring-black/5",
                                    "dark:bg-slate-100 dark:ring-white/10",
                                    maxWidth,
                                    size === "full" ? "p-0" : "p-0",
                                    className
                                )}
                                onKeyDown={(e) => {
                                    if (!closeOnEsc) return;
                                    if (e.key === "Escape") handleRequestClose();
                                }}
                            >
                                {/* Header */}
                                {(title || subtitle || showCloseIcon) && (
                                    <div
                                        className={cn(
                                            "flex items-start app-text justify-between gap-4 border-b px-5 py-4",
                                            "border-slate-200 dark:border-slate-800",
                                            headerClassName
                                        )}
                                    >
                                        <div className="min-w-0">
                                            {title ? (
                                                <Dialog.Title className="text-base  font-Gordita-Bold app-text ">
                                                    {title}
                                                </Dialog.Title>
                                            ) : null}

                                            {subtitle ? (
                                                <p className="mt-1 text-sm app-text">
                                                    {subtitle}
                                                </p>
                                            ) : null}
                                        </div>

                                        {showCloseIcon ? (
                                            <button
                                                type="button"
                                                onClick={handleRequestClose}
                                                className={cn(
                                                    "rounded-xl p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700",
                                                    "dark:hover:bg-slate-800 dark:text-slate-400 dark:hover:text-slate-200",
                                                    !canClose && "opacity-50 pointer-events-none"
                                                )}
                                                aria-label="Close modal"
                                            >
                                                <X size={18} />
                                            </button>
                                        ) : null}
                                    </div>
                                )}

                                {/* Body */}
                                <div
                                    className={cn(
                                        "px-5 py-4",
                                        scrollBody && "max-h-[70vh] overflow-auto",
                                        size === "full" && "h-[calc(92vh-64px-72px)]", // header+footer heights approx
                                        bodyClassName
                                    )}
                                >
                                    {children}
                                </div>

                                {/* Footer */}
                                {(footer || primaryAction || secondaryAction) && (
                                    <div
                                        className={cn(
                                            "flex items-center justify-end gap-2 border-t px-5 py-4",
                                            "border-slate-200 dark:border-slate-800",
                                            footerClassName
                                        )}
                                    >
                                        {footer ? (
                                            footer
                                        ) : (
                                            <>
                                                {secondaryAction ? (
                                                    <button
                                                        type="button"
                                                        onClick={secondaryAction.onClick ?? handleRequestClose}
                                                        disabled={secondaryAction.disabled}
                                                        className={cn(
                                                            "rounded-xl cursor-pointer border px-4 py-2 text-sm  font-Gordita-Medium",
                                                            "border-slate-200 text-slate-700 hover:bg-slate-50",
                                                            "dark:border-slate-700  dark:hover:bg-slate-800",
                                                            secondaryAction.disabled && "opacity-60 cursor-not-allowed"
                                                        )}
                                                    >
                                                        {secondaryAction.label}
                                                    </button>
                                                ) : null}

                                                {primaryAction ? (
                                                    <button
                                                        type="button"
                                                        onClick={primaryAction.onClick}
                                                        disabled={primaryAction.disabled || primaryAction.loading}
                                                        className={cn(
                                                            "rounded-xl cursor-pointer bg-indigo-600 px-4 py-2 text-sm  font-Gordita-Bold text-white hover:bg-indigo-700",
                                                            "disabled:opacity-60 disabled:cursor-not-allowed"
                                                        )}
                                                    >
                                                        {primaryAction.loading ? "Please wait..." : primaryAction.label}
                                                    </button>
                                                ) : null}
                                            </>
                                        )}
                                    </div>
                                )}
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}
