import React, { useMemo, useState, useEffect } from "react";
import { cn, clamp, fmtUSD, fmtUSD2, fmtPct, toNum, decodeState } from "./utils";
import { effectiveWorkingWeeks, solveAnnualW2Base, getMarginStatus } from "./logic";
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Switch,
  Slider,
  Tooltip,
  InfoIcon
} from "./components/ui";
import { 
  Field, 
  RowSwitch, 
  AccordionLike, 
  DistributionBar, 
  MarginBadge 
} from "./components/ui-extended";
import { 
  ScenarioPresets, 
  ReportCaptureModal, 
  WelcomeModal, 
  OnboardingTour,
  AccessGateModal
} from "./components/CalculatorFeatures";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./components/Tabs";

// --- Custom Hook for Persistence ---
function useStickyState<T>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    try {
      const stickyValue = window.localStorage.getItem(key);
      return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
    } catch (err) {
      return defaultValue;
    }
  });

  useEffect(() => {
    window.localStorage.setItem(key, JSON.stringify(value));
  }, [key, value]);

  return [value, setValue];
}

// --- Helper Input Components ---

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

function CurrencyInput({ value, onChange, min }: any) {
  return (
    <Input
      inputMode="decimal"
      value={String(value)}
      onChange={(e: any) => onChange(toNum(e.target.value))}
      placeholder="$0.00"
      min={min}
    />
  );
}

function PercentInput({ value, onChange, className }: any) {
  return (
    <Input
      inputMode="decimal"
      value={String(value)}
      onChange={(e: any) => onChange(toNum(e.target.value))}
      placeholder="0%"
      className={className}
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

// --- Constants ---
const CTA_URL = "https://marketing.mtcsbusinessfinance.com/wa-schedule-your-call?utm_source=calculator&utm_medium=web_app&utm_campaign=header_cta";


// --- Main Component ---

export default function ClinicianCompCalculator() {
  // Inputs (Persisted)
  const [grossRate, setGrossRate] = useStickyState("mtcs_grossRate", 150);
  const [procFeePct, setProcFeePct] = useStickyState("mtcs_procFeePct", 2);
  const [useNetDirect, setUseNetDirect] = useStickyState("mtcs_useNetDirect", true);
  const [netRate, setNetRate] = useStickyState("mtcs_netRate", 110); 

  const [sessionsPerWeek, setSessionsPerWeek] = useStickyState("mtcs_sessionsPerWeek", 22);
  const [totalTimeOffDays, setTotalTimeOffDays] = useStickyState("mtcs_totalTimeOffDays", 20);

  const [rolePreset, setRolePreset] = useStickyState<"pre" | "licensed">("mtcs_rolePreset", "licensed");
  
  // Advanced Inputs
  const [isAdvancedMode, setIsAdvancedMode] = useStickyState("mtcs_isAdvancedMode", false);
  const [payrollLoadPct, setPayrollLoadPct] = useStickyState("mtcs_payrollLoadPct", 8.5); 
  const [annualHealth, setAnnualHealth] = useStickyState("mtcs_annualHealth", 0); 
  const [matchPct, setMatchPct] = useStickyState("mtcs_matchPct", 0);
  
  // Admin Time
  const [adminHours, setAdminHours] = useStickyState("mtcs_adminHours", 0);
  const [adminHourlyRate, setAdminHourlyRate] = useStickyState("mtcs_adminHourlyRate", 20);

  // Offer Builder State
  const [offerSalary, setOfferSalary] = useStickyState("mtcs_offerSalary", 0);
  const [offerHourly, setOfferHourly] = useStickyState("mtcs_offerHourly", 0);
  const [offer1099, setOffer1099] = useStickyState("mtcs_offer1099", 0);
  const [w2Mode, setW2Mode] = useStickyState<"salary" | "hourly">("mtcs_w2Mode", "salary");

  const [rateShockPct, setRateShockPct] = useState(0); // Don't stick scenarios
  const [volumeShockPct, setVolumeShockPct] = useState(0); // Don't stick scenarios

  // Estimator State
  const [showEstimator, setShowEstimator] = useStickyState("mtcs_showEstimator", false);
  const [incomeTaxRate, setIncomeTaxRate] = useStickyState("mtcs_incomeTaxRate", 22);

  // App State (Not Persisted)
  const [showTour, setShowTour] = useState(false);
  const [tourStep, setTourStep] = useState(0);
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [activeTab, setActiveTab] = useState("inputs");
  
  useEffect(() => {
    // Check for Tour
    try {
      const seen = localStorage.getItem("mtcs_comp_calc_tour_seen_v5");
      if (!seen) {
        setShowTour(true);
      }
    } catch (e) {}

    // Check for Share Link (Has priority over sticky state)
    if (window.location.hash.startsWith('#s=')) {
      try {
        const decoded = decodeState(window.location.hash.substring(3));
        if (decoded) {
            // Bulk update state from URL
            if(decoded.nr !== undefined) setNetRate(decoded.nr);
            if(decoded.spw !== undefined) setSessionsPerWeek(decoded.spw);
            if(decoded.off !== undefined) setTotalTimeOffDays(decoded.off);
            if(decoded.role) setRolePreset(decoded.role as any);
            if(decoded.ah !== undefined) setAdminHours(decoded.ah);
            if(decoded.ar !== undefined) setAdminHourlyRate(decoded.ar);
            if(decoded.os !== undefined) setOfferSalary(decoded.os);
            if(decoded.oh !== undefined) setOfferHourly(decoded.oh);
            if(decoded.ic !== undefined) setOffer1099(decoded.ic);
        }
      } catch(e) { console.error("Failed to decode state", e); }
    }
  }, []); // Only on mount

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleStartTour = () => {
    setTourStep(1);
    setActiveTab("inputs");
  };

  const handleNextStep = () => {
    if (tourStep >= 3) {
        handleTourComplete();
        return;
    }
    setTourStep(s => s + 1);
  };

  const handlePrevStep = () => {
    setTourStep(s => s - 1);
  };

  const handleTourComplete = () => {
    setShowTour(false);
    setTourStep(0);
    setActiveTab("inputs");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    try {
      localStorage.setItem("mtcs_comp_calc_tour_seen_v5", "1");
    } catch (e) {}
  };

  const handleCloseTour = () => {
    setShowTour(false);
    setTourStep(0);
  };

  const applyPreset = (p: any) => {
    setNetRate(p.netRate);
    setSessionsPerWeek(p.sessionsPerWeek);
    setRolePreset(p.rolePreset);
    setUseNetDirect(true);
    setAdminHours(0);
  };

  const handleLeadConvert = () => {
     // Now handled inside the modal success state (clicking the CTA)
  };
  
  const handleShare = () => {
    import('./utils').then(({ encodeState }) => {
        const state = {
            nr: netRate,
            spw: sessionsPerWeek,
            off: totalTimeOffDays,
            role: rolePreset,
            ah: adminHours,
            ar: adminHourlyRate,
            os: offerSalary,
            oh: offerHourly,
            ic: offer1099
        };
        const hash = encodeState(state);
        const url = `${window.location.origin}${window.location.pathname}#s=${hash}`;
        navigator.clipboard.writeText(url).then(() => {
            alert("Link copied to clipboard!");
        });
    });
  };

  // --- Logic ---
  
  // Band Logic (Industry Standard)
  const band = useMemo(() => {
     return rolePreset === "pre" 
       ? { min: 40, max: 50, avg: 45 } 
       : { min: 50, max: 60, avg: 55 };
  }, [rolePreset]);
  
  const targetRatioPct = band.avg;

  const hardCeilPct = band.max;
  const hardCeil = hardCeilPct / 100;

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
    () => effectiveWorkingWeeks(totalTimeOffDays),
    [totalTimeOffDays]
  );
  const estWorkingDays = Math.max(0, 260 - toNum(totalTimeOffDays, 0));

  const annualSessions = useMemo(() => spw * workingWeeks, [spw, workingWeeks]);
  const annualCollections = useMemo(
    () => netPerSession * annualSessions,
    [netPerSession, annualSessions]
  );
  const billableHours = useMemo(() => annualSessions, [annualSessions]);

  const payrollLoadRate = clamp(toNum(payrollLoadPct, 10) / 100, 0, 0.5);
  const matchRate = clamp(toNum(matchPct, 0) / 100, 0, 0.2);
  const loadRate = clamp(payrollLoadRate + matchRate, 0, 0.5);

  // Admin Cost Calculation
  const annualAdminGross = useMemo(() => {
    return toNum(adminHours, 0) * toNum(adminHourlyRate, 0) * workingWeeks;
  }, [adminHours, adminHourlyRate, workingWeeks]);

  // --- Range Logic Calculation ---
  const calculateW2Sustainable = (ratioPct: number) => {
    const totalBudget = annualCollections * (ratioPct / 100);
    const adminCostToPractice = annualAdminGross * (1 + loadRate);
    const availableForClinical = totalBudget - adminCostToPractice;
    return solveAnnualW2Base({
        allowTotalCost: availableForClinical,
        annualHealth: toNum(annualHealth, 0),
        loadRate
    });
  }

  const calculate1099Sustainable = (ratioPct: number) => {
    const totalBudget = annualCollections * (ratioPct / 100);
    const availableForClinical = totalBudget - annualAdminGross;
    const clinicalPayoutPerSession = annualSessions > 0 ? availableForClinical / annualSessions : 0;
    return clinicalPayoutPerSession;
  }

  const rangeSalaryMin = calculateW2Sustainable(band.min);
  const rangeSalaryMax = calculateW2Sustainable(band.max);
  const rangeSalaryAvg = calculateW2Sustainable(band.avg);
  
  const rangeHourlyMin = billableHours > 0 ? rangeSalaryMin / billableHours : 0;
  const rangeHourlyMax = billableHours > 0 ? rangeSalaryMax / billableHours : 0;
  const rangeHourlyAvg = billableHours > 0 ? rangeSalaryAvg / billableHours : 0;

  const range1099Min = calculate1099Sustainable(band.min);
  const range1099Max = calculate1099Sustainable(band.max);
  const range1099Avg = calculate1099Sustainable(band.avg);

  // Auto-populate offers with the sustainable average when inputs drastically change
  // Note: We use a ref or check if 0 to prevent overwriting user input constantly
  // For simplicity here, we only set if 0 (initial)
  useEffect(() => {
    if (offerSalary === 0 && rangeSalaryAvg > 0) setOfferSalary(Math.round(rangeSalaryAvg));
    if (offerHourly === 0 && rangeHourlyAvg > 0) setOfferHourly(Number(rangeHourlyAvg.toFixed(2)));
    if (offer1099 === 0 && range1099Avg > 0) setOffer1099(Number(range1099Avg.toFixed(2)));
  }, [rangeSalaryAvg, rangeHourlyAvg, range1099Avg]);

  // --- Real-time Margin Checks for Ranges Tab ---
  const checkW2Margin = (clinicalBase: number) => {
    const w2AdminBase = annualAdminGross;
    const w2TotalGross = clinicalBase + w2AdminBase;
    const w2Tax = w2TotalGross * payrollLoadRate;
    const w2MatchVal = w2TotalGross * matchRate;
    const totalCost = w2TotalGross + w2Tax + w2MatchVal + toNum(annualHealth, 0);
    const margin = annualCollections - totalCost;
    return annualCollections > 0 ? margin / annualCollections : 0;
  };

  const check1099Margin = (sessionRate: number) => {
    const icClinicalTotal = sessionRate * annualSessions;
    const icAdminTotal = annualAdminGross;
    const icTotalGross = icClinicalTotal + icAdminTotal;
    const margin = annualCollections - icTotalGross;
    return annualCollections > 0 ? margin / annualCollections : 0;
  };


  // --- Summary Tab Calculations (Using USER OFFERS) ---
  
  const w2ClinicalBase = w2Mode === 'salary' 
      ? toNum(offerSalary, 0) 
      : toNum(offerHourly, 0) * billableHours;

  const w2AdminBase = annualAdminGross;
  const w2TotalGross = w2ClinicalBase + w2AdminBase;
  
  const w2PayrollTax = w2TotalGross * payrollLoadRate;
  const w2Match = w2TotalGross * matchRate; 
  const w2Health = toNum(annualHealth, 0);
  
  const w2TotalCost = w2TotalGross + w2PayrollTax + w2Match + w2Health;
  const marginW2 = annualCollections - w2TotalCost;
  const marginW2Pct = annualCollections > 0 ? marginW2 / annualCollections : 0;

  const icClinicalTotal = toNum(offer1099, 0) * annualSessions;
  const icAdminTotal = annualAdminGross;
  const icTotalGross = icClinicalTotal + icAdminTotal;
  
  const icTotalCost = icTotalGross; 
  const marginIC = annualCollections - icTotalCost;
  const marginICPct = annualCollections > 0 ? marginIC / annualCollections : 0;

  // Estimator (Net Pay)
  const taxRate = clamp(incomeTaxRate, 0, 60) / 100;
  
  const w2EmpFica = 0.0765; 
  const w2TaxesEst = w2TotalGross * (w2EmpFica + taxRate);
  const w2NetEst = Math.max(0, w2TotalGross - w2TaxesEst);

  const seTaxRate = 0.153 * 0.9235; 
  const icTaxesEst = icTotalGross * (seTaxRate + taxRate);
  const icHealthCost = showEstimator ? toNum(annualHealth, 0) : 0; 
  const icNetEst = Math.max(0, icTotalGross - icTaxesEst - icHealthCost);
  
  // -- Helper for Margin Styles --
  const renderRangeCard = (
      title: string, 
      rangeStr: string, 
      label: string, 
      value: number | string, 
      setValue: (v: number) => void,
      min: number,
      max: number,
      step: number,
      marginPct: number,
      colorClass: string,
      borderClass: string,
      headerClass: string,
      unit: string = ""
  ) => {
      const marginStatus = getMarginStatus(marginPct, rolePreset);
      
      return (
        <div className={cn("bg-gradient-to-br p-6 rounded-2xl border shadow-sm flex flex-col items-center justify-between text-center space-y-4 relative overflow-hidden group hover:shadow-md transition-all", colorClass, borderClass)}>
           <div className={cn("absolute top-0 w-full h-1", headerClass)}></div>
           <div className={cn("text-xs uppercase font-bold tracking-widest", headerClass.replace('bg-', 'text-'))}>{title}</div>
           
           <div className="space-y-1">
             <div className="text-3xl font-bold text-gray-900 tracking-tight">
               {rangeStr} <span className="text-lg text-gray-400 font-normal">{unit}</span>
             </div>
             <div className="text-xs text-gray-500">Recommended Sustainable Range</div>
           </div>
           
           <div className={cn("w-full p-4 rounded-xl shadow-inner transition-colors duration-300", marginStatus.containerClass)}>
              <div className="flex justify-between items-center mb-3">
                 <label className={cn("text-xs font-bold uppercase tracking-wide", marginStatus.valueColor)}>{label}</label>
                 <span className="text-base font-bold text-gray-900">{typeof value === 'number' ? (unit === '/hr' ? fmtUSD2(value) : fmtUSD(value)) : value}{unit}</span>
              </div>
              <Slider 
                value={[toNum(value, 0)]} 
                min={min} 
                max={max} 
                step={step} 
                onValueChange={(v: number[]) => setValue(v[0])} 
              />
              <div className="mt-3 flex items-center justify-between border-t border-gray-900/5 pt-2">
                 <span className="text-xs text-gray-500 font-medium">Margin:</span>
                 <div className="flex items-center gap-2">
                     <span className={cn("text-3xl font-bold", marginStatus.valueColor)}>{fmtPct(marginPct)}</span>
                     <span className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded shadow-sm", marginStatus.badgeClass)}>
                         {marginStatus.status}
                     </span>
                 </div>
              </div>
           </div>
        </div>
      );
  };

  return (
    <div className="w-full font-sans bg-gray-50 min-h-screen pb-12">
      <style>{`
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance:none; appearance:none; height:18px; width:18px; border-radius:9999px; background:#2563eb; border:2px solid #fff; box-shadow:0 1px 2px rgba(0,0,0,.15); cursor: pointer; }
        input[type="range"]::-moz-range-thumb { height:18px; width:18px; border-radius:9999px; background:#2563eb; border:2px solid #fff; box-shadow:0 1px 2px rgba(0,0,0,.15); cursor: pointer; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(3px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
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

      {/* Lead Capture Modal */}
      <ReportCaptureModal isOpen={showLeadModal} onClose={() => setShowLeadModal(false)} onConvert={handleLeadConvert} />

      <Tabs 
        value={activeTab} 
        onValueChange={handleTabChange}
        defaultValue="inputs" 
        className="w-full max-w-6xl mx-auto"
      >
        {/* Sticky Header Wrapper */}
        <div className="sticky top-0 z-40 bg-gray-50/95 backdrop-blur-md shadow-sm border-b border-gray-200 transition-all">
          <div className="px-4 py-3 sm:px-6 sm:py-4 max-w-6xl mx-auto space-y-4">
            
            {/* Header Top Row: Title + CTA */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
               {/* Title Area */}
               <div className="flex items-center justify-between md:justify-start gap-3">
                 <div className="flex items-center gap-2">
                   <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 leading-none">Comp Calculator</h1>
                   <div className="flex gap-1">
                     <button 
                       onClick={() => {
                         setShowTour(true);
                         setTourStep(0);
                       }}
                       className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                       title="Restart Tour"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"></circle>
                          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                          <line x1="12" y1="17" x2="12.01" y2="17"></line>
                        </svg>
                     </button>
                     <button 
                       onClick={handleShare}
                       className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                       title="Share Configuration"
                     >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                     </button>
                   </div>
                 </div>
               </div>
               
               {/* CTA Banner Area */}
               <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 bg-blue-50/50 md:bg-transparent p-3 md:p-0 rounded-xl md:rounded-none border md:border-none border-blue-100 w-full md:w-auto">
                   <span className="text-xs sm:text-sm font-medium text-gray-600 text-center md:text-right">
                      Want help applying this to your practice?
                   </span>
                   <div className="hidden md:flex text-amber-500 animate-bounce-x">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                   </div>
                   <a href={CTA_URL} target="_blank" rel="noopener noreferrer" className="w-full md:w-auto">
                     <Button className="w-full md:w-auto bg-amber-600 hover:bg-amber-700 text-white border-transparent shadow-md shadow-amber-200 font-bold tracking-wide">
                        Book Free Profit Audit
                     </Button>
                   </a>
               </div>
            </div>
            
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger id="tab-trigger-inputs" value="inputs">Inputs</TabsTrigger>
              <TabsTrigger id="tab-trigger-ranges" value="ranges">Ranges</TabsTrigger>
              <TabsTrigger id="tab-trigger-summary" value="summary">Summary</TabsTrigger>
            </TabsList>
          </div>
        </div>

        <div className="p-4 sm:p-6 space-y-6">
          {/* Inputs */}
          <TabsContent value="inputs" className="space-y-6">
            
            {/* Quick Start Presets */}
            <div className="space-y-2">
              <Label className="text-xs uppercase text-gray-500 tracking-wider">Quick Start Presets</Label>
              <ScenarioPresets onSelect={applyPreset} />
            </div>

            <Card>
              <CardContent className="grid lg:grid-cols-2 gap-8 relative">
                <div className="space-y-5">
                  <div className="space-y-4">
                     <RowSwitch
                      label="Use net session rate directly"
                      checked={useNetDirect}
                      onChange={setUseNetDirect}
                      tooltip="Toggle on if you know your average collected amount per session. Toggle off to calculate it from a gross rate minus fee percentages."
                    />
                    <p className="text-xs text-gray-600 hidden sm:block">Toggle on to input your net collections per session directly. Toggle off to calculate from gross payout and fees.</p>
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

                  {/* Sessions & Working Days in one row for better mobile usage */}
                  <div className="grid grid-cols-2 gap-4">
                    <Field label="Sessions/wk" tooltip="Average number of billable client sessions held per week.">
                      <NumberInput value={sessionsPerWeek} onChange={setSessionsPerWeek} />
                    </Field>
                    <Field label="Est. Working Days/yr" tooltip="Billable days per year (260 weekdays minus time off).">
                      <Input value={String(estWorkingDays)} readOnly disabled className="bg-gray-50 text-gray-500 font-semibold border-gray-200 cursor-not-allowed" />
                    </Field>
                  </div>

                  {/* Time Off on its own line */}
                  <Field label="Days off (PTO, Holidays, Sick days)" tooltip="Combined PTO, Holidays, and Sick days per year.">
                     <NumberInput value={totalTimeOffDays} onChange={setTotalTimeOffDays} />
                  </Field>

                  <Field label="Clinician Role" tooltip="Sets recommended compensation budget targets based on licensure status.">
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setRolePreset("pre")}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all relative",
                          rolePreset === "pre"
                            ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                        )}
                      >
                        <div className={cn("font-bold text-sm", rolePreset === "pre" ? "text-blue-900" : "text-gray-900")}>Pre-Licensed</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Aim 40–50% of Rev</div>
                        {rolePreset === "pre" && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />}
                      </button>
                      <button
                        onClick={() => setRolePreset("licensed")}
                        className={cn(
                          "p-3 rounded-xl border text-left transition-all relative",
                          rolePreset === "licensed"
                            ? "border-blue-600 bg-blue-50 ring-1 ring-blue-600 shadow-sm"
                            : "border-gray-200 bg-white hover:border-blue-300 hover:bg-gray-50"
                        )}
                      >
                        <div className={cn("font-bold text-sm", rolePreset === "licensed" ? "text-blue-900" : "text-gray-900")}>Licensed</div>
                        <div className="text-[10px] text-gray-500 mt-1 font-medium">Aim 50–60% of Rev</div>
                        {rolePreset === "licensed" && <div className="absolute top-2 right-2 w-2 h-2 bg-blue-600 rounded-full" />}
                      </button>
                    </div>
                  </Field>
                </div>

                <div className="space-y-6">
                  
                  {/* Simple/Advanced Toggle */}
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm font-medium text-gray-500">Advanced Settings (Taxes, Admin, Benefits)</span>
                    <Switch checked={isAdvancedMode} onCheckedChange={setIsAdvancedMode} />
                  </div>

                  {isAdvancedMode && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                      
                      {/* Admin Time Section */}
                       <div className="rounded-xl border border-gray-200 p-4 bg-gray-50 space-y-3">
                        <Label>Administrative Time (Non-Clinical)</Label>
                        <div className="grid grid-cols-2 gap-4">
                           <Field label="Admin Hours/wk" tooltip="Hours per week paid for admin/meetings.">
                             <NumberInput value={adminHours} onChange={setAdminHours} min={0} />
                           </Field>
                           <Field label="Admin Rate ($/hr)" tooltip="Hourly rate for administrative work.">
                             <CurrencyInput value={adminHourlyRate} onChange={setAdminHourlyRate} min={0} />
                           </Field>
                        </div>
                        <p className="text-xs text-gray-500">
                           Annual Admin Cost: {fmtUSD(annualAdminGross)}. This cost is deducted from the budget before calculating the sustainable clinical rate.
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
                          <Field label="Employer Health (annual)" tooltip="Annual employer contribution towards health insurance premiums. Also used as the estimated cost for private insurance in the 1099 model.">
                            <CurrencyInput value={annualHealth} onChange={setAnnualHealth} />
                          </Field>
                        </div>
                      </AccordionLike>

                      <AccordionLike title="What-if Scenarios">
                        <div className="space-y-4">
                            <Field label="Rate shock" tooltip="Simulate a percentage increase or decrease in reimbursement rates.">
                              <PercentSlider value={rateShockPct} onChange={setRateShockPct} min={-20} max={20} />
                            </Field>
                            <Field label="Volume shock" tooltip="Simulate a percentage increase or decrease in patient volume.">
                              <PercentSlider value={volumeShockPct} onChange={setVolumeShockPct} min={-30} max={30} />
                            </Field>
                        </div>
                      </AccordionLike>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            {/* Mobile Nav Button */}
            <div className="flex justify-end pt-4">
               <Button onClick={() => handleTabChange('ranges')} className="w-full sm:w-auto h-12 text-base shadow-lg shadow-blue-100/50">
                 Continue to Ranges →
               </Button>
            </div>
          </TabsContent>
          
          {/* New Ranges Tab */}
          <TabsContent value="ranges">
            <Card>
              <CardContent className="space-y-6 py-8 sm:py-12">
                 <div className="text-center space-y-2 max-w-2xl mx-auto">
                    <h2 className="text-2xl font-bold text-gray-900">Sustainable Compensation Ranges</h2>
                    <p className="text-gray-600">
                       Based on your inputs, these are the recommended sustainable offers. <br/>
                       <span className="text-sm font-semibold text-blue-700">Use the sliders below to check profitability.</span>
                    </p>
                    {annualAdminGross > 0 && (
                      <div className="inline-block bg-yellow-50 text-yellow-800 text-xs px-3 py-1 rounded-full border border-yellow-200 mt-2">
                        Includes {fmtUSD(annualAdminGross)}/yr for Admin Time
                      </div>
                    )}
                 </div>
                 
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
                    {renderRangeCard(
                      "W-2 Salary", 
                      `${fmtUSD(rangeSalaryMin)} – ${fmtUSD(rangeSalaryMax)}`, 
                      "Your Offer (Annual)", 
                      offerSalary, 
                      setOfferSalary,
                      Math.max(0, Math.floor(rangeSalaryMin * 0.5)),
                      Math.max(1000, Math.ceil(rangeSalaryMax * 1.5)),
                      500,
                      checkW2Margin(toNum(offerSalary, 0)),
                      "from-blue-50 to-white",
                      "border-blue-100",
                      "bg-blue-500"
                    )}

                    {renderRangeCard(
                      "W-2 Hourly", 
                      `${rangeHourlyMin.toFixed(0)} – ${rangeHourlyMax.toFixed(0)}`, 
                      "Your Offer (Hourly)", 
                      offerHourly, 
                      setOfferHourly,
                      Math.max(0, Math.floor(rangeHourlyMin * 0.5)),
                      Math.max(10, Math.ceil(rangeHourlyMax * 1.5)),
                      0.5,
                      checkW2Margin(toNum(offerHourly, 0) * billableHours),
                      "from-blue-50 to-white",
                      "border-blue-100",
                      "bg-blue-500",
                      "/hr"
                    )}

                    {renderRangeCard(
                      "1099 Rate", 
                      `${fmtUSD(range1099Min)} – ${fmtUSD(range1099Max)}`, 
                      "Your Offer (Session)", 
                      offer1099, 
                      setOffer1099,
                      Math.max(0, Math.floor(range1099Min * 0.5)),
                      Math.max(10, Math.ceil(range1099Max * 1.5)),
                      1,
                      check1099Margin(toNum(offer1099, 0)),
                      "from-purple-50 to-white md:col-span-2 lg:col-span-1",
                      "border-purple-100",
                      "bg-purple-500",
                      "/ses"
                    )}
                 </div>
                 
                 <div className="bg-blue-50 rounded-xl p-4 mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border border-blue-100">
                    <div className="flex items-start gap-3">
                       <InfoIcon className="text-blue-600 mt-0.5" />
                       <div className="text-sm text-blue-900">
                          <span className="font-bold">Next Steps:</span> Use sliders to adjust your offer. The background color will indicate if it's healthy. Then check the Summary tab to see the final breakdown.
                       </div>
                    </div>
                    <Button onClick={() => handleTabChange('summary')} variant="secondary" className="whitespace-nowrap w-full sm:w-auto">
                       Compare & Finalize →
                    </Button>
                 </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Summary / Comparison */}
          <TabsContent value="summary" className="space-y-6">
            <Card>
              <CardContent className="space-y-6">
                 <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Comparison of Your Offers</h2>
                        <p className="text-xs text-gray-500 mt-1">Comparing your specific W-2 and 1099 offers entered in the Ranges tab.</p>
                    </div>
                    <div className="flex flex-col sm:items-end gap-3 w-full sm:w-auto">
                        {/* W-2 Mode Toggle */}
                        <div className="flex items-center self-end bg-gray-100 p-1 rounded-lg">
                           <button 
                              onClick={() => setW2Mode('salary')}
                              className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all", w2Mode === 'salary' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700")}
                           >
                             Salary View
                           </button>
                           <button 
                              onClick={() => setW2Mode('hourly')}
                              className={cn("px-3 py-1.5 text-xs font-bold rounded-md transition-all", w2Mode === 'hourly' ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700")}
                           >
                             Hourly View
                           </button>
                        </div>
                        
                        {/* Net Pay Group */}
                        <div className={cn("flex flex-col gap-2 p-2 rounded-lg border transition-colors self-end w-full sm:w-auto", showEstimator ? "bg-blue-50 border-blue-100" : "bg-transparent border-transparent")}>
                            <div className="flex items-center justify-end gap-2">
                                <Label className="text-xs text-gray-600 cursor-pointer" onClick={() => setShowEstimator(!showEstimator)}>Estimate Net Pay?</Label>
                                <Switch checked={showEstimator} onCheckedChange={setShowEstimator} />
                            </div>
                            
                            {showEstimator && (
                                <div className="flex items-center justify-end gap-2 animate-in fade-in slide-in-from-top-1">
                                    <span className="text-xs text-gray-500 whitespace-nowrap">Est. Tax Rate:</span>
                                     <div className="w-20">
                                        <PercentInput 
                                            value={incomeTaxRate} 
                                            onChange={setIncomeTaxRate} 
                                            className="h-8 text-right bg-white" 
                                        />
                                     </div>
                                </div>
                            )}
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-3 gap-4 border-b border-gray-200 pb-2 text-sm font-bold text-gray-500 uppercase tracking-wide">
                    <div>Metric</div>
                    <div className="text-right text-blue-700">W-2 ({w2Mode === 'salary' ? 'Salary' : 'Hourly'})</div>
                    <div className="text-right text-purple-700">1099 (Per Session)</div>
                 </div>

                 <div className="space-y-4 text-sm">
                    {/* Gross Pay */}
                    <div className="grid grid-cols-3 gap-4 items-center">
                       <div className="font-medium text-gray-900">Gross Clinician Income</div>
                       <div className="text-right font-semibold">{fmtUSD(w2TotalGross)}</div>
                       <div className="text-right font-semibold">{fmtUSD(icTotalGross)}</div>
                    </div>
                    
                    {/* Income Breakdown */}
                    <div className="grid grid-cols-3 gap-4 items-center text-xs text-gray-500">
                       <div className="pl-3 border-l-2 border-gray-100">↳ Clinical Pay</div>
                       <div className="text-right">{fmtUSD(w2ClinicalBase)}</div>
                       <div className="text-right">{fmtUSD(icClinicalTotal)}</div>
                    </div>
                    {annualAdminGross > 0 && (
                      <div className="grid grid-cols-3 gap-4 items-center text-xs text-gray-500">
                         <div className="pl-3 border-l-2 border-gray-100">↳ Admin Pay</div>
                         <div className="text-right">{fmtUSD(w2AdminBase)}</div>
                         <div className="text-right">{fmtUSD(icAdminTotal)}</div>
                      </div>
                    )}

                    {/* Estimator Rows */}
                    {showEstimator && (
                      <>
                        <div className="grid grid-cols-3 gap-4 items-center text-red-600 mt-2">
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

                    {/* Employer Cost Breakdown (if not estimator) */}
                    {!showEstimator && (
                       <>
                         {/* Health */}
                         {toNum(annualHealth, 0) > 0 && (
                           <div className="grid grid-cols-3 gap-4 items-center text-green-600">
                              <div>
                                 <div className="font-medium">+ Health Ins.</div>
                              </div>
                              <div className="text-right">+ {fmtUSD(toNum(annualHealth,0))}</div>
                              <div className="text-right text-gray-300">-</div>
                           </div>
                         )}
                         
                         {/* Match */}
                         {w2Match > 0 && (
                           <div className="grid grid-cols-3 gap-4 items-center text-green-600">
                              <div>
                                 <div className="font-medium">+ 401k Match</div>
                              </div>
                              <div className="text-right">+ {fmtUSD(w2Match)}</div>
                              <div className="text-right text-gray-300">-</div>
                           </div>
                         )}

                         {/* Taxes */}
                         <div className="grid grid-cols-3 gap-4 items-center text-green-600">
                              <div>
                                 <div className="font-medium">+ Payroll Tax</div>
                              </div>
                              <div className="text-right">+ {fmtUSD(w2PayrollTax)}</div>
                              <div className="text-right text-gray-300">-</div>
                           </div>

                         <div className="grid grid-cols-3 gap-4 items-center border-t border-gray-100 pt-2 font-semibold">
                            <div>Total Employer Cost</div>
                            <div className="text-right text-gray-900">{fmtUSD(w2TotalCost)}</div>
                            <div className="text-right text-gray-900">{fmtUSD(icTotalCost)}</div>
                         </div>
                       </>
                    )}

                    <div className="grid grid-cols-3 gap-4 items-center border-t border-gray-200 pt-3">
                       <div className="font-medium text-gray-900">Practice Margin</div>
                       <div className="text-right font-medium text-gray-600 flex flex-col items-end gap-1">
                          {fmtUSD(marginW2)}
                          <MarginBadge pct={marginW2Pct} rolePreset={rolePreset} />
                       </div>
                       <div className="text-right font-medium text-gray-600 flex flex-col items-end gap-1">
                          {fmtUSD(marginIC)}
                          <MarginBadge pct={marginICPct} rolePreset={rolePreset} />
                       </div>
                    </div>
                 </div>

                 {/* CTA Banner */}
                 <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-blue-900">Have questions about how to setup compensation for your practice?</h3>
                      <p className="text-xs text-blue-700 leading-relaxed mt-1">Or do you want to take your comp plan to the next level by adding in tiers or bonus? Schedule a call with us today.</p>
                    </div>
                    <a href={CTA_URL} target="_blank" rel="noopener noreferrer">
                      <Button className="w-full sm:w-auto shadow-sm whitespace-nowrap bg-blue-600 hover:bg-blue-700 text-white border-transparent">
                        Book Strategy Call
                      </Button>
                    </a>
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
                           { label: "Wages", value: w2TotalGross, color: "bg-blue-600" },
                           { label: "Benefits/Tax", value: w2TotalCost - w2TotalGross, color: "bg-blue-300" },
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
                           { label: "Clinician Pay", value: icTotalGross, color: "bg-purple-600" },
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
        </div>
      </Tabs>
      
      {/* Footer Disclaimer */}
      <footer className="max-w-6xl mx-auto px-6 py-8 text-center">
        <p className="text-xs text-gray-400 leading-relaxed">
          Disclaimer: These calculations are estimates for educational purposes only and do not constitute professional financial, tax, or legal advice. 
          Please consult with a qualified professional before making business decisions.
        </p>
      </footer>
    </div>
  );
}