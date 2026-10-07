import { forwardRef, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, Props>(({ label, error, className, id, name, ...props }, ref) => {
  const inputId = id ?? name;
  return (
    <div>
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium">{label}</label>
      <input
        ref={ref}
        id={inputId}
        name={name}
        aria-invalid={!!error}
        className={cn("w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm", error && "border-red-500", className)}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  );
});
Input.displayName = "Input";
