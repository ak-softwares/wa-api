import { Check } from "lucide-react"
import { Button } from "@/components/ui/button"

export type StepperStep = {
  id: string
  label: string
  description?: string
  doneDescription?: string
  actionLabel?: string
  onAction?: () => void
  loading?: boolean
  disabled?: boolean
}

export default function SetupStepper({
  steps,
  currentStepIndex,
}: {
  steps: StepperStep[]
  currentStepIndex: number
}) {
  return (
    <div className="w-full flex justify-center">
      <div className="w-full max-w-5xl rounded-2xl border px-2 py-5">
        <div className="flex items-start justify-center gap-0">
          {steps.map((step, idx) => {
            const isCompleted = idx < currentStepIndex
            const isActive = idx === currentStepIndex

            return (
              <div key={step.id} className="relative flex flex-col items-center flex-1">
                {/* Connector */}
                {idx !== steps.length - 1 && (
                  <div
                    className={`absolute top-3.5 h-[2px] left-[calc(50%+20px)] right-[calc(-50%+18px)] ${
                      isCompleted ? "bg-[#11B8A2]" : "bg-gray-200 dark:bg-gray-700"
                    }`}
                  />
                )}

                {/* Node */}
                <div
                  className={`z-10 h-7 w-7 rounded-lg flex items-center justify-center border transition ${
                    isCompleted
                      ? "bg-[#11B8A2] border-[#11B8A2] text-white"
                      : isActive
                      ? "bg-[#11B8A2] border border-[#11B8A2] ring-2 ring-[#11B8A2]/30 text-white"
                      : "bg-white dark:bg-transparent border-gray-300 dark:border-gray-300 text-gray-300"
                  }`}
                >
                  {isCompleted ? <Check size={17} /> : <span className="h-3 w-3 rounded-[4px] bg-current opacity-80" />}
                </div>

                {/* Text + Action */}
                <div className="mt-2 text-center leading-tight px-2">
                  <div
                    className={`font-semibold ${
                      isCompleted || isActive ? "text-gray-900 dark:text-white" : "text-gray-500"
                    }`}
                  >
                    {step.label}
                  </div>

                  <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    {isCompleted ? step.doneDescription : step.description}
                  </div>

                  {/* 🔥 Action button inside active step */}
                  {isActive && step.onAction && step.actionLabel && (
                    <Button
                      size="sm"
                      className="mt-2"
                      variant="outline"
                      disabled={step.disabled || step.loading}
                      onClick={step.onAction}
                    >
                      {step.loading ? "Please wait..." : step.actionLabel}
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
