import React, { useState } from "react";
import { Button, Input } from "./ui";
import { cn } from "../utils";
import { Field } from "./ui-extended";

// --- Lead Magnet Components ---

export function ScenarioPresets({ onSelect }: { onSelect: (preset: any) => void }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6">
      <button 
        onClick={() => onSelect({ netRate: 120, sessionsPerWeek: 20, rolePreset: 'pre' })}
        className="p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
      >
        <div className="font-bold text-gray-900 text-xs sm:text-sm">New Grad</div>
        <div className="text-[10px] text-gray-500">20 sessions, Pre-Lic</div>
      </button>
      <button 
        onClick={() => onSelect({ netRate: 150, sessionsPerWeek: 25, rolePreset: 'licensed' })}
        className="p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
      >
        <div className="font-bold text-gray-900 text-xs sm:text-sm">Standard Lic.</div>
        <div className="text-[10px] text-gray-500">25 sessions, Licensed</div>
      </button>
      <button 
        onClick={() => onSelect({ netRate: 180, sessionsPerWeek: 30, rolePreset: 'licensed' })}
        className="p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
      >
        <div className="font-bold text-gray-900 text-xs sm:text-sm">High Earner</div>
        <div className="text-[10px] text-gray-500">30 sessions, Licensed</div>
      </button>
      <button 
        onClick={() => onSelect({ netRate: 110, sessionsPerWeek: 15, rolePreset: 'pre' })}
        className="p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50 text-left transition-all"
      >
        <div className="font-bold text-gray-900 text-xs sm:text-sm">Part Time</div>
        <div className="text-[10px] text-gray-500">15 sessions, Pre-Lic</div>
      </button>
    </div>
  )
}

export function ReportCaptureModal({ isOpen, onClose, onConvert }: { isOpen: boolean; onClose: () => void; onConvert: () => void }) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<'form' | 'success'>('form');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if(!email) return;
    setLoading(true);
    // Simulate API call and success
    setTimeout(() => {
      setLoading(false);
      setStatus('success');
      onConvert(); 
    }, 1500);
  };

  const CTA_BOOKING_URL = "https://marketing.mtcsbusinessfinance.com/wa-schedule-your-call?utm_source=calculator&utm_medium=lead_magnet&utm_campaign=report_success";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95 duration-200">
        
        {status === 'form' ? (
          <>
            <div className="text-center space-y-3 mb-6">
              <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-4"/><path d="m9 14 3-3 3 3"/></svg>
              </div>
              <h3 className="text-lg font-bold text-gray-900">Download Professional Offer Letter</h3>
              <p className="text-sm text-gray-600">
                Get a beautifully formatted PDF summary of this compensation plan, ready to present to your clinician or team.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Work Email">
                <Input 
                  type="email" 
                  placeholder="you@practice.com" 
                  value={email}
                  onChange={(e:any) => setEmail(e.target.value)}
                  required 
                />
              </Field>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Generating Report..." : "Send Me The Report"}
              </Button>
              <button type="button" onClick={onClose} className="w-full text-xs text-gray-500 hover:text-gray-900 py-2">
                No thanks, I'll stick to the screen
              </button>
            </form>
          </>
        ) : (
          <div className="text-center space-y-4">
             <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-2 animate-in zoom-in spin-in-12 duration-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
             </div>
             <h3 className="text-xl font-bold text-gray-900">Report Generated!</h3>
             <p className="text-sm text-gray-600">
                We've prepared your offer letter summary. 
             </p>
             <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-4">
                <p className="text-sm font-medium text-amber-900 mb-3">
                   Want to be sure these numbers are safe?
                </p>
                <a href={CTA_BOOKING_URL} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-amber-600 hover:bg-amber-700 text-white border-transparent shadow-md font-bold">
                     Book Strategy Call
                  </Button>
                </a>
             </div>
             <button onClick={onClose} className="text-xs text-gray-400 hover:text-gray-600 mt-2">
                Close
             </button>
          </div>
        )}
      </div>
    </div>
  );
}

export function AccessGateModal({ isOpen, onClose, onUnlock }: { isOpen: boolean; onClose: () => void; onUnlock: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState(false);

  if (!isOpen) return null;

  const handleVerify = () => {
    // Check code case-insensitive
    if (code.trim().toUpperCase() === "PROFIT" || code.trim().toUpperCase() === "MTCS") {
      onUnlock();
    } else {
      setError(true);
    }
  };
  
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full p-0 overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]">
          
          <div className="p-4 bg-gray-50 border-b border-gray-100 flex justify-between items-center">
             <h3 className="text-lg font-bold text-gray-900">Unlock Full Access</h3>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             <div className="text-center space-y-2">
               <p className="text-sm text-gray-600">
                 Complete the form below to unlock the <strong>Ranges</strong> and <strong>Summary</strong> tabs.
               </p>
             </div>

             {/* JOTFORM CONTAINER */}
             <div className="w-full bg-gray-50 rounded-xl overflow-hidden min-h-[450px] relative">
                 <iframe
                   id="JotFormIFrame"
                   title="Unlock Access Form"
                   src="https://form.jotform.com/253309240350144"
                   style={{width: '100%', height: '500px', border: 'none'}}
                   allowFullScreen={true}
                 ></iframe>
             </div>
             
             {/* MANUAL CODE ENTRY */}
             <div className="pt-4 border-t border-gray-100">
               <div className="text-xs font-bold text-gray-400 uppercase tracking-wider text-center mb-3">
                 Already have an access code?
               </div>
               <div className="flex gap-2 max-w-xs mx-auto">
                 <Input 
                   placeholder="Enter Code (e.g. PROFIT)" 
                   value={code} 
                   onChange={(e: any) => {
                     setCode(e.target.value);
                     setError(false);
                   }}
                   className={cn("text-center uppercase", error && "border-red-500 ring-1 ring-red-500")}
                 />
                 <Button onClick={handleVerify}>Unlock</Button>
               </div>
               {error && <p className="text-xs text-red-500 text-center mt-2">Invalid code. Please try again.</p>}
             </div>
          </div>
      </div>
    </div>
  );
}

// --- Onboarding Components ---

export function WelcomeModal({ onStart, onClose }: { onStart: () => void; onClose: () => void }) {
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
          <h3 className="text-xl font-bold text-gray-900 mb-2">Welcome to the Clinician Pay Calculator</h3>
          <p className="text-gray-600 leading-relaxed text-sm">
            This tool takes the guesswork out of hiring. In just a few minutes, you'll know exactly what you can offer without overpaying, underpaying or draining your business's profits.
          </p>
        </div>
        <Button onClick={onStart} className="w-full shadow-lg shadow-blue-200">
          Start Walkthrough
        </Button>
      </div>
    </div>
  );
}

// --- Animation Demos ---

export function InputsDemo() {
  return (
    <div className="w-full py-4 px-8 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3 my-2 select-none pointer-events-none overflow-hidden relative">
      <style>{`
        @keyframes pulse-blue {
          0%, 100% { border-color: #e5e7eb; background-color: white; }
          50% { border-color: #3b82f6; background-color: #eff6ff; }
        }
        .anim-field-1 { animation: pulse-blue 2s infinite; animation-delay: 0s; }
        .anim-field-2 { animation: pulse-blue 2s infinite; animation-delay: 0.6s; }
        .anim-field-3 { animation: pulse-blue 2s infinite; animation-delay: 1.2s; }
      `}</style>
      <div className="w-1/3 h-2 bg-gray-200 rounded-full mb-2"></div>
      <div className="grid grid-cols-2 gap-3">
         <div className="h-8 rounded border border-gray-200 bg-white anim-field-1"></div>
         <div className="h-8 rounded border border-gray-200 bg-white anim-field-2"></div>
      </div>
      <div className="h-8 rounded border border-gray-200 bg-white anim-field-3 w-3/4"></div>
    </div>
  )
}

export function RangesDemo() {
  return (
    <div className="w-full py-4 px-8 bg-gray-50 rounded-xl border border-gray-100 flex flex-col gap-3 my-2 select-none pointer-events-none overflow-hidden relative">
      <style>{`
        @keyframes slide-thumb {
          0%, 100% { left: 20%; }
          50% { left: 80%; }
        }
        @keyframes color-shift {
          0%, 100% { background-color: #22c55e; width: 40%; } /* Green */
          50% { background-color: #ef4444; width: 25%; } /* Red */
        }
        .anim-thumb { animation: slide-thumb 3s ease-in-out infinite; }
        .anim-bar { animation: color-shift 3s ease-in-out infinite; }
      `}</style>
      <div className="w-full h-24 bg-white border border-gray-200 rounded-lg p-3 flex flex-col justify-between relative shadow-sm">
         <div className="w-1/2 h-2 bg-gray-100 rounded-full mx-auto"></div>
         <div className="h-10 w-full flex items-end justify-center pb-1">
             <div className="h-2 w-full bg-gray-200 rounded-full relative">
                 <div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-600 rounded-full shadow border-2 border-white anim-thumb"></div>
             </div>
         </div>
         <div className="flex justify-between items-center border-t border-gray-50 pt-2">
            <div className="w-8 h-2 bg-gray-100 rounded"></div>
            <div className="h-4 rounded anim-bar"></div>
         </div>
      </div>
    </div>
  )
}

export function SummaryDemo() {
  return (
    <div className="w-full py-4 px-8 bg-gray-50 rounded-xl border border-gray-100 flex items-end justify-center gap-6 my-2 select-none pointer-events-none h-32 relative">
      <style>{`
        @keyframes grow-bar-1 {
          0%, 100% { height: 40%; }
          50% { height: 70%; }
        }
        @keyframes grow-bar-2 {
          0%, 100% { height: 35%; }
          50% { height: 80%; }
        }
        .anim-bar-1 { animation: grow-bar-1 3s ease-in-out infinite; }
        .anim-bar-2 { animation: grow-bar-2 3s ease-in-out infinite; }
      `}</style>
      <div className="w-12 bg-blue-200 rounded-t-md relative anim-bar-1">
         <div className="absolute bottom-0 w-full bg-blue-500 h-[60%] rounded-t-sm opacity-50"></div>
      </div>
      <div className="w-12 bg-purple-200 rounded-t-md relative anim-bar-2">
         <div className="absolute bottom-0 w-full bg-purple-500 h-[80%] rounded-t-sm opacity-50"></div>
      </div>
    </div>
  )
}

export function OnboardingTour({ 
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
  const contentMap: Record<number, { title: string; text: string; component: React.ReactNode }> = {
    1: { 
      title: "Step 1: Your Business Reality", 
      text: "Start in the **Inputs** tab to define your clinicians cost per session, caseload requirements, and any benefits. This establishes a clear revenue baseline, ensuring every offer you make is positive for the practice.",
      component: <InputsDemo />
    },
    2: { 
      title: "Step 2: Sustainable Offers", 
      text: "Switch to the **Ranges** tab to find your 'Goldilocks Zone'—compensation that is generous for clinicians but profitable for you. Use the sliders to test offers and instantly see if they are safe (Green) or risky (Red).",
      component: <RangesDemo />
    },
    3: { 
      title: "Step 3: Growth with Clarity", 
      text: "Finally, the **Summary** tab gives you a side-by-side comparison of W-2 vs 1099 models. See exactly 'where the dollar goes' (taxes, benefits, admin) so you can make a confident compensation decision.",
      component: <SummaryDemo />
    }
  };
  
  const content = contentMap[step];
  if (!content) return null;

  const parseText = (text: string) => text.split("**").map((part, i) => 
     i % 2 === 1 ? <strong key={i} className="text-blue-800 font-semibold">{part}</strong> : part
  );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] sm:pt-[20vh] px-4 pointer-events-auto">
       {/* Backdrop */}
       <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

       {/* Instruction Card */}
       <div 
          className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md animate-in fade-in zoom-in-95 duration-300"
       >
          <div className="flex justify-between items-center mb-3">
             <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
               Step {step} of 3
             </span>
             <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1">
               <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
          </div>
          
          <h3 className="text-lg font-bold text-gray-900 mb-2">{content.title}</h3>
          
          {content.component}

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