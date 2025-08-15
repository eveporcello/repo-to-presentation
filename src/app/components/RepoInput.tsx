/**
 * @file RepoInput.tsx
 * @description
 * Input form component for collecting a GitHub repository URL from the user.
 * Provides validation, user feedback, and a call-to-action to start the
 * AI-powered presentation generation process.
 *
 * @remarks
 * - The main text input captures a repository URL (e.g., `https://github.com/user/repo`).
 * - Includes a submit button that triggers the parent callback with the entered value.
 * - Shows an example placeholder to guide correct formatting.
 * - Can display an error or helper text beneath the field if provided by the parent.
 * - Uses Tailwind CSS for layout, spacing, and focus/hover states.
 * - Accessibility consideration: The input has an associated `<label>` for screen readers.
 */

import { Github, AlertCircle } from "lucide-react";

interface RepoInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: string | null;
  disabled?: boolean;
}

export function RepoInput({
  value,
  onChange,
  error,
  disabled,
}: RepoInputProps) {
  /**
   * Validates whether a given string is a properly formatted GitHub repository URL.
   * Pattern enforces:
   * - Must start with "https://github.com/"
   * - Must contain exactly two path segments after domain (owner/repo)
   * - Allows letters, numbers, underscores, dashes, and dots
   */
  const isValidGitHubUrl = (url: string) => {
    const githubUrlPattern =
      /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
    return githubUrlPattern.test(url.trim());
  };

  /**
   * Updates the parent component whenever the user types in the input field.
   * Strips no characters — parent handles trimming if needed.
   */
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    onChange(e.target.value);
  };

  /**
   * Determines if validation feedback should be shown.
   * True if:
   * - User has typed something
   * - Input fails `isValidGitHubUrl` check
   */
  const showValidation =
    value.length > 0 && !isValidGitHubUrl(value);

  return (
    <div>
      {/* Accessible label for the input field */}
      <label
        htmlFor="repo-url"
        className="block text-sm font-medium text-gray-700 mb-2"
      >
        GitHub Repository URL
      </label>

      <div className="relative">
        {/* Left-aligned GitHub icon inside the input */}
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Github className="h-5 w-5 text-gray-400" />
        </div>

        {/* Main input element for the repository URL */}
        <input
          id="repo-url"
          type="url"
          value={value}
          onChange={handleChange}
          disabled={disabled}
          placeholder="https://github.com/username/repository"
          className={`
            input pl-10 pr-4
            ${
              showValidation
                ? "border-red-300 focus-visible:ring-red-500"
                : ""
            }
            ${
              disabled
                ? "opacity-50 cursor-not-allowed"
                : ""
            }
          `}
          aria-describedby={
            error ? "repo-url-error" : undefined
          }
        />

        {/* Right-aligned validation icon if URL format is invalid */}
        {showValidation && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <AlertCircle className="h-5 w-5 text-red-400" />
          </div>
        )}
      </div>

      {/* Inline validation message for invalid URL format */}
      {showValidation && (
        <p className="mt-2 text-sm text-red-600 flex items-center">
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          Please enter a valid GitHub repository URL
        </p>
      )}

      {/* Inline error message from parent component logic */}
      {error && (
        <p
          id="repo-url-error"
          className="mt-2 text-sm text-red-600 flex items-center"
        >
          <AlertCircle className="h-4 w-4 mr-1 flex-shrink-0" />
          {error}
        </p>
      )}

      {/* Helper text shown when no errors are present */}
      {!showValidation && !error && (
        <p className="mt-2 text-sm text-gray-500">
          Enter the URL of any public GitHub repository to
          analyze
        </p>
      )}

      {/* Clickable example repository shortcuts */}
      <div className="mt-4">
        <p className="text-xs text-gray-500 mb-2">
          Try these examples:
        </p>
        <div className="flex flex-wrap gap-2">
          {[
            "https://github.com/facebook/react",
            "https://github.com/vercel/next.js",
            "https://github.com/microsoft/vscode",
          ].map((example) => (
            <button
              key={example}
              onClick={() => onChange(example)}
              disabled={disabled}
              className="text-xs text-primary-600 hover:text-primary-700 hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {/* Display only "owner/repo" instead of full URL */}
              {example.replace("https://github.com/", "")}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
