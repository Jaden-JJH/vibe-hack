import { Check } from "lucide-react";

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  labels: string[];
}

export default function StepIndicator({
  currentStep,
  totalSteps,
  labels,
}: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2 py-4 px-6">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isCompleted = step < currentStep;
        const isActive = step === currentStep;

        return (
          <div key={step} className="flex items-center gap-2">
            {/* Step circle */}
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                  isCompleted
                    ? "bg-primary-600 text-white"
                    : isActive
                    ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <Check size={16} /> : step}
              </div>
              <span
                className={`text-xs font-medium ${
                  isActive
                    ? "text-primary-600"
                    : isCompleted
                    ? "text-primary-600"
                    : "text-slate-400"
                }`}
              >
                {labels[i]}
              </span>
            </div>

            {/* Connector line */}
            {step < totalSteps && (
              <div
                className={`w-12 h-0.5 rounded-full mb-5 transition-all duration-300 ${
                  isCompleted ? "bg-primary-600" : "bg-slate-200"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
