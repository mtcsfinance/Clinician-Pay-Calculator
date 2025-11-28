import React, { createContext, useContext, useState } from "react";
import { cn } from "../utils";

const TabsCtx = createContext<{ active: string; setActive: (v: string) => void } | null>(null);

export function Tabs({ 
  value, 
  onValueChange, 
  defaultValue, 
  children, 
  className 
}: { 
  value?: string;
  onValueChange?: (v: string) => void;
  defaultValue?: string; 
  children?: React.ReactNode; 
  className?: string 
}) {
  const [internalActive, setInternalActive] = useState(defaultValue || "");
  
  const active = value !== undefined ? value : internalActive;
  const setActive = onValueChange || setInternalActive;

  return (
    <TabsCtx.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-gray-200 p-1 grid bg-white", className)}>{children}</div>;
}

export function TabsTrigger({ value, children, id }: { value: string; children?: React.ReactNode; id?: string }) {
  const ctx = useContext(TabsCtx);
  const isActive = ctx?.active === value;
  return (
    <button
      id={id}
      onClick={() => ctx?.setActive(value)}
      className={cn(
        "h-10 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-1.5",
        isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className }: { value: string; children?: React.ReactNode; className?: string }) {
  const ctx = useContext(TabsCtx);
  if (ctx?.active !== value) return null;
  return <div className={className}>{children}</div>;
}