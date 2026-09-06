import React from "react";
import { cn } from "@/lib/utils";

interface ApplicationStepperProps {
  currentStep: number;
  onStepClick?: (step: number) => void;
  maxAccessibleStep?: number;
  className?: string;
}

// "Create Account" happens on a separate page before this stepper is ever
// shown, so it's always step 0 — completed, not clickable, shown purely so
// the indicator reflects the applicant's whole journey, not just this form.
const CREATE_ACCOUNT_STEP = 0;

const STEPS = [
  { step: CREATE_ACCOUNT_STEP, label: "Create Account", short: "Account" },
  { step: 1, label: "Personal Details", short: "Personal" },
  { step: 2, label: "Qualifications", short: "Academic" },
  { step: 3, label: "Programme", short: "Programme" },
  { step: 4, label: "Upload Documents", short: "Documents" },
  { step: 5, label: "Review & Submit", short: "Review" },
];

export function ApplicationStepper({
  currentStep,
  onStepClick,
  maxAccessibleStep = 5,
  className,
}: ApplicationStepperProps) {
  const totalSteps = STEPS.length - 1; // excludes the always-done "Create Account"
  const percent = Math.round((Math.min(currentStep, totalSteps) / totalSteps) * 100);
  const currentLabel = STEPS.find((s) => s.step === currentStep)?.label ?? "";

  return (
    <div className={cn("w-full py-4", className)}>
      {/* Compact mobile variant: a linear progress bar + text, not a shrunk
          copy of the desktop circles — six circles at 360px is still cramped
          even shrunk and unlabeled. */}
      <div className="sm:hidden">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gold">
            Step {currentStep} of {totalSteps}: {currentLabel}
          </span>
          <span className="text-xs font-semibold text-navy">{percent}%</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-slate/20" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100} aria-label="Application progress">
          <div className="h-full rounded-full bg-gold transition-all duration-300" style={{ width: `${percent}%` }} />
        </div>
      </div>

      {/* Full stepper: desktop and up */}
      <div className="hidden sm:block">
        <p className="mb-3 text-right text-xs font-semibold text-navy">{percent}% complete</p>
        <div className="relative flex items-center justify-between">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate/20 -z-0" />
          <div
            className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-gold transition-all duration-300 -z-0"
            style={{ width: `${(Math.min(currentStep, totalSteps) / totalSteps) * 100}%` }}
          />

          {STEPS.map((s) => {
            const isCompleted = s.step < currentStep || s.step === CREATE_ACCOUNT_STEP;
            const isCurrent = s.step === currentStep;
            const isClickable = Boolean(onStepClick && s.step !== CREATE_ACCOUNT_STEP && s.step <= maxAccessibleStep);

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
                  aria-label={`Step ${s.step}: ${s.label}${isCompleted ? " (completed)" : ""}`}
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
                    "mt-2 text-xs font-medium tracking-tight text-center whitespace-nowrap",
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
    </div>
  );
}
