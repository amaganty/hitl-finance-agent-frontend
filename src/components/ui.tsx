import * as React from "react";

function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

/* ---------------- Card ---------------- */
export function Card({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-zinc-200/70 bg-white/85 shadow-sm backdrop-blur",
        "dark:border-zinc-800/70 dark:bg-zinc-900/40",
        className
      )}
    >
      {children}
    </div>
  );
}

/* ---------------- Container ---------------- */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return <div className={cn("mx-auto max-w-6xl px-6", className)}>{children}</div>;
}

/* ---------------- Badge ---------------- */
export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: "default" | "secondary" | "success" | "danger";
  children: React.ReactNode;
}) {
  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium";

  const styles =
    variant === "secondary"
      ? // neutral pill
        "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
      : variant === "success"
      ? // green pill
        "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100"
      : variant === "danger"
      ? // red pill
        "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100"
      : // default pill
        "bg-zinc-100 text-zinc-900 dark:bg-zinc-900/60 dark:text-zinc-100";

  return <span className={cn(base, styles, className)}>{children}</span>;
}

/* ---------------- Button ---------------- */
export function Button({
  className,
  variant = "default",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "default" | "secondary";
}) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition";
  const styles =
    variant === "secondary"
      ? "bg-zinc-200 text-zinc-900 hover:bg-zinc-300 dark:bg-zinc-800 dark:text-zinc-100 dark:hover:bg-zinc-700"
      : // ✅ Fix: keep default button dark in dark mode too (readable everywhere)
        "bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800";
  const disabled = "disabled:opacity-50 disabled:cursor-not-allowed";
  return <button {...props} className={cn(base, styles, disabled, className)} />;
}

/* ---------------- Input ---------------- */
export function Input({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={cn(
        "w-full rounded-md border px-3 py-2 text-sm",
        "border-zinc-300 bg-white text-zinc-900 placeholder:text-zinc-400",
        "dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100 dark:placeholder:text-zinc-500",
        "focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600",
        className
      )}
    />
  );
}

/* ---------------- Select ---------------- */
/**
 * Backward compatible:
 * A) <Select value onValueChange options={[...]} />
 * B) <Select value onChange> <option/>...</Select>
 */
type SelectProps =
  | ({
      value?: string;
      onValueChange?: (v: string) => void;
      options?: string[];
      className?: string;
    } & Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange">)
  | (React.SelectHTMLAttributes<HTMLSelectElement> & { options?: never; onValueChange?: never });

export function Select(props: SelectProps) {
  const anyProps = props as any;

  const value = anyProps.value ?? "";
  const options: string[] | undefined = anyProps.options;
  const onValueChange: ((v: string) => void) | undefined = anyProps.onValueChange;

  const className = anyProps.className;
  const rest = { ...anyProps };
  delete rest.options;
  delete rest.onValueChange;

  return (
    <select
      {...rest}
      value={value}
      onChange={(e) => {
        if (onValueChange) onValueChange(e.target.value);
        if (anyProps.onChange) anyProps.onChange(e);
      }}
      className={cn(
        "w-full rounded-md border px-3 py-2 text-sm",
        "border-zinc-300 bg-white text-zinc-900",
        "dark:border-zinc-700 dark:bg-zinc-950/60 dark:text-zinc-100",
        "focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-600",
        className
      )}
    >
      {options
        ? options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))
        : anyProps.children}
    </select>
  );
}
