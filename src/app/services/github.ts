/**
 * @file GitHubAnalyzer.ts
 * @description
 * Utility class and interfaces for analyzing GitHub repositories using the GitHub REST API.
 * Handles authentication, metadata retrieval, README/config file parsing, and key file analysis.
 *
 * @remarks
 * - Uses `@octokit/rest` to interact with the GitHub API.
 * - Authenticates requests via a Personal Access Token (PAT) from `process.env.GITHUB_TOKEN`.
 * - Supports fetching repository metadata, topics, README content, package/config files,
 *   and identifying key project files.
 * - Includes error handling for 404 (not found) and 403 (forbidden / rate-limited) responses.
 * - Limits size of fetched content to prevent excessive API usage and memory consumption.
 */

import { Octokit } from "@octokit/rest";

// Initialize Octokit client with authentication from environment variable.
// If `GITHUB_TOKEN` is not set, requests will be unauthenticated with stricter rate limits.
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Structured result of repository analysis
export interface RepoAnalysis {
  name: string;
  description: string;
  language: string;
  topics: string[];
  readme: string;
  packageJson?: any;
  fileStructure: string[];
  keyFiles: Array<{
    path: string;
    content: string;
    type: string;
  }>;
  stats: {
    stars: number;
    forks: number;
    size: number;
  };
}

export class GitHubAnalyzer {
  // Common README filename variants to search for
  private static readonly README_FILES = [
    "README.md",
    "readme.md",
    "README.rst",
    "README.txt",
    "README",
  ];

  // Common configuration/manifest files to search for
  private static readonly CONFIG_FILES = [
    "package.json",
    "pyproject.toml",
    "Cargo.toml",
    "go.mod",
    "pom.xml",
  ];

  // Limits to prevent excessive data retrieval
  private static readonly MAX_FILE_SIZE = 50000;
  private static readonly MAX_CONTENT_SIZE = 3000;
  private static readonly MAX_README_SIZE = 5000;

  /**
   * Parse a GitHub repository URL into its owner and repo name.
   * Supports optional `.git` suffix and trailing path segments.
   */
  static parseRepoUrl(repoUrl: string): {
    owner: string;
    repo: string;
  } {
    const githubUrlRegex =
      /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/.*)?$/;
    const match = repoUrl.match(githubUrlRegex);

    if (!match) {
      throw new Error(
        "Invalid GitHub URL format. Please provide a valid GitHub repository URL."
      );
    }

    const [, owner, repo] = match;
    return { owner, repo: repo.replace(/\.git$/, "") };
  }

  /**
   * Determine if a filename matches common "key" file patterns.
   */
  static isKeyFile(filename: string): boolean {
    const keyPatterns = [
      /^(index|main|app|server)\.(js|ts|jsx|tsx|py|go|rs|java)$/i,
      /\.(config|conf)\.(js|ts|json|yaml|yml|toml)$/i,
      /^(dockerfile|makefile|rakefile)$/i,
      /^(changelog|contributing|license|authors|contributors)\.(md|txt|rst)$/i,
      /^(package\.json|requirements\.txt|go\.mod|cargo\.toml|gemfile|composer\.json)$/i,
    ];

    return keyPatterns.some((pattern) =>
      pattern.test(filename)
    );
  }

  /**
   * Map file extensions to human-readable type names.
   */
  static getFileType(filename: string): string {
    const ext = filename.split(".").pop()?.toLowerCase();
    const typeMap: Record<string, string> = {
      js: "JavaScript",
      ts: "TypeScript",
      jsx: "React",
      tsx: "React TypeScript",
      py: "Python",
      json: "Configuration",
      md: "Documentation",
      // ... rest of your mappings
    };
    return typeMap[ext || ""] || "Other";
  }

  /**
   * Orchestrate full repository analysis:
   * - Fetch metadata
   * - Fetch README
   * - Fetch configuration file(s)
   * - Analyze file structure & collect key files
   */
  async analyzeRepository(
    repoUrl: string
  ): Promise<RepoAnalysis> {
    const { owner, repo } =
      GitHubAnalyzer.parseRepoUrl(repoUrl);

    try {
      const repoData = await this.fetchRepositoryData(
        owner,
        repo
      );
      const readme = await this.fetchReadme(owner, repo);
      const packageJson = await this.fetchConfigFile(
        owner,
        repo
      );
      const { fileStructure, keyFiles } =
        await this.analyzeFileStructure(owner, repo);

      return {
        name: repoData.name,
        description: repoData.description || "",
        language: repoData.language || "Unknown",
        topics: repoData.topics || [],
        readme: readme.slice(
          0,
          GitHubAnalyzer.MAX_README_SIZE
        ),
        packageJson,
        fileStructure,
        keyFiles,
        stats: {
          stars: repoData.stargazers_count,
          forks: repoData.forks_count,
          size: repoData.size,
        },
      };
    } catch (error) {
      console.error("Error analyzing repository:", error);
      throw error instanceof Error
        ? error
        : new Error("Failed to analyze repository");
    }
  }

  /**
   * Fetch repository metadata (name, description, language, topics, stats).
   * Throws descriptive errors for common HTTP error codes.
   */
  private async fetchRepositoryData(
    owner: string,
    repo: string
  ) {
    const { data } = await octokit.repos
      .get({ owner, repo })
      .catch((error) => {
        if (error.status === 404) {
          throw new Error(
            "Repository not found. Please check that the repository exists and is public."
          );
        }
        if (error.status === 403) {
          throw new Error(
            "Access forbidden. The repository may be private or you may have hit rate limits."
          );
        }
        throw new Error(
          `Failed to access repository: ${error.message}`
        );
      });
    return data;
  }

  /**
   * Attempt to retrieve README content from common filename variants.
   * Returns an empty string if no README is found.
   */
  private async fetchReadme(
    owner: string,
    repo: string
  ): Promise<string> {
    for (const readmeFile of GitHubAnalyzer.README_FILES) {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: readmeFile,
        });
        if ("content" in data) {
          return Buffer.from(
            data.content,
            "base64"
          ).toString("utf-8");
        }
      } catch {
        continue;
      }
    }
    return "";
  }

  /**
   * Attempt to retrieve a primary configuration/manifest file.
   * Returns parsed JSON for package.json, otherwise raw content with type metadata.
   */
  private async fetchConfigFile(
    owner: string,
    repo: string
  ) {
    for (const configFile of GitHubAnalyzer.CONFIG_FILES) {
      try {
        const { data } = await octokit.repos.getContent({
          owner,
          repo,
          path: configFile,
        });
        if ("content" in data) {
          const content = Buffer.from(
            data.content,
            "base64"
          ).toString("utf-8");
          return configFile === "package.json"
            ? JSON.parse(content)
            : { type: configFile, content };
        }
      } catch {
        continue;
      }
    }
    return null;
  }

  /**
   * Retrieve repository root contents, list file structure, and fetch key files.
   * Limits the number of items analyzed to prevent excessive API usage.
   */
  private async analyzeFileStructure(
    owner: string,
    repo: string
  ) {
    const { data: contents } =
      await octokit.repos.getContent({
        owner,
        repo,
        path: "",
      });

    const fileStructure: string[] = [];
    const keyFiles: Array<{
      path: string;
      content: string;
      type: string;
    }> = [];

    if (!Array.isArray(contents))
      return { fileStructure, keyFiles };

    // Sort directories before files, alphabetically, and limit to 30 entries
    const sortedContents = contents
      .sort((a, b) => {
        if (a.type !== b.type)
          return a.type === "dir" ? -1 : 1;
        return a.name.localeCompare(b.name);
      })
      .slice(0, 30);

    for (const item of sortedContents) {
      fileStructure.push(
        `${item.type}: ${item.name}${
          item.type === "dir" ? "/" : ""
        }`
      );

      // Only retrieve small-enough key files
      if (
        item.type === "file" &&
        GitHubAnalyzer.isKeyFile(item.name) &&
        item.size &&
        item.size < GitHubAnalyzer.MAX_FILE_SIZE &&
        item.size > 0
      ) {
        try {
          const { data: fileData } =
            await octokit.repos.getContent({
              owner,
              repo,
              path: item.name,
            });
          if ("content" in fileData) {
            const content = Buffer.from(
              fileData.content,
              "base64"
            ).toString("utf-8");
            keyFiles.push({
              path: item.name,
              content: content.slice(
                0,
                GitHubAnalyzer.MAX_CONTENT_SIZE
              ),
              type: GitHubAnalyzer.getFileType(item.name),
            });
          }
        } catch (error) {
          console.warn(
            `Failed to retrieve ${item.name}:`,
            error
          );
        }
      }
    }

    return { fileStructure, keyFiles };
  }
}
