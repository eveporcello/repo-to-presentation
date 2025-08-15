import { ExternalLink } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 text-primary-600">
              <span className="text-xl font-bold text-gray-900">
                Pitch My Repo
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
