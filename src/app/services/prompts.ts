import type { RepoAnalysis } from "./github";
import type { PresentationConfig } from "@/app/page";

export class PromptGenerator {
  private static readonly AUDIENCE_CONTEXT = {
    conference:
      "developer conference with technical audience expecting innovative solutions, best practices, and cutting-edge approaches",
    internal:
      "team demonstration focusing on implementation details, architectural decisions, and collaboration benefits",
    client:
      "business stakeholder presentation emphasizing value proposition, practical outcomes, and ROI",
    interview:
      "technical interview showcasing problem-solving approach, code quality, and engineering thinking",
    workshop:
      "hands-on learning session with interactive components, practical exercises, and audience participation",
  } as const;

  private static readonly TIME_GUIDANCE = {
    "5min":
      "Lightning talk - hit only the most impressive highlights and key innovations",
    "15min":
      "Balanced overview with key technical details and compelling demonstrations",
    "30min":
      "Comprehensive walkthrough with deep dives into interesting technical sections",
    "1hour":
      "Detailed exploration with multiple examples, architecture deep-dives, hands-on exercises, and extensive Q&A preparation",
  } as const;

  private static readonly FOCUS_AREAS = {
    conference:
      "technical innovation, architecture decisions, performance optimizations, unique solutions",
    internal:
      "implementation approach, team collaboration, development workflow, technical debt solutions",
    client:
      "business value, user impact, scalability, reliability, time-to-market benefits",
    interview:
      "problem-solving process, code quality, testing approach, scalability considerations",
    workshop:
      "practical application, hands-on exercises, interactive demonstrations, learning objectives",
  } as const;

  static generate(
    repoAnalysis: RepoAnalysis,
    config: PresentationConfig
  ): string {
    const sections = [
      this.buildRepoAnalysisSection(repoAnalysis),
      this.buildRequirementsSection(config),
      this.buildStorytellingSection(),
      this.buildInstructionsSection(config),
      this.buildOutputFormatSection(config),
    ];

    return [
      this.buildSystemPrompt(config),
      ...sections,
    ].join("\n\n");
  }

  private static buildSystemPrompt(
    config: PresentationConfig
  ): string {
    return `You are an expert presentation coach specializing in technical demos and developer advocacy. Create a compelling, well-structured run-of-show for presenting this GitHub repository to ${
      this.AUDIENCE_CONTEXT[config.audience]
    }.`;
  }

  private static buildRepoAnalysisSection(
    repoAnalysis: RepoAnalysis
  ): string {
    return `REPOSITORY ANALYSIS:
- Name: ${repoAnalysis.name}
- Description: ${repoAnalysis.description}
- Primary Language: ${repoAnalysis.language}
- Topics/Tags: ${repoAnalysis.topics.join(", ")}
- Repository Stats: ${repoAnalysis.stats.stars} stars, ${
      repoAnalysis.stats.forks
    } forks
- Size: ${repoAnalysis.stats.size}KB

README CONTENT:
${repoAnalysis.readme}

REPOSITORY STRUCTURE:
${repoAnalysis.fileStructure.join("\n")}

KEY FILES ANALYZED:
${repoAnalysis.keyFiles
  .map((f) => `${f.path} (${f.type}):\n${f.content}`)
  .join("\n\n")}

${
  repoAnalysis.packageJson
    ? `CONFIGURATION/DEPENDENCIES:\n${JSON.stringify(
        repoAnalysis.packageJson,
        null,
        2
      ).slice(0, 1000)}`
    : ""
}`;
  }

  private static buildRequirementsSection(
    config: PresentationConfig
  ): string {
    return `PRESENTATION REQUIREMENTS:
- Target Duration: ${config.timeConstraint}
- Time Guidance: ${
      this.TIME_GUIDANCE[config.timeConstraint]
    }
- Focus Areas: ${this.FOCUS_AREAS[config.audience]}
- Include Q&A Preparation: ${config.includeQA}
- Include Live Demo Suggestions: ${config.includeLiveDemo}`;
  }

  private static buildStorytellingSection(): string {
    return `STORYTELLING FRAMEWORK:
Create a narrative arc that follows this structure:
1. Hook: What problem does this solve that developers care about?
2. Context: Why is this solution needed/better than alternatives?
3. Journey: Walk through the most impressive technical decisions
4. Impact: What makes this worth paying attention to?
5. Call-to-action: What should the audience do next?`;
  }

  private static buildInstructionsSection(
    config: PresentationConfig
  ): string {
    const baseInstructions = `SPECIFIC INSTRUCTIONS:
- Identify the 2-3 most technically impressive aspects of this codebase
- Create smooth transitions between sections that maintain engagement
- Include specific file/code references where appropriate
- Balance technical depth with accessibility for the target audience
- Suggest timing for dramatic pauses, code reveals, or demo moments
- Anticipate skeptical questions and prepare confident responses`;

    const workshopAddition =
      config.audience === "workshop"
        ? "\n- Include hands-on exercises and interactive elements appropriate for the timeframe"
        : "";

    return baseInstructions + workshopAddition;
  }

  private static buildOutputFormatSection(
    config: PresentationConfig
  ): string {
    const qaSection = config.includeQA
      ? `
  "qaPredictions": [
    "Most likely audience question based on complexity",
    "Common skeptical question about approach", 
    "Implementation detail question"
  ],
  "techQuestions": [
    "Deep technical question for advanced audience",
    "Architecture decision rationale question",
    "Scalability/performance question"
  ],`
      : "";

    return `Return a JSON object with this exact structure (ensure valid JSON syntax):
{
  "title": "Compelling presentation title that captures the core innovation",
  "overview": "2-3 sentence overview that hooks the audience and sets expectations",
  "sections": [
    {
      "title": "Section name that clearly indicates what will be covered",
      "duration": "X minutes",
      "content": "Detailed description of what to present in this section, including specific talking points and technical highlights",
      "presenterNotes": [
        "Specific timing notes and pacing guidance",
        "Key emphasis points and moments to pause",
        "Transition cues and setup for next section",
        "Backup explanations for complex concepts"
      ],
      "keyPoints": [
        "Primary takeaway for audience",
        "Technical highlight to emphasize", 
        "Business/practical value point"
      ]
    }
  ],${qaSection}
  "closingNotes": "Strategic advice for ending strong, including call-to-action and memorable final thought"
}

CRITICAL: Make this presentation authentic to the actual codebase analyzed, not generic. Reference specific files, architectural decisions, and technical approaches found in the repository. Create a story that makes developers think "I need to check this out" or "I want to try this approach."`;
  }
}
