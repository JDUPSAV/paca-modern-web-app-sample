import * as React from "react"
import { createPortal } from "react-dom"

import { IconX } from "@tabler/icons-react"

import { cn } from "@/lib/utils"

type ModalProps = {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: ModalProps) {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    if (!open) return
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [open, onClose])

  if (!mounted || !open) {
    return null
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div
        className="bg-background/70 absolute inset-0 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 w-full max-w-3xl rounded-xl border bg-background p-6 shadow-2xl",
          "max-h-[85vh] overflow-y-auto",
          className
        )}
      >
        <button
          type="button"
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground absolute right-4 top-4 inline-flex size-8 items-center justify-center rounded-full border border-transparent bg-transparent transition hover:border-muted-foreground/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Close"
        >
          <IconX className="size-4" />
        </button>
        <div className="flex flex-col gap-2">
          {title ? (
            <h2 className="text-lg font-semibold leading-tight">{title}</h2>
          ) : null}
          {description ? (
            <p className="text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        <div className="mt-4 flex flex-col gap-4">{children}</div>
        {footer ? <div className="mt-6 flex justify-end gap-2">{footer}</div> : null}
      </div>
    </div>,
    document.body
  )
}

export { Modal }
