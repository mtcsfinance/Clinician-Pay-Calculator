import React, { createContext, useContext, useState } from "react";
import { cn } from "../utils";

const TabsCtx = createContext<{ active: string; setActive: (v: string) => void } | null>(null);

// Fix: make children optional
export function Tabs({ defaultValue, children, className }: { defaultValue: string; children?: React.ReactNode; className?: string }) {
  const [active, setActive] = useState(defaultValue);
  return (
    <TabsCtx.Provider value={{ active, setActive }}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

// Fix: make children optional
export function TabsList({ className, children }: { className?: string; children?: React.ReactNode }) {
  return <div className={cn("rounded-xl border border-gray-200 p-1 grid bg-white", className)}>{children}</div>;
}

// Fix: make children optional
export function TabsTrigger({ value, children }: { value: string; children?: React.ReactNode }) {
  const ctx = useContext(TabsCtx);
  const isActive = ctx?.active === value;
  return (
    <button
      onClick={() => ctx?.setActive(value)}
      className={cn(
        "h-10 rounded-lg text-sm font-semibold transition",
        isActive ? "bg-blue-600 text-white" : "text-gray-700 hover:bg-gray-100"
      )}
    >
      {children}
    </button>
  );
}

// Fix: make children optional
export function TabsContent({ value, children, className }: { value: string; children?: React.ReactNode; className?: string }) {
  const ctx = useContext(TabsCtx);
  if (ctx?.active !== value) return null;
  return <div className={className}>{children}</div>;
}