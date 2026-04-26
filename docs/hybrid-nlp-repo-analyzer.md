# Hybrid NLP Repository Analyzer

## Purpose

SkillChain should not judge a repository from one weak signal such as a one-line `README.md`. The analyzer uses a hybrid approach: deterministic repository scanning provides facts, and lightweight NLP-style interpretation turns those facts and selected text/code into skill evidence, scores, and explanations.

This first implementation does not call an external LLM. It implements the pipeline shape with GitHub API fetching, rule-based metrics, keyword extraction, and text/code interpretation. A hosted NLP or LLM step can be added later at the interpretation stage without changing the submit flow.

## Full Flow

```text
GitHub URL submitted by user
-> backend validates and parses owner/repo/branch
-> GitHub API fetches repo metadata, languages, file tree, and selected file contents
-> deterministic scanner extracts hard metrics
-> NLP-style interpreter classifies project type, skills, strengths, and risks
-> scoring layer combines facts plus interpretation
-> API returns structured analysis to the frontend
```

## Step 1: Repository Intake

The submit form sends the GitHub repository URL and optional branch to the backend.

What this step adds:

- Confirms the input is a GitHub repository link.
- Extracts `owner`, `repo`, and optional branch.
- Gives the rest of the pipeline a clean, structured input.

Why it matters:

- Prevents random URLs from entering the analyzer.
- Makes GitHub API calls predictable.

## Step 2: GitHub Metadata Fetch

The backend fetches repository metadata from GitHub:

- Repository name and description
- Default branch
- Star/fork counts
- Primary language
- Repository size
- Public language breakdown

What this step adds:

- High-level context before reading files.
- A fallback when file content is limited.

Why it matters:

- Metadata helps classify the repository but should not dominate scoring.
- A popular repo is not automatically high skill; popularity is only supporting context.

## Step 3: File Tree Scan

The analyzer fetches the repository tree and inspects file paths.

It skips noisy or generated folders:

```text
.git
node_modules
dist
build
.next
coverage
vendor
```

It focuses on useful files:

```text
README.md
package.json
requirements.txt
pyproject.toml
src/**
app/**
pages/**
routes/**
tests/**
docs/**
schema.sql
```

What this step adds:

- Source file count
- Test file count
- Documentation file count
- Config file count
- Folder structure signals

Why it matters:

- This overcomes weak README cases because the system still sees real project structure.
- It helps avoid sending unnecessary files into NLP.

## Step 4: Selected Content Fetch

The analyzer only fetches selected text/code files, with size limits.

Priority is given to:

- README and docs
- Dependency manifests
- Routing files
- Backend service files
- Frontend components/pages
- Database/schema files
- Test files
- Config files

What this step adds:

- Enough real code and text for interpretation.
- Controlled payload size.

Why it matters:

- Large repositories cannot be analyzed by reading every byte.
- Sampling important files gives better signal than blindly reading everything.

## Step 5: Deterministic Feature Extraction

This layer extracts facts using rules and patterns.

Examples:

```json
{
  "hasReadme": true,
  "readmeLineCount": 1,
  "hasTests": false,
  "frameworks": ["Next.js", "Express"],
  "hasApiRoutes": true,
  "hasDatabase": true,
  "hasAuth": true,
  "hasEnvConfig": true
}
```

What this step adds:

- Objective signals that do not depend on AI judgment.
- Evidence that can be explained to users.

Why it matters:

- If the README is weak, code facts still carry the analysis.
- If the README is polished but code is empty, the analyzer can detect that too.

## Step 6: NLP-Style Interpretation

This layer reads selected text and code signals to infer meaning.

It looks for terms and patterns related to:

- API design
- Authentication
- Database usage
- Frontend components
- State management
- Testing
- Deployment
- Security
- AI/ML
- Blockchain
- Documentation quality

Example output:

```json
{
  "projectType": "full-stack web app",
  "skillEvidence": ["React", "API design", "Supabase integration"],
  "strengths": ["Clear frontend/backend separation", "Database schema present"],
  "risks": ["README is too small", "No tests detected"]
}
```

What this step adds:

- Human-readable understanding.
- Skill labels that recruiters can understand.
- Explanations instead of raw counts only.

Why it matters:

- Rules can say `hasApiRoutes: true`; interpretation can explain that the repo demonstrates backend API design.

## Step 7: Scoring

Scores combine deterministic signals and interpretation.

Current score categories:

- `backend`
- `frontend`
- `architecture`
- `documentation`
- `codeQuality`
- `security`
- `confidence`

Example scoring logic:

```text
Documentation score
-> README length, setup instructions, headings, docs folder

Backend score
-> API routes, database usage, auth, validation, error handling

Architecture score
-> clear folders, separation of concerns, config, services, components

Confidence score
-> amount of evidence available, repo size, selected file coverage, README quality, tests
```

What this step adds:

- A consistent numerical output.
- Separate scores so one weakness does not ruin the whole repo.

Why it matters:

- A one-line README should lower documentation score, not erase backend or frontend evidence.
- A frontend-only repo should not be punished as if it tried and failed to be a backend repo.

## Step 8: Explanation

The final explanation summarizes what was found and why scores changed.

Example:

```text
README documentation is minimal, so documentation confidence is low. However, the repository contains frontend pages, backend routes, Supabase configuration, and database schema files, so the implementation shows full-stack skill evidence.
```

What this step adds:

- Transparency.
- Recruiter-friendly language.
- Debuggability for the user.

Why it matters:

- Users should understand how the site judged their project.
- Missing evidence should be clearly separated from negative evidence.

## Handling Weak-Signal Cases

### One-line README

Result:

- Documentation score goes down.
- Overall analysis continues using code, dependencies, tests, and structure.

### No tests

Result:

- Code quality confidence goes down.
- Other scores still depend on actual implementation.

### Small repository

Result:

- Confidence score goes down.
- Analyzer avoids overclaiming advanced skills.

### Good README but weak code

Result:

- Documentation can score well.
- Implementation scores stay low if files do not support the claims.

### Poor README but strong code

Result:

- Documentation scores low.
- Architecture/backend/frontend scores can still be high.

## Current Implementation Boundary

The first implementation uses:

- GitHub REST API
- Repository tree and selected file content
- Rule-based feature extraction
- Lightweight keyword/token NLP
- Weighted scoring

It does not yet use:

- OpenAI or another hosted LLM
- Deep AST parsing
- Clone-based commit history analysis
- Plagiarism/template similarity detection
- Long-running background jobs

Those can be added later after the basic analyzer is working end to end.
