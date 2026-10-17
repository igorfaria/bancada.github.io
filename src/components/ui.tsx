import * as Dialog from "@radix-ui/react-dialog";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonStyles = cva(
  "press inline-flex items-center justify-center gap-2 font-medium transition-[background-color,opacity,transform] duration-150 ease-out disabled:pointer-events-none disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
  {
    variants: {
      variant: {
        primary: "bg-accent text-accent-fg hover:opacity-90",
        secondary: "border border-line-strong bg-surface text-ink hover:bg-elevated",
        ghost: "bg-transparent text-ink hover:bg-surface",
        danger: "bg-danger-bg text-danger hover:opacity-90",
      },
      size: {
        md: "h-11 rounded-sm px-4 text-sm",
        sm: "h-11 rounded-sm px-3 text-sm",
        icon: "size-11 rounded-sm",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonStyles>;

export function Button({ className, variant, size, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={cn(buttonStyles({ variant, size }), className)} {...props} />;
}

const fieldClass =
  "h-11 w-full rounded-sm border border-line-strong bg-elevated px-3 text-base text-ink placeholder:text-subtle focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(fieldClass, className)} {...props} />;
}

export function TextArea({ className, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(fieldClass, "min-h-24 py-2 leading-normal", className)}
      {...props}
    />
  );
}

export function Select({ className, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select className={cn(fieldClass, "appearance-none", className)} {...props} />;
}

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="text-sm text-muted">{hint}</span> : null}
    </label>
  );
}

export function Badge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex h-6 items-center rounded-full bg-danger-bg px-2 text-xs font-medium text-danger">
      {children}
    </span>
  );
}

export function Drawer({
  title,
  description,
  onClose,
  children,
  footer,
}: {
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <Dialog.Root open onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="overlay-in fixed inset-0 z-50 bg-ink/30" />
        <Dialog.Content className="drawer-panel fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-surface outline-none">
          <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-4">
            <div>
              <Dialog.Title className="text-lg font-medium tracking-tight">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-1 text-sm text-muted">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">Painel</Dialog.Description>
              )}
            </div>
            <Button variant="ghost" size="icon" aria-label="Fechar" onClick={onClose}>
              <span aria-hidden="true" className="text-lg leading-none">
                ×
              </span>
            </Button>
          </header>
          <div className="flex-1 overflow-y-auto px-4 py-4">{children}</div>
          {footer ? <footer className="safe-bottom flex gap-2 border-t border-line px-4 py-4">{footer}</footer> : null}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
