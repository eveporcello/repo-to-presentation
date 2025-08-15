/**
 * @file page.tsx
 * @description
 * Main application page for the "Repo Presenter" tool. This component provides
 * the complete UI and state management for turning a GitHub repository into a
 * structured presentation run-of-show.
 *
 * @remarks
 * - Integrates core UI components: `Header`, `RepoInput`, `PresentationOptions`,
 *   `RunOfShowDisplay`, and `LoadingState`.
 * - Manages state for repository URL, presentation configuration, generated run-of-show
 *   data, and API call status.
 * - Handles user input, validates repository URL format, and triggers the backend
 *   API (`/api/generate-runofshow`) to produce presentation content.
 * - Implements loading indicators, error messaging, and reset functionality.
 * - Responsive design with Tailwind utility classes, including animated transitions
 *   for a polished UX.
 * - Accessibility consideration: Form controls and interactive elements use semantic
 *   HTML and proper `disabled` states but could be enhanced with ARIA roles for
 *   dynamic feedback.
 */

"use client";

import { useState, useCallback } from "react";
import {
  Github,
  Presentation,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { Header } from "@/app/components/Header";
import { RepoInput } from "@/app/components/RepoInput";
import { PresentationOptions } from "@/app/components/PresentationOptions";
import { RunOfShowDisplay } from "@/app/components/RunOfShowDisplay";
import { LoadingState } from "@/app/components/LoadingState";

export type AudienceType =
  | "conference"
  | "internal"
  | "client"
  | "interview"
  | "workshop";
export type TimeConstraint =
  | "5min"
  | "15min"
  | "30min"
  | "1hour";

export interface PresentationConfig {
  audience: AudienceType;
  timeConstraint: TimeConstraint;
  includeQA: boolean;
  includeLiveDemo: boolean;
}

export interface RunOfShow {
  title: string;
  overview: string;
  sections: Array<{
    title: string;
    duration: string;
    content: string;
    presenterNotes: string[];
    keyPoints: string[];
  }>;
  qaPredictions?: string[];
  techQuestions?: string[];
  closingNotes: string;
}

interface ApiResponse {
  runOfShow: RunOfShow;
  metadata?: {
    repoName: string;
    language: string;
    stars: number;
    generatedAt: string;
    config: PresentationConfig;
  };
}

export default function HomePage() {
  const [repoUrl, setRepoUrl] = useState("");
  const [config, setConfig] = useState<PresentationConfig>({
    audience: "conference",
    timeConstraint: "15min",
    includeQA: true,
    includeLiveDemo: true,
  });
  const [runOfShow, setRunOfShow] =
    useState<RunOfShow | null>(null);
  const [metadata, setMetadata] = useState<
    ApiResponse["metadata"] | null
  >(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!repoUrl.trim()) {
      setError("Please enter a GitHub repository URL");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        "/api/generate-runofshow",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            repoUrl: repoUrl.trim(),
            config,
          }),
        }
      );

      const data: ApiResponse | { error: string } =
        await response.json();

      if (!response.ok) {
        throw new Error(
          "error" in data
            ? data.error
            : `HTTP ${response.status}: ${response.statusText}`
        );
      }

      if ("runOfShow" in data) {
        setRunOfShow(data.runOfShow);
        setMetadata(data.metadata || null);
      } else {
        throw new Error(
          "Invalid response format from server"
        );
      }
    } catch (err) {
      console.error("Error generating run of show:", err);
      const errorMessage =
        err instanceof Error
          ? err.message
          : "An unexpected error occurred";

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [repoUrl, config]);

  const handleReset = useCallback(() => {
    setRunOfShow(null);
    setMetadata(null);
    setError(null);
  }, []);

  const handleConfigChange = useCallback(
    (newConfig: PresentationConfig) => {
      setConfig(newConfig);
    },
    []
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {!runOfShow ? (
          <>
            {/* Hero Section */}
            <div className="text-center mb-12 animate-fade-in">
              <div className="flex justify-center mb-6">
                <div className="flex items-center space-x-2 text-primary-600">
                  <Github className="h-8 w-8" />
                  <Sparkles className="h-6 w-6 animate-pulse-slow" />
                  <Presentation className="h-8 w-8" />
                </div>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl md:text-6xl">
                Repo{" "}
                <span className="text-primary-600">
                  Presenter
                </span>
              </h1>
              <p className="mt-6 max-w-2xl mx-auto text-xl text-gray-600 leading-relaxed">
                Turn your GitHub repo into your best
                presentation.
              </p>
            </div>

            {/* Input Form */}
            <div className="max-w-4xl mx-auto animate-slide-up">
              <div className="card p-8">
                <RepoInput
                  value={repoUrl}
                  onChange={setRepoUrl}
                  error={error}
                  disabled={isLoading}
                />

                <div className="mt-8">
                  <PresentationOptions
                    config={config}
                    onChange={handleConfigChange}
                    disabled={isLoading}
                  />
                </div>

                <div className="mt-8 flex justify-center">
                  <button
                    onClick={handleGenerate}
                    disabled={isLoading || !repoUrl.trim()}
                    className="btn-primary px-8 py-3 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="animate-spin -ml-1 mr-3 h-5 w-5" />
                        Generating Presentation...
                      </>
                    ) : (
                      <>
                        <Sparkles className="-ml-1 mr-3 h-5 w-5" />
                        Generate Run of Show
                      </>
                    )}
                  </button>
                </div>

                {/* Error Display */}
                {error && !isLoading && (
                  <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg animate-slide-up">
                    <div className="flex items-start">
                      <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="text-sm font-medium text-red-800">
                          Generation Failed
                        </h3>
                        <p className="text-sm text-red-700 mt-1">
                          {error}
                        </p>
                        <button
                          onClick={() => setError(null)}
                          className="text-sm text-red-600 hover:text-red-500 mt-2 underline"
                        >
                          Try again
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {isLoading && <LoadingState />}
          </>
        ) : (
          <RunOfShowDisplay
            runOfShow={runOfShow}
            repoUrl={repoUrl}
            config={config}
            metadata={metadata}
            onReset={handleReset}
          />
        )}
      </main>
    </div>
  );
}
