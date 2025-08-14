import { Github, AlertCircle } from 'lucide-react'

interface RepoInputProps {
  value: string
  onChange: (value: string) => void
  error?: string | null
  disabled?: boolean
}

export function RepoInput({ value, onChange, error, disabled }: RepoInputProps) {
  const isValidGitHubUrl = (url: string) => {
    const githubUrlPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/
    return githubUrlPattern.test(url.trim())
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value)
  }

  const showValidation = value.length > 0 && !isValidGitHubUrl(value)

  return (
    <div>
      <label htmlFor="repo-url" className="block text-sm font-medium text-gray-700 mb-2">
        GitHub Repository URL
      </label>
      
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Github className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          id="repo-url"
          type="url"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="https://github.com/username/repository"
          className={`
            input pl-10 pr-4
            ${showValidation ? 'border-red-300 focus-visible:ring-red-500' : ''}
            ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
          `}
          aria-describedby={error ? 'repo-url-error' : undefined}
        />
        
        {showValidation && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
        )}
      </div>

      {/* Validation Message */}
      {showValidation && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          Please enter a valid GitHub repository URL
        </p>
      )}

      {/* Error Message */}
      {error && (
        <p id="repo-url-error" className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Helper Text */}
      {!showValidation && !error && (
        <p className="mt-2 text-sm text-gray-500">
          Enter the URL of any public GitHub repository to analyze
        </p>
      )}

      {/* Example repositories */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">Try these examples:</p>
        <div className="flex flex-wrap gap-2">
          {[
            'https://github.com/facebook/react',
            'https://github.com/vercel/next.js',
            'https://github.com/microsoft/vscode'
          ].map((example) => (
            <button
              key={example}
              onClick={() => onChange(example)}
              disabled={disabled}
              className="text-xs text-primary-600 hover:text-primary-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {example.replace('https://github.com/', '')}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}