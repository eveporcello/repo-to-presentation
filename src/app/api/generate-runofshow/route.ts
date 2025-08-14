import { NextRequest, NextResponse } from 'next/server'
import { Octokit } from '@octokit/rest'
import Anthropic from '@anthropic-ai/sdk'
import type { PresentationConfig } from '@/app/page'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Initialize GitHub client with optional auth
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
})

interface RepoAnalysis {
  name: string
  description: string
  language: string
  topics: string[]
  readme: string
  packageJson?: any
  fileStructure: string[]
  keyFiles: Array<{
    path: string
    content: string
    type: string
  }>
  stats: {
    stars: number
    forks: number
    size: number
  }
}

function isKeyFile(filename: string): boolean {
  const keyPatterns = [
    // Entry points
    /^(index|main|app|server)\.(js|ts|jsx|tsx|py|go|rs|java)$/i,
    // Config files
    /\.(config|conf)\.(js|ts|json|yaml|yml|toml)$/i,
    // Important files
    /^(dockerfile|makefile|rakefile)$/i,
    // Documentation
    /^(changelog|contributing|license|authors|contributors)\.(md|txt|rst)$/i,
    // Package managers
    /^(package\.json|requirements\.txt|go\.mod|cargo\.toml|gemfile|composer\.json)$/i,
  ]
  
  return keyPatterns.some(pattern => pattern.test(filename))
}

function getFileType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase()
  const typeMap: Record<string, string> = {
    'js': 'JavaScript',
    'ts': 'TypeScript',
    'jsx': 'React',
    'tsx': 'React TypeScript',
    'py': 'Python',
    'go': 'Go',
    'rs': 'Rust',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'cs': 'C#',
    'php': 'PHP',
    'rb': 'Ruby',
    'swift': 'Swift',
    'kt': 'Kotlin',
    'json': 'Configuration',
    'yaml': 'Configuration',
    'yml': 'Configuration',
    'toml': 'Configuration',
    'html': 'HTML',
    'css': 'Stylesheet',
    'scss': 'Sass',
    'less': 'Less',
    'md': 'Documentation',
    'rst': 'Documentation',
    'txt': 'Documentation'
  }
  return typeMap[ext || ''] || 'Other'
}

async function analyzeRepository(repoUrl: string): Promise<RepoAnalysis> {
  // Extract owner and repo from URL with better error handling
  const githubUrlRegex = /github\.com\/([^\/]+)\/([^\/]+)(?:\.git)?(?:\/.*)?$/
  const match = repoUrl.match(githubUrlRegex)
  
  if (!match) {
    throw new Error('Invalid GitHub URL format. Please provide a valid GitHub repository URL.')
  }

  const [, owner, repo] = match
  const repoName = repo.replace(/\.git$/, '')

  try {
    // Get repository information with enhanced error handling
    const { data: repoData } = await octokit.repos.get({
      owner,
      repo: repoName,
    }).catch((error) => {
      if (error.status === 404) {
        throw new Error('Repository not found. Please check that the repository exists and is public.')
      }
      if (error.status === 403) {
        throw new Error('Access forbidden. The repository may be private or you may have hit rate limits.')
      }
      throw new Error(`Failed to access repository: ${error.message}`)
    })

    // Get repository contents
    const { data: contents } = await octokit.repos.getContent({
      owner,
      repo: repoName,
      path: '',
    })

    // Get README with multiple filename attempts
    let readme = ''
    const readmeFiles = ['README.md', 'readme.md', 'README.rst', 'README.txt', 'README']
    
    for (const readmeFile of readmeFiles) {
      try {
        const { data: readmeData } = await octokit.repos.getContent({
          owner,
          repo: repoName,
          path: readmeFile,
        })
        if ('content' in readmeData) {
          readme = Buffer.from(readmeData.content, 'base64').toString('utf-8')
          break
        }
      } catch {
        // Try next README filename
        continue
      }
    }

    // Get package.json or similar config files
    let packageJson = null
    const configFiles = ['package.json', 'pyproject.toml', 'Cargo.toml', 'go.mod', 'pom.xml']
    
    for (const configFile of configFiles) {
      try {
        const { data: configData } = await octokit.repos.getContent({
          owner,
          repo: repoName,
          path: configFile,
        })
        if ('content' in configData) {
          const content = Buffer.from(configData.content, 'base64').toString('utf-8')
          if (configFile === 'package.json') {
            packageJson = JSON.parse(content)
          } else {
            packageJson = { type: configFile, content }
          }
          break
        }
      } catch {
        // Try next config file
        continue
      }
    }

    // Get file structure and key files
    const fileStructure: string[] = []
    const keyFiles: Array<{ path: string; content: string; type: string }> = []

    if (Array.isArray(contents)) {
      // Sort contents by type and name for better organization
      const sortedContents = contents
        .sort((a, b) => {
          if (a.type !== b.type) {
            return a.type === 'dir' ? -1 : 1
          }
          return a.name.localeCompare(b.name)
        })
        .slice(0, 30) // Increased limit for better analysis

      for (const item of sortedContents) {
        fileStructure.push(`${item.type}: ${item.name}${item.type === 'dir' ? '/' : ''}`)
        
        // Get content of key files with size and type filtering
        if (item.type === 'file' && 
            isKeyFile(item.name) && 
            item.size && 
            item.size < 50000 && // Increased size limit
            item.size > 0) {
          try {
            const { data: fileData } = await octokit.repos.getContent({
              owner,
              repo: repoName,
              path: item.name,
            })
            if ('content' in fileData) {
              const content = Buffer.from(fileData.content, 'base64').toString('utf-8')
              keyFiles.push({
                path: item.name,
                content: content.slice(0, 3000), // Truncate very long files
                type: getFileType(item.name)
              })
            }
          } catch (error) {
            console.warn(`Failed to retrieve ${item.name}:`, error)
            // Continue with other files
          }
        }
      }
    }

    return {
      name: repoData.name,
      description: repoData.description || '',
      language: repoData.language || 'Unknown',
      topics: repoData.topics || [],
      readme: readme.slice(0, 5000), // Truncate very long READMEs
      packageJson,
      fileStructure,
      keyFiles,
      stats: {
        stars: repoData.stargazers_count,
        forks: repoData.forks_count,
        size: repoData.size,
      }
    }
  } catch (error) {
    console.error('Error analyzing repository:', error)
    if (error instanceof Error) {
      throw error
    }
    throw new Error('Failed to analyze repository. Please try again.')
  }
}

function generatePrompt(repoAnalysis: RepoAnalysis, config: PresentationConfig): string {
  const audienceContext = {
    conference: 'developer conference with technical audience expecting innovative solutions, best practices, and cutting-edge approaches',
    internal: 'team demonstration focusing on implementation details, architectural decisions, and collaboration benefits',
    client: 'business stakeholder presentation emphasizing value proposition, practical outcomes, and ROI',
    interview: 'technical interview showcasing problem-solving approach, code quality, and engineering thinking'
  }

  const timeGuidance = {
    '5min': 'Lightning talk - hit only the most impressive highlights and key innovations',
    '15min': 'Balanced overview with key technical details and compelling demonstrations',
    '30min': 'Comprehensive walkthrough with deep dives into interesting technical sections',
    '45min+': 'Detailed exploration with multiple examples, architecture deep-dives, and extensive Q&A preparation'
  }

  const focusAreas = {
    conference: 'technical innovation, architecture decisions, performance optimizations, unique solutions',
    internal: 'implementation approach, team collaboration, development workflow, technical debt solutions',
    client: 'business value, user impact, scalability, reliability, time-to-market benefits',
    interview: 'problem-solving process, code quality, testing approach, scalability considerations'
  }

  return `You are an expert presentation coach specializing in technical demos and developer advocacy. Create a compelling, well-structured run-of-show for presenting this GitHub repository to ${audienceContext[config.audience]}.

REPOSITORY ANALYSIS:
- Name: ${repoAnalysis.name}
- Description: ${repoAnalysis.description}
- Primary Language: ${repoAnalysis.language}
- Topics/Tags: ${repoAnalysis.topics.join(', ')}
- Repository Stats: ${repoAnalysis.stats.stars} stars, ${repoAnalysis.stats.forks} forks
- Size: ${repoAnalysis.stats.size}KB

README CONTENT:
${repoAnalysis.readme}

REPOSITORY STRUCTURE:
${repoAnalysis.fileStructure.join('\n')}

KEY FILES ANALYZED:
${repoAnalysis.keyFiles.map(f => `${f.path} (${f.type}):\n${f.content}`).join('\n\n')}

${repoAnalysis.packageJson ? `CONFIGURATION/DEPENDENCIES:\n${JSON.stringify(repoAnalysis.packageJson, null, 2).slice(0, 1000)}` : ''}

PRESENTATION REQUIREMENTS:
- Target Duration: ${config.timeConstraint}
- Time Guidance: ${timeGuidance[config.timeConstraint]}
- Focus Areas: ${focusAreas[config.audience]}
- Include Q&A Preparation: ${config.includeQA}
- Include Live Demo Suggestions: ${config.includeLiveDemo}

STORYTELLING FRAMEWORK:
Create a narrative arc that follows this structure:
1. Hook: What problem does this solve that developers care about?
2. Context: Why is this solution needed/better than alternatives?
3. Journey: Walk through the most impressive technical decisions
4. Impact: What makes this worth paying attention to?
5. Call-to-action: What should the audience do next?

SPECIFIC INSTRUCTIONS:
- Identify the 2-3 most technically impressive aspects of this codebase
- Create smooth transitions between sections that maintain engagement
- Include specific file/code references where appropriate
- Balance technical depth with accessibility for the target audience
- Suggest timing for dramatic pauses, code reveals, or demo moments
- Anticipate skeptical questions and prepare confident responses

Return a JSON object with this exact structure (ensure valid JSON syntax):
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
  ],
  ${config.includeQA ? `"qaPredictions": [
    "Most likely audience question based on complexity",
    "Common skeptical question about approach",
    "Implementation detail question"
  ],
  "techQuestions": [
    "Deep technical question for advanced audience",
    "Architecture decision rationale question",
    "Scalability/performance question"
  ],` : ''}
  "closingNotes": "Strategic advice for ending strong, including call-to-action and memorable final thought"
}

CRITICAL: Make this presentation authentic to the actual codebase analyzed, not generic. Reference specific files, architectural decisions, and technical approaches found in the repository. Create a story that makes developers think "I need to check this out" or "I want to try this approach."`
}

export async function POST(request: NextRequest) {
  try {
    // Enhanced request validation
    const body = await request.json().catch(() => {
      throw new Error('Invalid JSON in request body')
    })

    const { repoUrl, config } = body

    if (!repoUrl || typeof repoUrl !== 'string') {
      return NextResponse.json(
        { error: 'Repository URL is required and must be a string' },
        { status: 400 }
      )
    }

    if (!config || typeof config !== 'object') {
      return NextResponse.json(
        { error: 'Presentation configuration is required' },
        { status: 400 }
      )
    }

    // Validate environment variables
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('ANTHROPIC_API_KEY environment variable is not set')
      return NextResponse.json(
        { error: 'Server configuration error. Please check API key setup.' },
        { status: 500 }
      )
    }

    // Analyze the repository with enhanced error handling
    let repoAnalysis: RepoAnalysis
    try {
      repoAnalysis = await analyzeRepository(repoUrl.trim())
    } catch (error) {
      console.error('Repository analysis failed:', error)
      return NextResponse.json(
        { error: error instanceof Error ? error.message : 'Failed to analyze repository' },
        { status: 400 }
      )
    }

    // Generate the run of show with Claude
    const prompt = generatePrompt(repoAnalysis, config)
    
    let response
    try {
      response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 4000,
        temperature: 0.7, // Slightly higher for more creative presentations
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    } catch (error) {
      console.error('Anthropic API error:', error)
      return NextResponse.json(
        { error: 'Failed to generate presentation content. Please try again.' },
        { status: 500 }
      )
    }

    const content = response.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response type from Claude')
    }

    // Parse the JSON response with better error handling
    let runOfShow
    try {
      // Clean up the response text to handle potential markdown formatting
      const cleanedText = content.text
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim()
      
      runOfShow = JSON.parse(cleanedText)
      
      // Validate the structure
      if (!runOfShow.title || !runOfShow.overview || !Array.isArray(runOfShow.sections)) {
        throw new Error('Invalid response structure from AI')
      }
      
    } catch (parseError) {
      console.error('Failed to parse Claude response:', content.text)
      console.error('Parse error:', parseError)
      
      // Fallback: try to extract JSON from the response
      const jsonMatch = content.text.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        try {
          runOfShow = JSON.parse(jsonMatch[0])
        } catch {
          return NextResponse.json(
            { error: 'Failed to generate properly formatted presentation content. Please try again.' },
            { status: 500 }
          )
        }
      } else {
        return NextResponse.json(
          { error: 'Failed to generate structured presentation content. Please try again.' },
          { status: 500 }
        )
      }
    }

    // Add metadata to the response
    const responseData = {
      runOfShow,
      metadata: {
        repoName: repoAnalysis.name,
        language: repoAnalysis.language,
        stars: repoAnalysis.stats.stars,
        generatedAt: new Date().toISOString(),
        config
      }
    }

    return NextResponse.json(responseData, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json',
      }
    })

  } catch (error) {
    console.error('Unexpected error in generate-runofshow:', error)
    
    // Don't expose internal errors in production
    const isDevelopment = process.env.NODE_ENV === 'development'
    const errorMessage = isDevelopment && error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred while generating the presentation'

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

// Add OPTIONS handler for CORS if needed
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  })
}