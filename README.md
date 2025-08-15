<img src="./public/repo-presenter.png" alt="Repo Presenter Demo" width="600">
## Turn your GitHub repo into your best presentation.

## What is this Demo and Why is it Compelling?

As developers, we love to write code, but checking in that code does not make our job complete. We're often called upon to present our work to build our careers. That might be in an internal meeting, a job interview setting, a conference talk, or an official workshop. 

So we're trapped. We have to present, but planning a presentation is hard. That's why we have Repo Presenter. 

Repo Presenter will generate a "run of show" document to map out every minute of your presentation, so that it makes an impact on any audience and in any setting. It turns a public GitHub repo into a polished, audience-specific talk plan which saves hours of prep time.

## Why I Chose This Demonstration

I’ve been teaching and speaking in tech for years, and I know that it's sometimes hard to get started with a presentation plan. I've also seen how uncertainty about how to prepare blocks people in tech from delivering presentations at all. I think that sharing your work is an important part of doing the work, and a tool that can instantly go from “here’s a repo” to “here’s a full plan” felt useful for all sorts of technical demo scenarios.

This is a Next.js 15 application that uses the Claude API. In seconds, it turns a public GitHub repo into a polished, audience-specific talk plan which can save hours of prep time.

## Setup & Running Instructions

1. Download or clone the repo.

```
git clone https://github.com/eveporcello/repo-presenter
```

2. Change directories and install the project's dependencies with npm (or pnpm):

```
cd repo-presenter
npm install
```

3. Generate an Anthropic API key (sign up [here](https://www.anthropic.com)).

4. Create a file called `.env.local` at the root of the project. Next.js will know to look at this file for any environment variables.

5. Add your API Key to the `.env.local` file as this entry:

```
ANTHROPIC_API_KEY=<**YOUR**KEY**HERE>
```

6. Start the Development Server and visit `http://localhost:3000`.

```
npm run dev
```

## Technical Approach and Key Architectural Decisions

* Framework: Next.js 15 with the App Router to use the most modern React stack possible.
* Styling: Tailwind CSS for a fast, consistent UI.
* Icons: lucide-react for lightweight, scalable icons.
* AI integration: Anthropic Claude API for analyzing repo content and generating the presentation plan.

**Key components:**

* `RepoInput`: validates and stores the GitHub repo URL.
* `PresentationOptions`: lets the user pick audience type, time constraint, and Q&A option.
* `API route` — sends structured system prompts and repo metadata to Claude.
* `RunOfShowDisplay` — renders the plan with expand/collapse, metadata, and export to Markdown.

**Decisions:**
* Kept state local to simplify flow.
* Structured the prompt output so the UI can be easily extended for editing or other formats later.

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

I also used Claude to help me generate comments once the code was in a place that I liked it.

## How This Helps Developers Understand Claude's Potential

I think the speed at which you can generate a presenter artifact like this is pretty amazing. Claude allows the developer to do what they do best (write code), and then they can rely on Claude to generate a list of key talking points that will help them execute their presentation with panache. 

## Future Enhancements

If I'd had a bit more time, these are some features I would like to incorporate.
* **Create Slides**: A quick win would be to have the app generate slides with reveal.js or similar tool.
* **Integrate with GitHub MCP Server**: Auth is an afterthought here, and we opted to use public repos only. It would be nice to incorporate token-based auth or even use the GitHub MCP Server.
* **Pacing Timer**: The app would be way cooler if we could click a `Start` button to `Run` the presentation. That way if you talked for 10 minutes instead of the 5 minutes allotted, the pacing could adjust to accelerate or even cut other sections.
* **Improvements to the Prompts**: A better version of this app would have more user input about the audience and might have additional opinionated guidelines from the app on how to deliver a quality presentation.
* **Better Repo Parsing:** currently assumes the repo has a solid README or code structure. We could expand to handle repos without too much documentation better.