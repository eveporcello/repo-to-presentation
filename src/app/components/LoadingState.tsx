/**
 * @file LoadingState.tsx
 * @description
 * Full-screen overlay displayed while the application is generating
 * a presentation. Uses a semi-transparent backdrop to obscure the
 * page and a centered modal with a spinning icon for visual feedback.

 *
 * @remarks
 * - The overlay uses `fixed` positioning and covers the entire viewport (`inset-0`).
 * - Tailwind `z-50` ensures it sits above other elements, including modals.
 * - The spinner is provided by the `Sparkles` icon from `lucide-react` and animated with `animate-spin`.
 * - Accessibility consideration: This component does not yet include `role="alert"` or ARIA attributes; consider adding for screen reader support.
 */

import { Sparkles } from "lucide-react";

export function LoadingState() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full mx-4">
        {/* Icon + Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Sparkles className="h-8 w-8 text-primary-600 animate-spin" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            Generating Your Presentation
          </h3>
          <p className="text-gray-600 text-sm mt-2">
            Claude is analyzing your repository and creating
            your presentation guide...
          </p>
        </div>
        {/* Timing note */}
        <div className="mt-6">
          <p className="text-xs text-gray-500 text-center mt-2">
            This usually takes 30-60 seconds
          </p>
        </div>
      </div>
    </div>
  );
}
