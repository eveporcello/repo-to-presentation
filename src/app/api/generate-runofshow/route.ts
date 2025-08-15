import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { GitHubAnalyzer } from "../../services/github";
import { PromptGenerator } from "../../services/prompts";
import type { PresentationConfig } from "@/app/page";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const analyzer = new GitHubAnalyzer();

export async function POST(request: NextRequest) {
  try {
    const { repoUrl, config } = await validateRequest(
      request
    );

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

async function validateRequest(request: NextRequest) {
  const body = await request.json().catch(() => {
    throw new ValidationError(
      "Invalid JSON in request body"
    );
  });

  const { repoUrl, config } = body;

  if (!repoUrl || typeof repoUrl !== "string") {
    throw new ValidationError(
      "Repository URL is required and must be a string"
    );
  }

  if (!config || typeof config !== "object") {
    throw new ValidationError(
      "Presentation configuration is required"
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "Server configuration error. Please check API key setup."
    );
  }

  return { repoUrl, config: config as PresentationConfig };
}

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
  } catch (parseError) {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(
      "Failed to generate properly formatted presentation content"
    );
  }
}

class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ValidationError";
  }
}

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
