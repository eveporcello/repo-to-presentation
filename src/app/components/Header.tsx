/**
 * @file Header.tsx
 * @description
 * Top-level header/navigation bar for the Repo to Runway application.
 *
 * This component is a stateless function component that renders:
 * - Application branding (title + optional logo/identifier)
 * - A primary navigation link to the creator’s website
 *
 * It is intended to be displayed on every page as part of the global layout.
 * Styling is implemented with Tailwind CSS utility classes, and
 * icons are provided by the `lucide-react` icon set.
 *
 * @remarks
 * - This header uses a fixed max width (`max-w-7xl`) and responsive horizontal padding.
 * - Navigation links open in a new tab (`target="_blank"`) with `rel="noopener noreferrer"` for security.
 * - To add more nav links, extend the `<nav>` section with additional `<a>` tags or extracted components.
 */

import { ExternalLink } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-primary-600">
              <span className="text-xl font-bold text-gray-900">
                Repo Presenter
              </span>
            </div>
          </div>

          <nav className="flex items-center space-x-6">
            <a
              href="https://moonhighway.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-600 hover:text-gray-900 text-sm font-medium flex items-center space-x-1"
            >
              <span>By Eve Porcello</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
