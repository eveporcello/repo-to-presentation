import { Sparkles, Code, FileText, Presentation } from 'lucide-react'

const steps = [
  {
    icon: Code,
    title: 'Analyzing Repository',
    description: 'Reading file structure and understanding your codebase'
  },
  {
    icon: Sparkles,
    title: 'Generating Insights',
    description: 'Claude is identifying key technical highlights and story flow'
  },
  {
    icon: FileText,
    title: 'Creating Content',
    description: 'Building your customized run of show and presenter notes'
  },
  {
    icon: Presentation,
    title: 'Finalizing Presentation',
    description: 'Polishing timing, structure, and audience-specific content'
  }
]

export function LoadingState() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Generating Your Presentation
          </h3>
          <p className="text-gray-600 text-sm mt-2">
            Claude is analyzing your repository and creating your presentation guide...
          </p>
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = step.icon
            return (
              <div
                key={step.title}
                className={`flex items-start space-x-3 p-3 rounded-lg transition-all duration-500 ${
                  index === 1 ? 'bg-primary-50 border border-primary-200' : 'bg-gray-50'
                }`}
              >
                <div className={`flex-shrink-0 ${index === 1 ? 'text-primary-600' : 'text-gray-400'}`}>
                  <Icon className={`h-5 w-5 ${index === 1 ? 'animate-pulse' : ''}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-medium ${index === 1 ? 'text-primary-900' : 'text-gray-700'}`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${index === 1 ? 'text-primary-700' : 'text-gray-500'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6">
          <div className="bg-gray-200 rounded-full h-2">
            <div className="bg-primary-600 h-2 rounded-full animate-pulse" style={{ width: '65%' }}></div>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            This usually takes 30-60 seconds
          </p>
        </div>
      </div>
    </div>
  )
}