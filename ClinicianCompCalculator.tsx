import React, { useMemo, useState, useEffect, useRef } from "react";
import { cn, clamp, fmtUSD, fmtUSD2, fmtPct, toNum } from "./utils";
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Switch,
  Slider,
  CopyIcon,
  InfoIcon,
  Tooltip
} from "./components/ui";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/Tabs";

// --- Helper components ---

function Field({ label, hint, tooltip, children }: { label?: string; hint?: string; tooltip?: string; children?: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center">
        {label && <Label>{label}</Label>}
        {tooltip && (
          <Tooltip content={tooltip}>
            <InfoIcon />
          </Tooltip>
        )}
      </div>
      {children}
      {hint && <div className="text-xs text-gray-600">{hint}</div>}
    </div>
  );
}

function NumberInput({ value, onChange, min, max, step = 1 }: any) {
  return (
    <Input
      type="number"
      value={String(value)}
      onChange={(e: any) => onChange(toNum(e.target.value))}
      min={min}
      max={max}
      step={step}
    />
  );
}

function CurrencyInput({ value, onChange }: any) {
  return (
    <Input
      inputMode="decimal"
      value={String(value)}
      onChange={(e: any) => onChange(toNum(e.target.value))}
      placeholder="$0.00"
    />
  );
}

function PercentInput({ value, onChange }: any) {
  return (
    <Input
      inputMode="decimal"
      value={String(value)}
      onChange={(e: any) => onChange(toNum(e.target.value))}
      placeholder="0%"
    />
  );
}

function PercentSlider({ value, onChange, min = -20, max = 20 }: any) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={1}
          onValueChange={(v: number[]) => onChange(v[0])}
        />
      </div>
      <div className="w-14 text-right text-sm font-semibold">{value}%</div>
    </div>
  );
}

function BadgeStat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm w-full">
      <div className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 truncate">{label}</div>
      <div className="text-sm font-bold text-gray-900 truncate">{value}</div>
    </div>
  );
}

function LegendSwatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn("inline-block h-3 w-3 rounded-sm", color)} />
      <span>{label}</span>
    </div>
  );
}

function RowSwitch({ label, checked, onChange, tooltip }: { label: string; checked: boolean; onChange: (v: boolean) => void; tooltip?: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center">
        <Label className="mr-2">{label}</Label>
        {tooltip && (
          <Tooltip content={tooltip}>
            <InfoIcon />
          </Tooltip>
        )}
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function AccordionLike({ title, children }: { title: string; children?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <button
        className="w-full text-left px-4 py-3 flex items-center justify-between"
        onClick={() => setOpen((o) => !o)}
      >
        <span className="font-semibold text-gray-900">{title}</span>
        <span className="text-gray-600">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="px-4 pb-4 border-t border-gray-100 pt-4">{children}</div>}
    </div>
  );
}

function MetricBox({ label, value, sub, copyable }: { label: string; value: React.ReactNode; sub?: string; copyable?: string }) {
  const doCopy = () => {
    if (!copyable) return;
    navigator.clipboard?.writeText(String(copyable));
  };
  return (
    <div className="rounded-lg border border-gray-200 p-3 bg-white shadow-sm">
      <div className="text-[11px] font-bold text-gray-500 uppercase flex items-center justify-between mb-1">
        <span>{label}</span>
        {copyable && (
          <button
            onClick={doCopy}
            className="text-gray-400 hover:text-gray-700"
            title="Copy"
          >
            <CopyIcon />
          </button>
        )}
      </div>
      <div className="text-lg font-bold text-gray-900">{value}</div>
      {sub && <div className="text-[11px] text-gray-500 mt-1">{sub}</div>}
    </div>
  );
}

function DistributionBar({ segments, total, height = "h-4" }: { segments: { label: string; value: number; color: string }[]; total: number; height?: string }) {
  return (
    <div className="w-full space-y-2">
      <div className={cn("w-full rounded-full overflow-hidden flex", height)}>
        {segments.map((s, i) => {
           const pct = total > 0 ? (s.value / total) * 100 : 0;
           if (pct < 0.1) return null;
           return (
             <div key={i} style={{ width: `${pct}%` }} className={s.color} title={`${s.label}: ${fmtUSD(s.value)} (${pct.toFixed(1)}%)`} />
           );
        })}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-gray-600">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center gap-1.5">
             <div className={cn("w-2.5 h-2.5 rounded-sm", s.color)} />
             <span>{s.label} ({Math.round(total > 0 ? (s.value/total)*100 : 0)}%)</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Onboarding Components ---

function WelcomeModal({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 pointer-events-auto">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-300">
        <div className="flex justify-between items-start">
           <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
              Start
           </span>
           <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <span className="sr-only">Close</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
           </button>
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to the Calculator</h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            This tool helps practice owners model transparent, sustainable compensation plans for clinicians. Let's get you oriented in 3 quick steps.
          </p>
        </div>
        <Button onClick={onStart} className="w-full shadow-lg shadow-blue-200">
          Start Walkthrough
        </Button>
      </div>
    </div>
  );
}

function OnboardingTour({ 
  step, 
  onNext, 
  onBack, 
  onClose,
  isLast 
}: { 
  step: number; 
  onNext: () => void; 
  onBack: () => void; 
  onClose: () => void; 
  isLast?: boolean;
}) {
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Fade out/reset before moving to next step
    setVisible(false);

    const timer = setTimeout(() => {
      let targetId = "";
      if (step === 1) targetId = "tab-trigger-inputs";
      if (step === 2) targetId = "target-slider-container";
      if (step === 3) targetId = "tab-trigger-summary";

      const el = document.getElementById(targetId);
      if (!el) return;

      // Scroll logic
      const elRect = el.getBoundingClientRect();
      const absoluteTop = elRect.top + window.scrollY;
      
      let targetScrollY = 0;
      // If step 2 (slider), try to center it so there's room above and below
      if (step === 2) {
        targetScrollY = Math.max(0, absoluteTop - (window.innerHeight / 2));
      } else {
        // For header tabs, scroll to top
        targetScrollY = 0;
      }
      
      window.scrollTo({ top: targetScrollY, behavior: 'smooth' });

      // Wait for smooth scroll to finish mostly
      setTimeout(() => {
        const newRect = el.getBoundingClientRect();
        setRect(newRect);
        setVisible(true); // Trigger fade in
      }, 500);

    }, 300); // Wait for initial fade out

    return () => clearTimeout(timer);
  }, [step]);

  const contentMap: Record<number, { title: string; text: string }> = {
    1: { 
      title: "Enter Clinician Data", 
      text: "Start in the **Inputs** tab. Enter the clinician's session rates, weekly caseload, and time off. This establishes the revenue baseline for the clinician." 
    },
    2: { 
      title: "Set the Target Ratio", 
      text: "The **Target Slider** is your main lever. It sets the percentage of revenue allocated to the clinician's total cost of employment (Salary + Taxes + Benefits)." 
    },
    3: { 
      title: "Compare W-2 vs 1099", 
      text: "Go to the **Summary** tab to see a side-by-side comparison of take-home pay, estimated taxes, and practice margins for W-2 vs 1099 employment." 
    }
  };
  
  const content = contentMap[step];
  
  if (!rect || !content) return null;

  // Highlight Box Style (Fixed)
  const highlightStyle: React.CSSProperties = {
    top: rect.top - 4,
    left: rect.left - 4,
    width: rect.width + 8,
    height: rect.height + 8,
  };

  // Card Style (Fixed)
  const cardStyle: React.CSSProperties = {
    width: 320,
    maxWidth: '90vw',
    left: Math.max(16, Math.min(window.innerWidth - 336, rect.left)), // Keep card horizontally on screen
  };

  // Logic for Above vs Below
  if (step === 2) {
    // Place ABOVE the element
    // bottom = viewport height - rect top + margin
    cardStyle.bottom = (window.innerHeight - rect.top) + 16;
  } else {
    // Place BELOW the element
    cardStyle.top = rect.bottom + 16;
  }

  const parseText = (text: string) => text.split("**").map((part, i) => 
     i % 2 === 1 ? <strong key={i} className="text-blue-800 font-semibold">{part}</strong> : part
  );

  return (
    <div className="fixed inset-0 z-[100] pointer-events-none">
       {/* Spotlight Ring using Box Shadow for 'hole punch' effect */}
       <div 
          className={cn(
             "absolute rounded-lg border-2 border-blue-500 shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] transition-all duration-300 ease-out",
             visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={highlightStyle}
       />

       {/* Instruction Card */}
       <div 
          className={cn(
             "absolute bg-white rounded-xl shadow-2xl p-5 border border-gray-100 pointer-events-auto transition-all duration-300 ease-out",
             visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
          style={cardStyle}
       >
          <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
               Step {step} of 3
             </span>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          <h3 className="text-base font-bold text-gray-900 mb-2">{content.title}</h3>
          <p className="text-sm text-gray-600 mb-5 leading-relaxed">
             {parseText(content.text)}
          </p>
          <div className="flex gap-3 justify-end">
             {step > 1 && (
               <Button variant="secondary" onClick={onBack} className="h-8 text-xs">Back</Button>
             )}
             <Button onClick={onNext} className="h-8 text-xs px-5 shadow-blue-200 shadow-md">
               {isLast ? "Finish" : "Next"}
             </Button>
          </div>
       </div>
    </div>
  );
}

// --- Business logic ---

function effectiveWorkingWeeks(ptoDays: number, holidayDays: number, sickDays: number) {
  const offDays = toNum(ptoDays, 0) + toNum(holidayDays, 0) + toNum(sickDays, 0);
  const weeks = 52 - offDays / 5;
  return clamp(weeks, 0, 52);
}

function solveAnnualW2Base({ allowTotalCost, annualHealth, loadRate }: { allowTotalCost: number; annualHealth: number; loadRate: number }) {
  const denom = 1 + loadRate;
  const nom = allowTotalCost - annualHealth;
  if (denom <= 0 || nom <= 0) return 0;
  return nom / denom;
}

// --- Main Component ---

export default function ClinicianCompCalculator() {
  // Inputs
  const [grossRate, setGrossRate] = useState(150);
  const [procFeePct, setProcFeePct] = useState(2);
  const [useNetDirect, setUseNetDirect] = useState(true);
  const [netRate, setNetRate] = useState(135.8);

  const [sessionsPerWeek, setSessionsPerWeek] = useState(22);
  const [ptoDays, setPtoDays] = useState(10);
  const [holidayDays, setHolidayDays] = useState(8);
  const [sickDays, setSickDays] = useState(0);

  const [rolePreset, setRolePreset] = useState<"pre" | "licensed">("licensed");
  const [targetRatioPctRaw, setTargetRatioPctRaw] = useState(55);
  const [sliderTouched, setSliderTouched] = useState(false);

  const [payrollLoadPct, setPayrollLoadPct] = useState(10);
  const [annualHealth, setAnnualHealth] = useState(6000);
  const [matchPct, setMatchPct] = useState(0);

  const [lockPay, setLockPay] = useState(false);
  const [payLockMode, setPayLockMode] = useState<"hourly" | "salary">("hourly");
  const [lockedHourly, setLockedHourly] = useState(50);
  const [lockedSalary, setLockedSalary] = useState(80000);

  const [rateShockPct, setRateShockPct] = useState(0);
  const [volumeShockPct, setVolumeShockPct] = useState(0);

  // Estimator State
  const [showEstimator, setShowEstimator] = useState(false);
  const [incomeTaxRate, setIncomeTaxRate] = useState(22);

  const [baseWeeks] = useState(52);
  
  // Tour State
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0); // 0 = Welcome, 1..3 = Steps
  
  // Tab State
  const [activeTab, setActiveTab] = useState("inputs");

  useEffect(() => {
    try {
      const seen = localStorage.getItem("mtcs_comp_calc_tour_seen_v3");
      if (!seen) {
        setShowTour(true);
      }
    } catch (e) {
      // ignore storage errors
    }
  }, []);

  const handleStartTour = () => {
    setTourStep(1);
    setActiveTab("inputs");
  };

  const handleNextStep = () => {
    if (tourStep >= 3) {
        handleTourComplete();
        return;
    }
    if (tourStep === 2) {
      setActiveTab("summary");
    }
    setTourStep(s => s + 1);
  };

  const handlePrevStep = () => {
    if (tourStep === 3) {
      setActiveTab("inputs");
    }
    setTourStep(s => s - 1);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    setTourStep(0);
    setActiveTab("inputs");
    try {
      localStorage.setItem("mtcs_comp_calc_tour_seen_v3", "1");
    } catch (e) {
      // ignore
    }
  };

  const handleCloseTour = () => {
    setShowTour(false);
    setTourStep(0);
  };

  const hardCeilPct = rolePreset === "pre" ? 50 : 60;
  const setTargetRatioPct = (v: number) => setTargetRatioPctRaw(clamp(v, 0, hardCeilPct));

  // Derived: rates & volume
  const netPerSessionBase = useMemo(() => {
    if (useNetDirect) return toNum(netRate, 0);
    const g = toNum(grossRate, 0);
    const f = clamp(toNum(procFeePct, 0) / 100, 0, 1);
    return g * (1 - f);
  }, [useNetDirect, netRate, grossRate, procFeePct]);

  const netPerSession = useMemo(
    () => netPerSessionBase * (1 + toNum(rateShockPct, 0) / 100),
    [netPerSessionBase, rateShockPct]
  );
  const spw = useMemo(
    () => toNum(sessionsPerWeek, 0) * (1 + toNum(volumeShockPct, 0) / 100),
    [sessionsPerWeek, volumeShockPct]
  );

  const workingWeeks = useMemo(
    () => effectiveWorkingWeeks(ptoDays, holidayDays, sickDays),
    [ptoDays, holidayDays, sickDays]
  );
  const annualSessions = useMemo(() => spw * workingWeeks, [spw, workingWeeks]);
  const annualCollections = useMemo(
    () => netPerSession * annualSessions,
    [netPerSession, annualSessions]
  );
  const billableHours = useMemo(() => annualSessions, [annualSessions]);

  const presetGuide = useMemo(
    () =>
      rolePreset === "pre"
        ? { band: [0.4, 0.5], label: "Pre-licensed: aim 40–50%" }
        : { band: [0.5, 0.55], label: "Licensed: aim 50–55%" },
    [rolePreset]
  );

  const targetRatioPct = clamp(toNum(targetRatioPctRaw, 55), 0, hardCeilPct);
  const targetRatio = clamp(targetRatioPct / 100, 0.2, 0.8);
  const hardCeil = clamp(hardCeilPct / 100, 0.2, 0.9);

  const payrollLoadRate = clamp(toNum(payrollLoadPct, 10) / 100, 0, 0.5);
  const matchRate = clamp(toNum(matchPct, 0) / 100, 0, 0.2);
  const loadRate = clamp(payrollLoadRate + matchRate, 0, 0.5);

  const allowTotalCost = annualCollections * targetRatio;

  // W-2 solver + lock-pay
  const annualW2BaseSolved = solveAnnualW2Base({
    allowTotalCost,
    annualHealth: toNum(annualHealth, 0),
    loadRate,
  });
  const baseW2 = lockPay
    ? payLockMode === "hourly"
      ? billableHours > 0
        ? toNum(lockedHourly, 0) * billableHours
        : 0
      : toNum(lockedSalary, 0)
    : annualW2BaseSolved;

  const hourlyW2 = billableHours > 0 ? baseW2 / billableHours : 0;
  const salaryW2 = baseW2;

  const payrollTaxAmt = baseW2 * payrollLoadRate;
  const matchAmt = baseW2 * matchRate;
  const totalCostW2 = baseW2 + payrollTaxAmt + matchAmt + toNum(annualHealth, 0);
  const realizedW2Ratio = annualCollections > 0 ? totalCostW2 / annualCollections : 0;

  // 1099
  const icSplit = clamp(targetRatio, 0, hardCeil);
  const icPayoutPerSession = netPerSession * icSplit;
  const icTotalComp = icPayoutPerSession * annualSessions;

  const exceedsCeil = realizedW2Ratio > hardCeil + 1e-6 || icSplit > hardCeil + 1e-6;
  const benefitTooRich = !lockPay
    ? allowTotalCost - toNum(annualHealth, 0) <= 0
    : totalCostW2 > allowTotalCost + 1e-6;

  // Target color helper
  if (!sliderTouched) {
    const auto = rolePreset === "pre" ? 45 : 55;
    if (targetRatioPctRaw !== auto) setTargetRatioPct(auto);
  }
  const recUpper = rolePreset === "pre" ? 47 : 57;
  const targetColor = targetRatioPct <= recUpper ? "bg-blue-600 text-white" : "bg-amber-500 text-white";

  // --- Net Pay Estimation Logic ---
  const taxRate = clamp(incomeTaxRate, 0, 60) / 100;
  
  // W-2 Net
  // Deduct employee share of FICA (7.65%) + Income Tax
  const w2EmpFica = 0.0765; 
  const w2GrossEst = baseW2;
  const w2TaxesEst = w2GrossEst * (w2EmpFica + taxRate);
  const w2NetEst = Math.max(0, w2GrossEst - w2TaxesEst);

  // 1099 Net
  // Deduct SE Tax (15.3% on ~92.35% of income) + Income Tax
  // Deduct Private Health (Assuming user pays 'annualHealth' out of pocket)
  const seTaxRate = 0.153 * 0.9235; 
  const icGrossEst = icTotalComp;
  const icTaxesEst = icGrossEst * (seTaxRate + taxRate);
  const icHealthCost = showEstimator ? toNum(annualHealth, 0) : 0;
  const icNetEst = Math.max(0, icGrossEst - icTaxesEst - icHealthCost);

  // Margins
  const marginW2 = annualCollections - totalCostW2;
  const marginIC = annualCollections - icTotalComp;

  return (
    <div className="w-full font-sans bg-gray-50 min-h-screen">
      <style>{`
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; height:18px; width:18px; border-radius:9999px; background:#2563eb; border:2px solid #fff; box-shadow:0 1px 2px rgba(0,0,0,.15); cursor: pointer; }
        input[type="range"]::-moz-range-thumb { height:18px; width:18px; border-radius:9999px; background:#2563eb; border:2px solid #fff; box-shadow:0 1px 2px rgba(0,0,0,.15); cursor: pointer; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
      
      {/* Step 0: Welcome Modal */}
      {showTour && tourStep === 0 && (
        <WelcomeModal onStart={handleStartTour} onClose={handleCloseTour} />
      )}
      
      {/* Onboarding Overlay Tour */}
      {showTour && tourStep > 0 && (
        <OnboardingTour 
          step={tourStep}
          onNext={handleNextStep}
          onBack={handlePrevStep}
          onClose={handleCloseTour}
          isLast={tourStep === 3}
        />
      )}

      <Tabs 
        value={activeTab} 
        onValueChange={setActiveTab} 
        defaultValue="inputs" 
        className="w-full max-w-6xl mx-auto"
      >
        {/* Sticky Header Wrapper */}
        <div className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-md shadow-sm border-b border-gray-200 transition-all">
          <div className="px-4 py-3 sm:px-6 sm:py-4 max-w-6xl mx-auto space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
               <div className="flex items-center justify-between sm:justify-start gap-3">
                 <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-none">Comp Calculator</h1>
                 <button 
                   onClick={() => {
                     setShowTour(true);
                     setTourStep(0);
                   }}
                   className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                   title="Restart Tour"
                 >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"></circle>
                      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                      <line x1="12" y1="17" x2="12.01" y2="17"></line>
                    </svg>
                 </button>
               </div>
               {/* Stats Grid moved inside sticky header */}
               <div className="flex overflow-x-auto pb-2 sm:pb-0 gap-2 w-full sm:w-auto sm:grid sm:grid-cols-4 snap-x no-scrollbar">
                 <div className="min-w-[140px] sm:min-w-0 snap-center"><BadgeStat label="Net / Session" value={fmtUSD(netPerSession)} /></div>
                 <div className="min-w-[140px] sm:min-w-0 snap-center"><BadgeStat label="Target" value={`${(targetRatio * 100).toFixed(1)}%`} /></div>
                 <div className="min-w-[140px] sm:min-w-0 snap-center"><BadgeStat label="Revenue" value={fmtUSD(annualCollections)} /></div>
                 <div className="min-w-[140px] sm:min-w-0 snap-center"><BadgeStat label="Margin (W2)" value={fmtUSD(marginW2)} /></div>
               </div>
            </div>
            
            <TabsList className="grid grid-cols-4 w-full">
              <TabsTrigger id="tab-trigger-inputs" value="inputs">Inputs</TabsTrigger>
              <TabsTrigger id="tab-trigger-summary" value="summary">Summary</TabsTrigger>
              <TabsTrigger value="w2">W‑2</TabsTrigger>
              <TabsTrigger value="ic">1099</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Inputs */}
          <TabsContent value="inputs" className="space-y-6">
            
            <Card>
              <CardContent className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div className="space-y-4">
                     <RowSwitch
                      label="Use net session rate directly"
                      checked={useNetDirect}
                      onChange={setUseNetDirect}
                      tooltip="Toggle on if you know your average collected amount per session. Toggle off to calculate it from a gross rate minus fee percentages."
                    />
                    <p className="text-xs text-gray-600">Toggle on to input your net collections per session directly. Toggle off to calculate from gross payout and fees.</p>
                  </div>

                  {useNetDirect ? (
                    <Field
                      label="Net collections per session"
                      hint="Exclude write‑offs and processing/clearinghouse fees."
                      tooltip="The average amount collected per session after all adjustments."
                    >
                      <CurrencyInput value={netRate} onChange={setNetRate} />
                    </Field>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <Field label="Gross payout" tooltip="The full billed amount or contract rate before any fees.">
                        <CurrencyInput value={grossRate} onChange={setGrossRate} />
                      </Field>
                      <Field label="Proc. fees" tooltip="Percentage taken by credit card processors or billing services.">
                        <PercentInput value={procFeePct} onChange={setProcFeePct} />
                      </Field>
                      <div className="col-span-2 text-xs text-gray-700">
                        Net per session = gross × (1 − fees%).
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Sessions/wk" tooltip="Average number of billable client sessions held per week.">
                      <NumberInput value={sessionsPerWeek} onChange={setSessionsPerWeek} />
                    </Field>
                    <Field label="Weeks/yr" tooltip="Total weeks in a year.">
                      <Input value={String(baseWeeks)} readOnly disabled aria-disabled="true" />
                    </Field>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <Field label="PTO" tooltip="Number of paid vacation days per year.">
                      <NumberInput value={ptoDays} onChange={setPtoDays} />
                    </Field>
                    <Field label="Holidays" tooltip="Number of paid holidays observed per year.">
                      <NumberInput value={holidayDays} onChange={setHolidayDays} />
                    </Field>
                    <Field label="Sick" tooltip="Number of paid sick days allocated per year.">
                      <NumberInput value={sickDays} onChange={setSickDays} />
                    </Field>
                  </div>

                  <Field label="Role preset" tooltip="Sets recommended compensation targets based on licensure status.">
                    <select
                      className="w-full h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
                      value={rolePreset}
                      onChange={(e) => setRolePreset(e.target.value as any)}
                    >
                      <option value="pre">Pre‑licensed</option>
                      <option value="licensed">Licensed</option>
                    </select>
                  </Field>
                </div>

                <div className="space-y-6">
                  
                  {/* Slider Section Container ID for Tour Targeting */}
                  <div id="target-slider-container" className="p-2 -m-2 rounded-xl">
                    <div className="flex items-center mb-2">
                      <Label>Total clinician cost target (% of collections)</Label>
                      <Tooltip content="The percentage of revenue allocated to the clinician's total compensation package (salary + benefits + taxes).">
                        <InfoIcon className="ml-2" />
                      </Tooltip>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-full">
                        <Slider
                          value={[targetRatioPct]}
                          min={30}
                          max={hardCeilPct}
                          step={1}
                          onValueChange={(v: number[]) => {
                            setTargetRatioPct(v[0]);
                            setSliderTouched(true);
                          }}
                        />
                      </div>
                      <div className={cn("w-24 text-center font-semibold rounded-lg px-2 py-1", targetColor)}>
                        {targetRatioPct}%
                      </div>
                    </div>
                    <p className="text-xs text-gray-700 mt-1">
                      {presetGuide.label}. Blue = within recommended band; Yellow = approaching ceiling ({hardCeilPct}%).
                    </p>
                  </div>

                  <AccordionLike title="Taxes & Benefits">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <Field label="Employer payroll tax" tooltip="Estimated employer-side payroll taxes (e.g., FICA, FUTA, SUTA).">
                        <PercentInput value={payrollLoadPct} onChange={setPayrollLoadPct} />
                      </Field>
                      <Field label="401(k) match" tooltip="Percentage of salary the employer matches for retirement.">
                        <PercentInput value={matchPct} onChange={setMatchPct} />
                      </Field>
                      <Field label="Health (annual)" tooltip="Annual employer contribution towards health insurance premiums. Also used as the estimated cost for private insurance in the 1099 model.">
                        <CurrencyInput value={annualHealth} onChange={setAnnualHealth} />
                      </Field>
                    </div>
                  </AccordionLike>

                  <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                         <Label className="mr-2">Lock pay (W‑2)</Label>
                         <Tooltip content="Fix the salary or hourly rate to see how changing benefits affects the realized margin.">
                            <InfoIcon />
                         </Tooltip>
                      </div>
                      <Switch checked={lockPay} onCheckedChange={setLockPay} />
                    </div>
                    {lockPay && (
                      <div className="space-y-3">
                        <div className="flex gap-2">
                          <Button
                            className="flex-1"
                            variant={payLockMode === "hourly" ? "primary" : "secondary"}
                            onClick={() => setPayLockMode("hourly")}
                          >
                            Hourly
                          </Button>
                          <Button
                            className="flex-1"
                            variant={payLockMode === "salary" ? "primary" : "secondary"}
                            onClick={() => setPayLockMode("salary")}
                          >
                            Annual
                          </Button>
                        </div>
                        {payLockMode === "hourly" ? (
                          <Field label="Locked hourly wage" tooltip="Fixed hourly rate.">
                            <CurrencyInput value={lockedHourly} onChange={setLockedHourly} />
                          </Field>
                        ) : (
                          <Field label="Locked annual salary" tooltip="Fixed annual base salary.">
                            <CurrencyInput value={lockedSalary} onChange={setLockedSalary} />
                          </Field>
                        )}
                        <p className="text-xs text-gray-700">
                          When locked, wages are fixed. Adding benefits will change the realized % and may exceed the target.
                        </p>
                      </div>
                    )}
                  </div>

                  <AccordionLike title="Advanced (derived values & what‑ifs)">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <BadgeStat label="Net / session" value={fmtUSD(netPerSession)} />
                        <BadgeStat label="Annual sessions" value={annualSessions.toLocaleString()} />
                        <BadgeStat
                          label="Annual collections"
                          value={<span className="break-words">{fmtUSD(annualCollections)}</span>}
                        />
                        <BadgeStat label="Effective working weeks" value={workingWeeks.toFixed(2)} />
                      </div>
                      <div className="space-y-4">
                        <Field label="What‑if: rate shock" tooltip="Simulate a percentage increase or decrease in reimbursement rates.">
                          <PercentSlider value={rateShockPct} onChange={setRateShockPct} min={-20} max={20} />
                        </Field>
                        <Field label="What‑if: volume shock" tooltip="Simulate a percentage increase or decrease in patient volume.">
                          <PercentSlider value={volumeShockPct} onChange={setVolumeShockPct} min={-30} max={30} />
                        </Field>
                      </div>
                    </div>
                  </AccordionLike>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary / Comparison */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardContent className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <h2 className="text-lg font-bold text-gray-900">Side-by-Side Comparison</h2>
                    <div className="flex flex-col sm:flex-row gap-4 bg-gray-50 p-2 rounded-lg">
                      <RowSwitch 
                        label="Estimate Net Take-Home Pay" 
                        checked={showEstimator} 
                        onChange={setShowEstimator}
                        tooltip="Deduct estimated taxes and private health insurance to approximate actual cash in pocket."
                      />
                      {showEstimator && (
                        <div className="w-full sm:w-32">
                           <Field label="Est. Tax Rate" tooltip="Combined Federal + State income tax estimate (excluding FICA/SE tax).">
                             <PercentInput value={incomeTaxRate} onChange={setIncomeTaxRate} />
                           </Field>
                        </div>
                      )}
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-2 text-sm font-bold text-gray-500 uppercase tracking-wide">
                    <div>Metric</div>
                    <div className="text-right text-blue-700">W-2 Model</div>
                    <div className="text-right text-purple-700">1099 Model</div>
                 </div>

                 <div className="space-y-4 text-sm">
                    {/* Gross Pay */}
                    <div className="grid grid-cols-3 gap-4 items-center">
                       <div className="font-medium text-gray-900">Gross Clinician Income</div>
                       <div className="text-right font-semibold">{fmtUSD(w2GrossEst)}</div>
                       <div className="text-right font-semibold">{fmtUSD(icGrossEst)}</div>
                    </div>

                    {/* Estimator Rows */}
                    {showEstimator && (
                      <>
                        <div className="grid grid-cols-3 gap-4 items-center text-red-600">
                          <div>
                            <div className="font-medium">− Est. Taxes</div>
                            <div className="text-[10px] text-gray-500">
                               W2: FICA + Inc Tax<br/>
                               1099: SE Tax + Inc Tax
                            </div>
                          </div>
                          <div className="text-right">− {fmtUSD(w2TaxesEst)}</div>
                          <div className="text-right">− {fmtUSD(icTaxesEst)}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center text-red-600">
                          <div>
                            <div className="font-medium">− Private Health Cost</div>
                            <div className="text-[10px] text-gray-500">
                               W2: Employer pays<br/>
                               1099: You pay
                            </div>
                          </div>
                          <div className="text-right text-gray-400">Included</div>
                          <div className="text-right">− {fmtUSD(icHealthCost)}</div>
                        </div>
                        <div className="grid grid-cols-3 gap-4 items-center pt-2 border-t border-gray-100">
                           <div className="font-bold text-gray-900">Est. Net Take-Home</div>
                           <div className="text-right font-bold text-green-700 text-base">{fmtUSD(w2NetEst)}</div>
                           <div className="text-right font-bold text-green-700 text-base">{fmtUSD(icNetEst)}</div>
                        </div>
                      </>
                    )}

                    {/* Benefits Value (if not estimator) */}
                    {!showEstimator && (
                       <div className="grid grid-cols-3 gap-4 items-center text-green-600">
                          <div>
                             <div className="font-medium">+ Benefits Value</div>
                             <div className="text-[10px] text-gray-500">Health + 401k Match</div>
                          </div>
                          <div className="text-right font-semibold">+ {fmtUSD(toNum(annualHealth,0) + matchAmt)}</div>
                          <div className="text-right text-gray-400">0</div>
                       </div>
                    )}

                    <div className="grid grid-cols-3 gap-4 items-center border-t border-gray-100 pt-3">
                       <div className="font-medium text-gray-900">Practice Margin</div>
                       <div className="text-right font-medium text-gray-600">{fmtUSD(marginW2)}</div>
                       <div className="text-right font-medium text-gray-600">{fmtUSD(marginIC)}</div>
                    </div>
                 </div>
              </CardContent>
            </Card>
            
            {/* Visualizations */}
            <div className="grid md:grid-cols-2 gap-6">
               <Card>
                 <CardContent className="space-y-4">
                    <h3 className="font-bold text-gray-900">W-2: Where the dollar goes</h3>
                    <div className="pt-2">
                       <DistributionBar 
                         total={annualCollections}
                         segments={[
                           { label: "Wages", value: baseW2, color: "bg-blue-600" },
                           { label: "Benefits/Tax", value: totalCostW2 - baseW2, color: "bg-blue-300" },
                           { label: "Practice Margin", value: marginW2, color: "bg-gray-300" },
                         ]} 
                       />
                    </div>
                    <p className="text-xs text-gray-500">
                      Even with lower gross wages, the practice covers significant tax & benefit costs.
                    </p>
                 </CardContent>
               </Card>

               <Card>
                 <CardContent className="space-y-4">
                    <h3 className="font-bold text-gray-900">1099: Where the dollar goes</h3>
                    <div className="pt-2">
                       <DistributionBar 
                         total={annualCollections}
                         segments={[
                           { label: "Clinician Pay", value: icTotalComp, color: "bg-purple-600" },
                           { label: "Practice Margin", value: marginIC, color: "bg-gray-300" },
                         ]} 
                       />
                    </div>
                    <p className="text-xs text-gray-500">
                      Clinician gets a larger check but pays all taxes and benefits out of pocket.
                    </p>
                 </CardContent>
               </Card>
            </div>
          </TabsContent>

          {/* W-2 */}
          <TabsContent value="w2">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardContent className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900">W‑2 Compensation</h2>
                  {benefitTooRich && (
                    <div className="rounded-md border border-amber-300 bg-amber-50 text-amber-900 text-sm p-3">
                      {lockPay
                        ? "With locked pay, current wages + benefits exceed the selected target %. Adjust target or reduce benefits."
                        : "Benefits exceed the available cost pool at the selected target. Reduce benefits, raise the target %, or increase session economics."}
                    </div>
                  )}
                  {exceedsCeil && (
                    <div className="rounded-md border border-red-300 bg-red-50 text-red-900 text-sm p-3">
                      Resulting cost exceeds the hard ceiling. Adjust inputs to keep ≤ {fmtPct(hardCeil)}.
                    </div>
                  )}

                  <div className="grid sm:grid-cols-3 gap-4">
                    <MetricBox
                      label="Hourly wage"
                      value={fmtUSD(hourlyW2)}
                      sub={`at ${billableHours.toLocaleString()} billable hours/yr`}
                      copyable={`${hourlyW2.toFixed(2)}`}
                    />
                    <MetricBox
                      label="Annual salary"
                      value={fmtUSD(salaryW2)}
                      sub="base wages (excludes tax & benefits)"
                      copyable={`${salaryW2.toFixed(0)}`}
                    />
                    <MetricBox label="Total employer cost" value={fmtUSD(totalCostW2)} sub="wages + tax + benefits" />
                  </div>

                  <div className="grid sm:grid-cols-3 gap-4">
                    <MetricBox label="Target ratio" value={fmtPct(targetRatio)} sub="desired total cost / collections" />
                    <MetricBox label="Realized ratio" value={fmtPct(realizedW2Ratio)} sub="actual with tax & benefits" />
                    <MetricBox
                      label="Ceiling"
                      value={fmtPct(hardCeil)}
                      sub={rolePreset === "pre" ? "pre‑licensed max" : "licensed max"}
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-semibold text-gray-900">Composition of total employer cost</div>
                    <div className="w-full h-4 rounded-full bg-gray-200 overflow-hidden flex">
                      <div
                        title={`Wages ${fmtUSD2(baseW2)}`}
                        style={{ width: `${totalCostW2 > 0 ? (baseW2 / totalCostW2) * 100 : 0}%` }}
                        className="h-full bg-blue-700"
                      />
                      <div
                        title={`Payroll tax ${fmtUSD2(payrollTaxAmt)}`}
                        style={{ width: `${totalCostW2 > 0 ? (payrollTaxAmt / totalCostW2) * 100 : 0}%` }}
                        className="h-full bg-blue-400"
                      />
                      <div
                        title={`401(k) match ${fmtUSD2(matchAmt)}`}
                        style={{ width: `${totalCostW2 > 0 ? (matchAmt / totalCostW2) * 100 : 0}%` }}
                        className="h-full bg-blue-300"
                      />
                      <div
                        title={`Employer health ${fmtUSD2(annualHealth as any)}`}
                        style={{ width: `${totalCostW2 > 0 ? (toNum(annualHealth, 0) / totalCostW2) * 100 : 0}%` }}
                        className="h-full bg-blue-200"
                      />
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-xs text-gray-800">
                      <LegendSwatch color="bg-blue-700" label="Wages" />
                      <LegendSwatch color="bg-blue-400" label="Payroll tax" />
                      <LegendSwatch color="bg-blue-300" label="401(k) match" />
                      <LegendSwatch color="bg-blue-200" label="Employer health" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Notes</h3>
                  <ul className="text-sm list-disc pl-5 space-y-1 text-gray-800">
                    <li>Lock pay fixes hourly or salary and shows how benefits change the realized %.</li>
                    <li>Total employer cost = wages + payroll tax + 401(k) match + employer health.</li>
                    <li>Pre‑licensed ceiling 50%; Licensed ceiling 60%.</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 1099 */}
          <TabsContent value="ic">
            <div className="grid md:grid-cols-3 gap-6">
              <Card className="md:col-span-2">
                <CardContent className="space-y-4">
                  <h2 className="text-lg font-bold text-gray-900">1099 Compensation</h2>
                  {icSplit > hardCeil && (
                    <div className="rounded-md border border-red-300 bg-red-50 text-red-900 text-sm p-3">
                      Proposed split exceeds the hard ceiling of {fmtPct(hardCeil)}.
                    </div>
                  )}
                  <div className="grid sm:grid-cols-3 gap-4">
                    <MetricBox label="Split of net" value={fmtPct(icSplit)} sub="paid on net per session" />
                    <MetricBox
                      label="Payout per session"
                      value={fmtUSD(icPayoutPerSession)}
                      sub={`net ${fmtUSD(netPerSession)}`}
                    />
                    <MetricBox label="Target ratio" value={fmtPct(targetRatio)} sub="mirrors total cost target" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="space-y-3">
                  <h3 className="font-semibold text-gray-900">Notes</h3>
                  <p className="text-sm text-gray-700">
                    1099 model pays a share of net collections per session. Employer taxes, benefits, and health costs are not
                    borne by the practice in this model, so the clinician is responsible for their own tax and benefits
                    structure.
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}