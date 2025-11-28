import React, { useState } from "react";
import { cn } from "../utils";

// --- Icons ---
export const CopyIcon = () => <span aria-hidden>⧉</span>;
export const DownloadIcon = (props: any) => <span {...props} aria-hidden>⬇️</span>;

export const InfoIcon = ({ className, onClick }: { className?: string; onClick?: () => void }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={cn("w-4 h-4 text-gray-400 hover:text-gray-600 transition-colors", className)}
    onClick={onClick}
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

// --- Primitives ---
export function Tooltip({ content, children }: { content: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  
  return (
    <div className="relative inline-flex items-center ml-1.5">
      <button
        type="button"
        className="focus:outline-none"
        onClick={(e) => { e.preventDefault(); setOpen(!open); }}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label="Info"
      >
        {children || <InfoIcon />}
      </button>
      {open && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-gray-900/90 backdrop-blur text-white text-xs rounded-lg shadow-xl z-50 text-center pointer-events-none">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900/90" />
        </div>
      )}
    </div>
  );
}

export function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("rounded-2xl border border-gray-200 bg-white shadow-sm", className)} {...props}>{children}</div>;
}

export function CardContent({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-4 sm:p-6", className)} {...props}>{children}</div>;
}

export function Button({ className, children, onClick, variant = "primary", size = "default", type = "button", disabled }: {
  className?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost";
  size?: "default" | "icon";
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
}) {
  const base =
    "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition focus:outline-none border disabled:opacity-60 disabled:cursor-not-allowed";
  const variants: Record<string, string> = {
    primary: "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300",
    secondary: "bg-white text-gray-900 border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-200",
    ghost: "bg-transparent border-transparent hover:bg-gray-100",
  };
  const sizes: Record<string, string> = { default: "h-10", icon: "h-9 w-9 p-0" };
  return (
    <button
      type={type}
      disabled={disabled}
      className={cn(base, variants[variant], sizes[size], className)}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function Input({ className, value, defaultValue, onChange, readOnly, disabled, ...props }: any) {
  return (
    <input
      className={cn(
        "h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 placeholder:text-gray-400",
        "focus:outline-none focus:ring-2 focus:ring-blue-300",
        disabled || readOnly ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "",
        className
      )}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      readOnly={readOnly}
      disabled={disabled}
      {...props}
    />
  );
}

export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("text-sm font-semibold text-gray-900", className)} {...props}>{children}</label>;
}

export function Switch({ checked, onCheckedChange }: { checked: boolean; onCheckedChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-2 select-none">
      <span className="sr-only">toggle</span>
      <input
        type="checkbox"
        className="peer hidden"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
      />
      <span className="relative h-6 w-11 rounded-full bg-gray-300 transition peer-checked:bg-blue-600">
        <span className="absolute left-0 top-0 h-6 w-6 rounded-full bg-white shadow translate-x-0 transition peer-checked:translate-x-5" />
      </span>
    </label>
  );
}

export function Slider({ value, min = 0, max = 100, step = 1, onValueChange, className }: any) {
  const v = Array.isArray(value) ? value[0] : Number(value ?? 0);
  return (
    <input
      type="range"
      className={cn("w-full h-3 rounded-lg appearance-none bg-gray-200 border border-gray-300", className)}
      min={min}
      max={max}
      step={step}
      value={v}
      onChange={(e) => onValueChange?.([Number(e.target.value)])}
    />
  );
}