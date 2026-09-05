import React from "react";
import { cn } from "@/lib/utils";

interface ApplicationStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  maxAccessibleStep?: number;
  className?: string;
}

const STEPS = [
  { step: 1, label: "Personal Info", short: "Personal" },
  { step: 2, label: "Qualifications", short: "Academic" },
  { step: 3, label: "Programme", short: "Programme" },
  { step: 4, label: "Documents", short: "Documents" },
  { step: 5, label: "Review & Submit", short: "Review" },
];

export function ApplicationStepper({
  currentStep,
  onStepClick,
  maxAccessibleStep = 5,
  className,
}: ApplicationStepperProps) {
  return (
    <div className={cn("w-full py-4", className)}>
      {/* Mobile Step Header */}
      <div className="flex items-center justify-between mb-3 sm:hidden">
        <span className="text-xs font-bold uppercase tracking-wider text-gold">
          Step {currentStep} of {STEPS.length}
        </span>
        <span className="text-sm font-semibold text-navy">
          {STEPS[currentStep - 1]?.label}
        </span>
      </div>

      {/* Stepper bar */}
      <div className="relative flex items-center justify-between">
        {/* Track Line */}
        <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate/20 -z-0" />
        <div
          className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-gold transition-all duration-300 -z-0"
          style={{ width: `${((Math.min(currentStep, STEPS.length) - 1) / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((s) => {
          const isCompleted = s.step < currentStep;
          const isCurrent = s.step === currentStep;
          const isClickable = Boolean(onStepClick && s.step <= maxAccessibleStep);

          return (
            <div key={s.step} className="relative z-10 flex flex-col items-center">
              <button
                type="button"
                disabled={!isClickable}
                onClick={() => isClickable && onStepClick?.(s.step)}
                className={cn(
                  "flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full font-bold text-xs sm:text-sm transition-all duration-200 shadow-sm",
                  isCompleted
                    ? "bg-gold text-navy hover:scale-105"
                    : isCurrent
                    ? "bg-navy text-gold ring-4 ring-gold/30 scale-110"
                    : "bg-white text-slate border-2 border-slate/30",
                  isClickable ? "cursor-pointer" : "cursor-default",
                )}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${s.step}: ${s.label}`}
              >
                {isCompleted ? (
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 text-navy stroke-[3]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.step
                )}
              </button>
              <span
                className={cn(
                  "hidden sm:block mt-2 text-xs font-medium tracking-tight text-center whitespace-nowrap",
                  isCurrent ? "text-navy font-bold" : isCompleted ? "text-gold font-semibold" : "text-slate",
                )}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
