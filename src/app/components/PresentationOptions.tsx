/**
 * @file PresentationOptions.tsx
 * @description
 * Configurator UI for presentation generation.
 *
 * Allows the user to:
 * - Select a target audience (affects content tone & depth)
 * - Choose a time constraint (affects length & level of detail)
 * - Toggle optional features (e.g., Q&A preparation)
 *
 * Typically rendered as part of a larger form or wizard that
 * eventually sends a {@link PresentationConfig} to the API.
 *
 * @component
 * @example
 * ```tsx
 * <PresentationOptions
 *   config={config}
 *   onChange={setConfig}
 *   disabled={isLoading}
 * />
 * ```
 *
 * @remarks
 * - Options are drawn from local arrays `audienceOptions` and `timeOptions`.
 * - Tailwind classes provide both the active state (ring, border, bg) and
 *   disabled state (opacity, cursor).
 * - This component is purely presentational; business logic lives in its parent.
 */

import { Users, Clock, MessageCircle } from "lucide-react";
import type {
  PresentationConfig,
  AudienceType,
  TimeConstraint,
} from "@/app/page";

interface PresentationOptionsProps {
  /** Current presentation configuration values. */
  config: PresentationConfig;
  /** Callback invoked with a merged configuration when any option changes. */
  onChange: (config: PresentationConfig) => void;
  /** If true, disables all interactive controls. */
  disabled?: boolean;
}

/** Predefined audience types with user-facing labels and descriptions. */
const audienceOptions: Array<{
  value: AudienceType;
  label: string;
  description: string;
}> = [
  {
    value: "conference",
    label: "Conference Talk",
    description:
      "Technical presentation for developer audience",
  },
  {
    value: "internal",
    label: "Internal Demo",
    description:
      "Team demonstration or standup presentation",
  },
  {
    value: "client",
    label: "Client Presentation",
    description: "Business-focused demo for stakeholders",
  },
  {
    value: "interview",
    label: "Technical Interview",
    description: "Code walkthrough for job interviews",
  },
  {
    value: "workshop",
    label: "Workshop",
    description:
      "Hands-on learning session with interactive components",
  },
];

/** Predefined time constraints with human-readable labels. */
const timeOptions: Array<{
  value: TimeConstraint;
  label: string;
}> = [
  { value: "5min", label: "5 minutes" },
  { value: "15min", label: "15 minutes" },
  { value: "30min", label: "30 minutes" },
  { value: "1hour", label: "1 hour" },
];

/**
 * Renders a form-like set of controls for selecting presentation parameters.
 *
 * @param props - {@link PresentationOptionsProps}
 * @returns {JSX.Element} The rendered options UI.
 */

export function PresentationOptions({
  config,
  onChange,
  disabled,
}: PresentationOptionsProps) {
  const updateConfig = (
    updates: Partial<PresentationConfig>
  ) => {
    onChange({ ...config, ...updates });
  };

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center">
        <Users className="h-5 w-5 mr-2 text-primary-600" />
        Presentation Configuration
      </h3>

      {/* Audience Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Target Audience
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {audienceOptions.map((option) => (
            <label
              key={option.value}
              className={`
                relative cursor-pointer rounded-lg border p-4 focus:outline-none
                ${
                  config.audience === option.value
                    ? "border-primary-600 ring-2 ring-primary-600 bg-primary-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
            >
              <input
                type="radio"
                name="audience"
                value={option.value}
                checked={config.audience === option.value}
                onChange={(e) =>
                  updateConfig({
                    audience: e.target
                      .value as AudienceType,
                  })
                }
                disabled={disabled}
                className="sr-only"
              />
              <div>
                <div className="text-sm font-medium text-gray-900">
                  {option.label}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {option.description}
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Time Constraint */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center">
          <Clock className="h-4 w-4 mr-2" />
          Time Constraint
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {timeOptions.map((option) => (
            <label
              key={option.value}
              className={`
                relative cursor-pointer rounded-lg border p-3 text-center focus:outline-none
                ${
                  config.timeConstraint === option.value
                    ? "border-primary-600 ring-2 ring-primary-600 bg-primary-50"
                    : "border-gray-300 bg-white hover:border-gray-400"
                }
                ${
                  disabled
                    ? "opacity-50 cursor-not-allowed"
                    : ""
                }
              `}
            >
              <input
                type="radio"
                name="timeConstraint"
                value={option.value}
                checked={
                  config.timeConstraint === option.value
                }
                onChange={(e) =>
                  updateConfig({
                    timeConstraint: e.target
                      .value as TimeConstraint,
                  })
                }
                disabled={disabled}
                className="sr-only"
              />
              <div className="text-sm font-medium text-gray-900">
                {option.label}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Additional Options */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Additional Options
        </label>
        <div className="space-y-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={config.includeQA}
              onChange={(e) =>
                updateConfig({
                  includeQA: e.target.checked,
                })
              }
              disabled={disabled}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <MessageCircle className="h-4 w-4 ml-3 mr-2 text-gray-400" />
            <span className="text-sm text-gray-700">
              Include Q&A preparation
            </span>
          </label>
        </div>
      </div>
    </div>
  );
}
