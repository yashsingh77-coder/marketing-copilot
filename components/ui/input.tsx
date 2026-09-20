import { forwardRef, useId } from "react";
import { cn } from "@/lib/utils";

type FieldProps = {
  label?: string;
  hint?: string;
  error?: string;
};

const fieldBase =
  "outline-brutal rounded-button w-full bg-paper px-4 font-body text-base text-ink placeholder:text-ink-soft/50 " +
  "focus:outline-none focus:ring-4 focus:ring-lemon focus:shadow-brutal transition-shadow";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & FieldProps>(
  function Input({ label, hint, error, className, id: idProp, ...props }, ref) {
    const autoId = useId();
    const id = idProp ?? autoId;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={id} className="font-bold text-ink">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          className={cn(fieldBase, "h-13", error && "border-secondary", className)}
          aria-invalid={!!error}
          {...props}
        />
        {(error || hint) && (
          <p className={cn("text-sm", error ? "font-bold text-secondary" : "text-ink-soft")}>{error ?? hint}</p>
        )}
      </div>
    );
  },
);

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps
>(function Textarea({ label, hint, error, className, id: idProp, ...props }, ref) {
  const autoId = useId();
  const id = idProp ?? autoId;
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={id} className="font-bold text-ink">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        id={id}
        className={cn(fieldBase, "min-h-28 py-3 leading-relaxed", error && "border-secondary", className)}
        aria-invalid={!!error}
        {...props}
      />
      {(error || hint) && (
        <p className={cn("text-sm", error ? "font-bold text-secondary" : "text-ink-soft")}>{error ?? hint}</p>
      )}
    </div>
  );
});
