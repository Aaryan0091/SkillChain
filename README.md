# SkillChain AI

SkillChain AI analyzes GitHub repositories to evaluate a developer's real technical skills from actual project work. It converts repository evidence into explainable scores, generates a digital certificate, and anchors the certificate hash on Polygon so recruiters can verify that the result has not been tampered with.

## Vision

Traditional resumes rely on self-claimed skills. SkillChain AI replaces that with project-based proof by combining code analysis, explainable scoring, certificate generation, and blockchain verification.

## Core Outcomes

- Evaluate practical engineering ability from real repositories
- Show transparent skill scores with evidence-backed explanations
- Generate a recruiter-friendly certificate
- Make each certificate verifiable through a public link and QR code
- Prevent tampering by storing the certificate hash on Polygon

## How The System Works

1. A developer signs in and submits a GitHub repository.
2. The backend creates a project record and queues analysis work.
3. The analysis engine fetches repository metadata and code signals.
4. Raw metrics are extracted from the repository structure, commits, files, tests, documentation, and complexity.
5. The scoring engine converts those metrics into skill scores and plain-language explanations.
6. The certificate service generates a digital certificate with the score summary, explanations, verification URL, and QR code.
7. A certificate hash is written to Polygon and the transaction reference is stored.
8. A recruiter opens the verification page or scans the QR code to confirm authenticity.

## Functional Modules

### 1. Authentication And Identity

- User sign in with Supabase auth
- Support for email, GitHub, Google, and magic link
- Optional wallet address for blockchain-linked identity

### 2. Repository Intake

- Submit GitHub repository URL
- Store repository metadata
- Track analysis state
- Queue future analysis jobs

### 3. Analysis Engine

- Fetch repository metadata and default branch details
- Inspect codebase structure and language usage
- Measure commits, files, documentation, tests, and complexity indicators
- Produce normalized raw metrics

### 4. Scoring Engine

- Convert metrics into category scores
- Generate explainable score breakdowns
- Store scoring version for reproducibility
- Return recruiter-readable explanations

### 5. Certificate Engine

- Generate a certificate artifact from scores and evidence
- Attach a verification URL and QR code
- Produce a deterministic certificate hash

### 6. Blockchain Verification

- Store certificate hash on Polygon
- Save chain id and transaction hash
- Use on-chain hash comparison to detect tampering

### 7. Recruiter Verification

- Public verification page
- QR code entry point
- Compare displayed certificate data with stored blockchain hash
- Show authenticity result and summary evidence

## Workspace Structure

- `skillchain-frontend` - Next.js frontend for landing page, auth, dashboard, repository submission, and certificate viewing
- `skillchain-backend` - Express API for auth integration, project intake, analysis orchestration, scoring, and certificate services
- `supabase/schema.sql` - database schema for users, projects, metrics, scores, certificates, and analysis jobs

## Current Data Model

The existing schema already supports the main platform flow:

- `users` - user profile and wallet address
- `projects` - submitted repositories and analysis state
- `metrics` - extracted repository metrics
- `scores` - computed skill scores and explanations
- `certificates` - generated certificate metadata and blockchain references
- `analysis_jobs` - queued and completed pipeline jobs

## Locked Product Contract

Phase 0 requires a clear contract for what the system analyzes, scores, certifies, and verifies. The project now uses the following baseline:

- Analysis input: a GitHub repository URL and its accessible repository metadata
- Analysis output: deterministic repository metrics plus AI-generated explanations
- Score output: category scores, confidence score, explanation text, and score breakdown JSON
- Certificate output: a canonical certificate payload, verification URL, QR code reference, stable hash, and blockchain transaction reference
- Verification output: a binary verification result based on comparing the canonical payload hash against the on-chain hash

## Locked Score Categories

The first scoring version should stay fixed to these categories unless we explicitly version the model again:

- `backend_score`
- `architecture_score`
- `documentation_score`
- `confidence_score`

These categories already exist in the schema and form the initial scoring contract for `v1`.

## Canonical Certificate Payload

Before blockchain anchoring, SkillChain AI must hash a stable payload instead of arbitrary JSON. The `v1` certificate payload should contain only these fields:

```json
{
  "certificateId": "uuid",
  "projectId": "uuid",
  "userId": "uuid",
  "repoUrl": "string",
  "repoName": "string",
  "analysisVersion": "v1",
  "scoringVersion": "v1",
  "certificatePayloadVersion": "v1",
  "issuedAt": "ISO-8601 timestamp",
  "scores": {
    "backendScore": 0,
    "architectureScore": 0,
    "documentationScore": 0,
    "confidenceScore": 0
  },
  "summary": {
    "explanation": "string"
  },
  "verification": {
    "verificationUrl": "string"
  }
}
```

Canonicalization rules for hashing:

- Use a fixed payload version
- Keep field names stable
- Serialize in a deterministic order
- Do not include transient fields like QR image bytes, UI labels, or unsigned URLs that may change later

## Versioning Rules

- `analysis_version` defines the deterministic analysis pipeline version
- `scoring_version` defines the score calculation and explanation format
- `certificate_payload_version` defines the exact hashable certificate schema

Any future change to metrics logic, scoring logic, or certificate payload shape must update the corresponding version instead of silently changing behavior.

## Verification State Contract

Certificates should distinguish issuance state from verification state:

- `status` tracks certificate lifecycle such as `pending`, `issued`, or `failed`
- `verification_status` tracks blockchain verification state such as `pending`, `verified`, `mismatch`, or `failed`

This prevents certificate generation state and blockchain trust state from being mixed together.

## Blockchain Configuration Contract

The backend now expects the following blockchain configuration:

- `BLOCKCHAIN_RPC_URL`
- `BLOCKCHAIN_CHAIN_ID`
- `BLOCKCHAIN_CONTRACT_ADDRESS`
- `ISSUER_WALLET_ADDRESS`

For development, Polygon Amoy uses chain id `80002`.

## Target Architecture

```text
+------------------+       +-----------------------+       +----------------------+
|   Next.js App    | ----> |   Express API Layer   | ----> |      Supabase        |
| login/dashboard  |       | auth/projects/jobs    |       | auth + postgres      |
| submit/verify    |       | scoring/certificates  |       | metrics + scores     |
+------------------+       +-----------------------+       +----------------------+
          |                            |                               |
          |                            v                               |
          |                 +-----------------------+                  |
          |                 |  Analysis Pipeline    |                  |
          |                 | GitHub ingest         |                  |
          |                 | metrics extraction    |                  |
          |                 | score generation      |                  |
          |                 +-----------------------+                  |
          |                            |                               |
          |                            v                               |
          |                 +-----------------------+                  |
          |                 | Certificate Service   |                  |
          |                 | PDF/JSON payload      |                  |
          |                 | QR code + hash        |                  |
          |                 +-----------------------+                  |
          |                            |                               |
          |                            v                               |
          +--------------------> +-----------------------+
                                 | Polygon Anchoring     |
                                 | hash + tx reference   |
                                 +-----------------------+
```

## Request Flow

### Developer Flow

1. Sign in
2. Submit repository
3. Track analysis progress
4. Review skill scores and explanations
5. Generate certificate
6. Share verification link

### Recruiter Flow

1. Open certificate link or scan QR code
2. Load certificate payload
3. Compare payload hash with Polygon record
4. Show verification status and certificate details

## Suggested Backend Service Breakdown

- `auth-service` - provider-aware identity and session logic
- `repo-service` - GitHub intake and repository metadata sync
- `analysis-service` - parsing, metric extraction, and job execution
- `scoring-service` - weighted score calculation and explanation generation
- `certificate-service` - certificate payload, rendering, QR code, and hashing
- `blockchain-service` - Polygon write and verification logic
- `verification-service` - public certificate verification endpoint

## API Direction

These are the main API areas the project will need:

- `POST /api/v1/projects` - submit a repository
- `GET /api/v1/projects` - list user repositories
- `GET /api/v1/projects/:id` - get project analysis result
- `POST /api/v1/projects/:id/analyze` - trigger analysis
- `GET /api/v1/projects/:id/certificate` - fetch certificate details
- `POST /api/v1/projects/:id/certificate` - generate certificate
- `GET /api/v1/verify/:certificateId` - public verification endpoint
- `GET /api/v1/health` - service health

## Local Setup

### Frontend

Copy [skillchain-frontend/.env.example](/Users/aaryangupta/Desktop/SkillChain/skillchain-frontend/.env.example) to `.env.local` and add:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_BASE_URL`

Run:

```bash
cd skillchain-frontend
npm install
npm run dev
```

### Backend

Copy [skillchain-backend/.env.example](/Users/aaryangupta/Desktop/SkillChain/skillchain-backend/.env.example) to `.env` and add:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `GITHUB_TOKEN`
- `BLOCKCHAIN_RPC_URL`

Run:

```bash
cd skillchain-backend
npm install
npm run dev
```

### Root Workspace

Run both apps together:

```bash
npm install
npm run dev
```

## Implementation Roadmap

### Phase 1. Foundation

- Finalize database schema and env setup
- Connect Supabase auth in frontend and backend
- Complete repository submission flow
- Add project dashboard with status tracking

### Phase 2. Analysis Pipeline

- Integrate GitHub repository fetch
- Build repository metadata ingestion
- Add metric extraction for codebase size, commits, tests, docs, and complexity
- Persist analysis jobs and status updates

### Phase 3. Scoring And Explainability

- Define score categories and weights
- Compute skill scores from metrics
- Store score breakdown JSON
- Generate simple, recruiter-friendly explanations

### Phase 4. Certificate Generation

- Create certificate payload format
- Generate certificate page or PDF
- Add verification URL and QR code
- Produce stable certificate hash

### Phase 5. Polygon Verification

- Add Polygon write flow
- Store transaction hash and chain metadata
- Verify certificate payload against on-chain hash

### Phase 6. Recruiter Experience

- Build public verification page
- Show authenticity status
- Display score summary and explanation
- Improve certificate sharing UX

## Success Criteria

- Repository analysis completes reliably
- Scores are explainable and reproducible
- Certificate payload is deterministic
- Blockchain hash matches generated certificate data
- Recruiter verification is simple and trustworthy

## Present Status

The current repo already includes:

- A Next.js frontend shell
- An Express backend shell
- Placeholder auth and project routes
- A Supabase schema for the core entities

The next major step is to implement the real repository analysis and scoring pipeline.
