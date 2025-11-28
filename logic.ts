import { clamp, toNum } from "./utils";

export function effectiveWorkingWeeks(totalOffDays: number) {
  // 5 days per week
  const weeks = 52 - toNum(totalOffDays, 0) / 5;
  return clamp(weeks, 0, 52);
}

export function solveAnnualW2Base({ allowTotalCost, annualHealth, loadRate }: { allowTotalCost: number; annualHealth: number; loadRate: number }) {
  const denom = 1 + loadRate;
  const nom = allowTotalCost - annualHealth;
  if (denom <= 0 || nom <= 0) return 0;
  return nom / denom;
}

export function getMarginStatus(pct: number, rolePreset: "pre" | "licensed") {
  // Licensed Logic: Target Cost 50-60% -> Target Margin 40-50%
  // Pre-Licensed Logic: Target Cost 40-50% -> Target Margin 50-60%
  
  let healthyThreshold = 0.40; // Default (Licensed)
  let tightThreshold = 0.30;   // Default (Licensed)

  if (rolePreset === "pre") {
    healthyThreshold = 0.50; 
    tightThreshold = 0.40;
  }

  // Returns styles for the Container (box) and the Badge (pill)
  // Fix: Using bg-white for badges provides better contrast against the colored container backgrounds
  if (pct >= healthyThreshold) {
    return {
      status: 'Healthy',
      color: 'text-green-800',
      valueColor: 'text-green-700',
      containerClass: 'bg-green-50 border-green-200 ring-1 ring-green-200',
      badgeClass: 'bg-white text-green-700 border border-green-200 shadow-sm'
    };
  } else if (pct >= tightThreshold) {
    return {
      status: 'Tight',
      color: 'text-yellow-800',
      valueColor: 'text-yellow-700',
      containerClass: 'bg-yellow-50 border-yellow-200 ring-1 ring-yellow-200',
      badgeClass: 'bg-white text-yellow-700 border border-yellow-200 shadow-sm'
    };
  } else {
    return {
      status: 'Low',
      color: 'text-red-900',
      valueColor: 'text-red-700',
      containerClass: 'bg-red-50 border-red-200 ring-1 ring-red-200',
      badgeClass: 'bg-white text-red-700 border border-red-200 shadow-sm'
    };
  }
}