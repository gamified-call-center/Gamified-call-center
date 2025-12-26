import { Fragment, HTMLProps, ReactNode, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { VscChromeClose } from "react-icons/vsc"
import { twMerge } from 'tailwind-merge'
import { clsx } from 'clsx'

interface IDrawerProps {
  closeOnOutsideClick?: boolean
  hideHeader?: boolean
  title?: string
  open: boolean
  handleDrawerToggle: (flag: boolean) => void
  children: ReactNode
  openVariant?: "left" | "right"
  panelCls?: HTMLProps<HTMLElement>["className"]
  panelInnerCls?: HTMLProps<HTMLElement>["className"]
  overLayCls?: HTMLProps<HTMLElement>["className"]
  titleCls?: HTMLProps<HTMLElement>["className"]
  className?: HTMLProps<HTMLElement>["className"]
  closeIconCls?: HTMLProps<HTMLElement>["className"]
}

export default function Drawer({
  closeOnOutsideClick = false,
  handleDrawerToggle,
  title,
  open,
  children,
  openVariant = "right",
  panelCls,
  panelInnerCls,
  titleCls,
  overLayCls,
  className,
  closeIconCls,
  hideHeader = false
}: IDrawerProps) {

  const initialFocusRef = useRef<any>(null)

  const outSideClickEvent = () => {
    handleDrawerToggle(closeOnOutsideClick ? false : true)
  }

  return (
    <Transition.Root show={open} appear as={Fragment}>
      <Dialog
        as="div"
        className={twMerge("relative z-50", className)}
        initialFocus={initialFocusRef}
        onClose={outSideClickEvent}
      >

        {/* Overlay */}
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-300"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div
            className={twMerge(
              "fixed inset-0 bg-black/50 backdrop-blur-xl",
              overLayCls
            )}
          />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="relative w-full h-full">

            {/* Drawer Panel */}
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500"
              enterFrom={openVariant === "right" ? "translate-x-full" : "-translate-x-full"}
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500"
              leaveFrom="translate-x-0"
              leaveTo={openVariant === "right" ? "translate-x-full" : "-translate-x-full"}
            >
              <Dialog.Panel
                ref={initialFocusRef}
                className={twMerge(
                  clsx(
                    "absolute h-full w-[90%] sm:w-[60%] lg:w-[45%]",
                    openVariant === "left" ? "left-0" : "right-0"
                  ),
                  // 🔥 GLASS PANEL
                  "bg-slate-800/40 backdrop-blur-xl border border-white/10 rounded-l-3xl shadow-xl",
                  panelCls
                )}
              >

                <div
                  className={twMerge(
                    "flex h-full w-full flex-col gap-6 px-6 py-6",
                    panelInnerCls
                  )}
                >

                  {/* Header */}
                  {!hideHeader && (
                    <div
                      className={clsx(
                        "flex items-center justify-between",
                        (!title || title.length === 0) && "justify-end"
                      )}
                    >
                      {title && (
                        <Dialog.Title
                          className={twMerge(
                            "text-lg  font-Gordita-Bold text-white",
                            titleCls
                          )}
                        >
                          {title}
                        </Dialog.Title>
                      )}

                      <VscChromeClose
                        className={twMerge(
                          "text-slate-400 text-2xl cursor-pointer transition-all duration-200 hover:text-white hover:rotate-90 active:scale-95",
                          closeIconCls
                        )}
                        onClick={() => handleDrawerToggle(false)}
                      />
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto text-white">
                    {children}
                  </div>

                </div>
              </Dialog.Panel>
            </Transition.Child>

          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}
