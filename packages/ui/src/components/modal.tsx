import * as React from "react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./dialog";

export interface ModalProps {
  /** Visible heading. Also used as the accessible dialog label. */
  title: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  /** Actions rendered in the footer - pass Buttons here. */
  footer?: React.ReactNode;
  /** Element that opens the modal. Ignored when the modal is controlled. */
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  size?: "sm" | "default" | "lg" | "xl";
  closeOnOverlayClick?: boolean;
}

/**
 * Application-level modal. Wraps the Radix dialog primitives so every app gets
 * the same focus trap, escape handling and labelling without repeating markup.
 */
function Modal({
  title,
  description,
  children,
  footer,
  trigger,
  open,
  onOpenChange,
  size = "default",
  closeOnOverlayClick = true,
}: ModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : null}
      <DialogContent
        size={size}
        onInteractOutside={(event) => {
          if (!closeOnOverlayClick) {
            event.preventDefault();
          }
        }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="grid gap-4">{children}</div>
        {footer ? <DialogFooter>{footer}</DialogFooter> : null}
      </DialogContent>
    </Dialog>
  );
}

export { Modal };
