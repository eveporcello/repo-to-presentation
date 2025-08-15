/**
 * API Route: Generate a presentation "run of show" from a GitHub repo.
 *
 * ## Purpose
 * Turns a GitHub repository URL plus presentation preferences into a structured,
 * speaker‑ready outline by prompting Claude, then returning validated JSON.
 *
 * ## Responsibilities
 * - Validate input (shape, types, and required fields)
 * - Analyze the repository (language, stats, basic structure)
 * - Generate a prompt from the analysis + user config
 * - Call Claude and parse the response into a well‑formed object
 * - Return helpful error messages with appropriate HTTP status codes
 *
 * ## Inputs
 * - POST JSON body: { repoUrl: string; config: PresentationConfig }
 * - Environment: ANTHROPIC_API_KEY (server‑side only)
 *
 * ## Outputs
 * - 200 OK: { runOfShow, metadata } where runOfShow is presentation content
 * - 4xx/5xx with { error } on failure
 *
 * ## Security
 * - Never echo secrets. Requires ANTHROPIC_API_KEY present at runtime.
 * - Accepts only HTTPS GitHub URLs; reject non‑string/empty values.
 * - This endpoint does not write to GitHub or your repo; analysis is read‑only.
 *
 * ## Observability
 * - Server logs prefix: "API Error:" for unexpected failures.
 * - Client should surface returned messages; avoid leaking stack traces.
 */

import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GitHubAnalyzer } from "../../services/github";
import { PromptGenerator } from "../../services/prompts";
import type { PresentationConfig } from "@/app/page";

/**
 * Claude client (server-side). Requires `process.env.ANTHROPIC_API_KEY`.
 * @remarks The key must be injected at deploy time; never ship it to the client.
 */
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

/** Performs read-only GitHub repository inspection. */
const analyzer = new GitHubAnalyzer();

/**
 * Expected POST body for this route.
 * @public
 */
interface ApiRequestBody {
  /** HTTPS GitHub URL, e.g. "https://github.com/vercel/next.js" */
  repoUrl: string;
  /** Presentation preferences that tailor the prompt and output. */
  config: PresentationConfig;
}

/**
 * POST /api/generate-runofshow
 *
 * Validates input, analyzes the repo, prompts Claude, and returns structured
 * presentation content plus useful metadata.
 *
 * @param request - Next.js Request containing {@link ApiRequestBody}
 * @returns JSON with `{ runOfShow, metadata }` on success.
 *
 * @example
 * fetch('/api/generate-runofshow', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     repoUrl: 'https://github.com/facebook/react',
 *     config: {
 *       audience: 'conference',
 *       timeConstraint: '15min',
 *       includeQA: true,
 *       includeLiveDemo: true
 *     }
 *   })
 * })
 *
 * @throws {ValidationError} When the request body is malformed or missing fields.
 * @throws {Error} When Anthropic API or parsing fails (returned as 500).
 */
export async function POST(request: NextRequest) {
  try {
    const { repoUrl, config } =
      await validateRequest<ApiRequestBody>(request);

    const repoAnalysis = await analyzer.analyzeRepository(
      repoUrl.trim()
    );

    const prompt = PromptGenerator.generate(
      repoAnalysis,
      config
    );

    const runOfShow = await generatePresentation(prompt);

    return NextResponse.json({
      runOfShow,
      metadata: {
        repoName: repoAnalysis.name,
        language: repoAnalysis.language,
        stars: repoAnalysis.stats.stars,
        generatedAt: new Date().toISOString(),
        config,
      },
    });
  } catch (error) {
    // Keep logs terse and non-sensitive. Clients see a friendly message below.
    console.error("API Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
      },
      {
        status:
          error instanceof ValidationError ? 400 : 500,
      }
    );
  }
}

/**
 * Validates and narrows the incoming request to the expected body shape.
 *
 * @typeParam T - The expected body type (defaults to `unknown` at call site).
 * @param request - Next.js Request whose body will be parsed as JSON.
 * @returns The parsed and validated body cast to {@link T}.
 *
 * @remarks
 * - Performs minimal structural validation here to keep runtime overhead low.
 *   Consider a schema validator (e.g., Zod) if the shape evolves.
 */
async function validateRequest<T = unknown>(
  request: NextRequest
) {
  const body = (await request.json().catch(() => {
    throw new ValidationError(
      "Invalid JSON in request body"
    );
  })) as Partial<ApiRequestBody>;

  const { repoUrl, config } = body;

  if (!repoUrl || typeof repoUrl !== "string") {
    throw new ValidationError(
      "Repository URL is required and must be a string"
    );
  }

  // Lightweight GitHub URL sanity check (avoid fetching here).
  if (
    !/^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/.test(
      repoUrl
    )
  ) {
    throw new ValidationError(
      "Repository URL must be a valid GitHub URL"
    );
  }

  if (!config || typeof config !== "object") {
    throw new ValidationError(
      "Presentation configuration is required"
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    // Treat missing secrets as a server misconfiguration, not user error.
    throw new Error(
      "Server configuration error. Please check API key setup."
    );
  }

  return {
    repoUrl,
    config: config as PresentationConfig,
  } as unknown as T;
}

/**
 * Calls Claude to generate presentation content from a prepared prompt.
 *
 * @param prompt - A complete, self-contained prompt string.
 * @returns Parsed presentation content ready for rendering.
 *
 * @throws {Error} If the Anthropic response is non-text or parsing fails.
 */
async function generatePresentation(prompt: string) {
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    temperature: 0.7,
    messages: [{ role: "user", content: prompt }],
  });

  const content = response.content[0];
  if (content.type !== "text") {
    throw new Error("Unexpected response type from Claude");
  }

  return parseClaudeResponse(content.text);
}

/**
 * Parses Claude's response into a strongly expected JSON structure.
 *
 * Accepts both fenced JSON blocks (```json ... ```) and raw JSON strings.
 * Performs basic shape validation for the expected fields.
 *
 * @param text - Raw text returned by Claude.
 * @returns A normalized object containing `title`, `overview`, and `sections`.
 * @throws {Error} When no valid JSON object can be extracted.
 */
function parseClaudeResponse(text: string) {
  try {
    const cleanedText = text
      .replace(/```json\n?/g, "")
      .replace(/```\n?/g, "")
      .trim();

    const parsed = JSON.parse(cleanedText);

    if (
      !parsed.title ||
      !parsed.overview ||
      !Array.isArray(parsed.sections)
    ) {
      throw new Error("Invalid response structure from AI");
    }

    return parsed;
  } catch {
    // Fallback: try to extract the first JSON object in the string.
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(
      "Failed to generate properly formatted presentation content"
    );
  }
}

/**
 * Minimal typed error for request validation failures.
 * @public
 */
class ValidationError extends Error {
  /** @param message - Human-readable reason for the validation failure. */
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

/**
 * OPTIONS /api/generate-runofshow
 * CORS preflight handler.
 *
 * @returns 200 OK with permissive CORS headers suitable for simple POST from the app.
 */
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
