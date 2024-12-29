interface TimelineStep {
  label: string;
  status: 'completed' | 'current' | 'upcoming';
}

interface GenerationTimelineProps {
  steps: TimelineStep[];
}

export function GenerationTimeline({ steps }: GenerationTimelineProps) {
  return (
    <div className="py-6">
      <div className="flex items-center">
        {steps.map((step, index) => (
          <div key={step.label} className="flex-1 relative">
            {/* Connector line */}
            {index < steps.length - 1 && (
              <div className={`absolute top-3 left-1/2 w-full h-0.5 ${
                step.status === 'completed' ? 'bg-purple-500' : 'bg-gray-200'
              }`} />
            )}
            
            {/* Step circle */}
            <div className="relative flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full border-2 ${
                step.status === 'completed' ? 'bg-purple-500 border-purple-500' :
                step.status === 'current' ? 'bg-white border-purple-500' :
                'bg-white border-gray-300'
              }`} />
              
              <span className={`mt-2 text-sm ${
                step.status === 'completed' ? 'text-purple-600' :
                step.status === 'current' ? 'text-purple-600' :
                'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}