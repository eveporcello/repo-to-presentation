<img alt="Repo Presenter logo featuring three green icons: a GitHub cat, a sparkling star, and a presentation screen, above large text Repo Presenter in black and green. The design is clean and modern, conveying a professional and inviting tone." src="./public/repo-presenter.png" alt="Repo Presenter Demo" width="600" />

**Turn your GitHub repo into your best presentation.**

## Video Walkthrough

➡️ 🎥 [Check out the Demo!](https://player.mux.com/3wBDFoYYaZA6GCNmxCKZ4c2NL1pd3hHcWj4BFlXKOHI)

[![Watch the demo](https://image.mux.com/3wBDFoYYaZA6GCNmxCKZ4c2NL1pd3hHcWj4BFlXKOHI/thumbnail.png)](https://player.mux.com/3wBDFoYYaZA6GCNmxCKZ4c2NL1pd3hHcWj4BFlXKOHI)

## Try the App

**Try It Now: [https://repo-presenter.vercel.app](https://repo-presenter.vercel.app)**

1. **Paste a Repo Link**: Any public repo or select one of the options.
2. **Select**: Desired type of presentation and length
3. **Generate**: Complete presentation focusing on React's virtual DOM approach, component architecture, and ecosystem impact

## Overview

Imagine you have 5 minutes to demo your latest project to potential investors or 30 minutes to present at a developer conference. Instead of staring at a blank slide deck feeling panicked, you reach for Repo Presenter, paste your GitHub URL, and instantly get:

* A complete run-of-show with precise timing
* Audience-tailored talking points
* Presenter notes with transition cues and backup explanations
* Q&A with thoughtful responses

Repo Presenter gives you a map and a plan, so you can deliver a solid presentation every time.

### Why I Chose This Demonstration

I’ve been teaching and speaking in tech for 15 years, and I know that it's hard to get started crafting a presentation. I've also seen developers struggle with uncertainty about presentations which can prevent them from presenting at all. I think that sharing your work is an important part of doing the work, and a tool that can instantly go from “here’s a repo” to “here’s a full plan” felt useful for all sorts of technical demo scenarios.

## Local Setup Instructions

If you'd like to run this locally, here are the steps.

### Prerequisites
* Node.js 18+ and npm or pnpm
* Anthropic API key: [(sign up here)](https://www.anthropic.com)

1. Download or clone the repo. Install the dependencies with npm (or pnpm):

```
git clone https://github.com/eveporcello/repo-presenter
cd repo-presenter
npm install
```

2. Create a file called `.env.local` at the root of the project. Next.js will know to look at this file for any environment variables.

3. Add your API Key to the `.env.local` file as this entry:

```
ANTHROPIC_API_KEY=<**YOUR**KEY**HERE>
```

4. Start the Development Server and visit `http://localhost:3000`.

```
npm run dev
```

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

**Interesting Parts**

* `RepoInput`: validates and stores the GitHub repo URL.
* `PresentationOptions`: lets the user pick audience type, time constraint, and Q&A option.
* `API/route` — sends structured system prompts and repo metadata to Claude.
* `RunOfShowDisplay` — renders the plan with expand/collapse, metadata, and export to Markdown.


**Technical Decisions**

* Repository Analysis Strategy: Instead of just reading README files, we parse file structure, extract key implementation files, and analyze package.json to understand the technical stack and complexity.
* Structured JSON Output: Claude returns structured data that our UI can immediately render, edit, and export. This is easy to use for slide generation in future iterations.


## Future Enhancements

If I'd had a bit more time, these are some features I would like to add:

* **Creating Slides**: A quick win would be to have the app generate slides with reveal.js or similar tool.
* **Integrating with GitHub MCP Server**: Auth is an afterthought here, and we opted to use public repos only. It would be nice to incorporate token-based auth or even use the GitHub MCP Server.
* **Pacing Timer**: The app would be way cooler if we could click a `Start` button to `Run` the presentation. That way if you talked for 10 minutes instead of the 5 minutes allotted, the pacing could adjust to accelerate or even cut other sections.
* **Improvements to the Prompts**: A better version of this app would have more user input about the audience and might have additional opinionated guidelines from the app on how to deliver a quality presentation.
* **Better Repo Parsing:** currently assumes the repo has a solid README or code structure. We could expand to handle repos without too much documentation better.
* **Performance Upgrades for Bigger Repos**: This could probably use some performance tuning to make sure even hefty repos are scannable.
* **A full tutorial**: With more time, I would build the app step by step, enhance simplicity through refactoring, and make this an artifact that people can build together.
