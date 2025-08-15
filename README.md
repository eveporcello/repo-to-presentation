alt="Repo Presenter logo featuring three green icons: a GitHub cat, a sparkling star, and a presentation screen, above large text Repo Presenter in black and green. The design is clean and modern, conveying a professional and inviting tone.">

**Turn your GitHub repo into your best presentation.**

Imagine you have 5 minutes to demo your latest project to potential investors, or 30 minutes to present at a developer conference. Instead of staring at a blank slide deck wondering where to start, you paste your GitHub URL and instantly get:

* A complete run-of-show with precise timing
* Audience-tailored talking points (technical depth for engineers, business value for stakeholders)
* Presenter notes with transition cues and backup explanations
* Possible Q&A with thoughtful responses

Repo Presenter will generate a presenter notes document to map out every minute of your presentation. Transform a public GitHub repo link into a polished, audience-specific talk plan which saves hours of prep time.

## Why I Chose This Demonstration

I’ve been teaching and speaking in tech for years, and I know that it's sometimes hard to get started with a presentation plan. I've also seen how uncertainty about how to prepare blocks people in tech from delivering presentations at all. I think that sharing your work is an important part of doing the work, and a tool that can instantly go from “here’s a repo” to “here’s a full plan” felt useful for all sorts of technical demo scenarios.

This is a Next.js 15 application that uses the Claude API. In seconds, it turns a public GitHub repo into a polished, audience-specific talk plan which can save hours of prep time.

## Quick Demo

1. Visit the app at `https://repo-presenter.vercel.app`.
2. Add your favorite demo repo link or select one of the options (React, Next.js, etc.).
3. Generate your presentation notes!

## Local Setup Instructions

### Prerequisites
* Node.js 18+ and npm or pnpm
* Anthropic API key: [(sign up here)](https://www.anthropic.com)

1. Download or clone the repo.

```
git clone https://github.com/eveporcello/repo-presenter
```

2. Change directories and install the project's dependencies with npm (or pnpm):

```
cd repo-presenter
npm install
```

3. Create a file called `.env.local` at the root of the project. Next.js will know to look at this file for any environment variables.

4. Add your API Key to the `.env.local` file as this entry:

```
ANTHROPIC_API_KEY=<**YOUR**KEY**HERE>
```

5. Start the Development Server and visit `http://localhost:3000`.

```
npm run dev
```

## Technical Approach and Key Architectural Decisions

* Framework: Next.js 15 with the App Router to use the most modern React stack possible.
* Styling: Tailwind CSS for a fast, consistent UI.
* Icons: `lucide-react` for lightweight, scalable icons.
* AI integration: Anthropic Claude API for analyzing repo content and generating the presentation plan.

### Audience-Aware Prompt Engineering

The core technical piece is the multi-layered prompt system that adapts based on context and analysis:

```typescript
// Audience-specific context injection
const audienceContext = {
  conference: 'technical innovation, architecture decisions, performance optimizations',
  client: 'business value, user impact, scalability, reliability',
  interview: 'problem-solving process, code quality, testing approach'
}

// Dynamic prompt construction based on repository analysis
const prompt = buildPrompt({
  repoAnalysis: extractedCodeStructure,
  audienceType: userSelection,
  timeConstraint: userTimeLimit,
  includeQA: userPreference
})
```

**Key components:**

* `RepoInput`: validates and stores the GitHub repo URL.
* `PresentationOptions`: lets the user pick audience type, time constraint, and Q&A option.
* `API/route` — sends structured system prompts and repo metadata to Claude.
* `RunOfShowDisplay` — renders the plan with expand/collapse, metadata, and export to Markdown.


**Critical Technical Decisions**

* Repository Analysis Strategy: Instead of just reading README files, we parse file structure, extract key implementation files, and analyze package.json to understand the technical stack and complexity.
* Structured JSON Output: Claude returns structured data that our UI can immediately render, edit, and export. This is easy to use for slide generation in future iterations.

## How I Used Claude in this Demo

I wrote a structured prompt with:
* Repo metadata (stars, language, description).
* User-selected configuration options (audience, time, Q&A flag).
* Instructions to output a JSON structure with:
    * Overview
    * Sections (title, duration, content, key points, presenter notes)
    * Optional Q&A and technical questions
    * Closing notes

I iterated by:
* Tuning section title clarity and balance between technical and audience-friendly language.
* Making durations consistent so they add up to the total time.
* Keeping key points concise for quick scanning during a talk.

Claude Usage in Development
* Code generation: Used Claude to generate component boilerplate (Tailwind classes especially!) and TypeScript interfaces
* Documentation: Claude helped write clear, comprehensive comments
* Prompt refinement: Iteratively improved prompts based on output quality

## How This Helps Developers Understand Claude's Potential

I think the speed at which you can generate a presenter artifact like this is pretty amazing. Claude allows the developer to do what they do best (write code), and then they can rely on Claude to generate a list of key talking points that will help them execute their presentation with panache. 

This showcases Claude's ability to analyze complex codebases and pull out an engaging story. 

* For engineers: "This helps me share my work and ideas with a larger audience to improve my career trajectory."
* For engineering managers: "Instead of spending hours preparing for client and stakeholder demos, our team could focus on building."
* For developer advocates: "This could generate content for dozens of conference talks from our open source repositories."
* For job seekers: "This turns my GitHub portfolio into compelling interview presentations."

## Future Enhancements

If I'd had a bit more time, these are some features I would like to incorporate.
* **Create Slides**: A quick win would be to have the app generate slides with reveal.js or similar tool.
* **Integrate with GitHub MCP Server**: Auth is an afterthought here, and we opted to use public repos only. It would be nice to incorporate token-based auth or even use the GitHub MCP Server.
* **Pacing Timer**: The app would be way cooler if we could click a `Start` button to `Run` the presentation. That way if you talked for 10 minutes instead of the 5 minutes allotted, the pacing could adjust to accelerate or even cut other sections.
* **Improvements to the Prompts**: A better version of this app would have more user input about the audience and might have additional opinionated guidelines from the app on how to deliver a quality presentation.
* **Better Repo Parsing:** currently assumes the repo has a solid README or code structure. We could expand to handle repos without too much documentation better.