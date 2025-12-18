# \# Cursor Prompt Pack — DCCF Essential

# 

# This folder contains the \*\*authoritative Cursor prompt system\*\* for the DCCF Essential codebase.

# 

# These prompts are designed to produce:

# \- minimal, safe, reversible changes

# \- architecture-correct Next.js 14 App Router code

# \- high-signal outputs with low regression risk

# \- predictable results across refactors, features, APIs, and UI

# 

# > This is a coordinated system. Prompts are not interchangeable.

# 

# ---

# 

# \## How to Use (IMPORTANT)

# 

# 1\. \*\*Always start with `00-guardrails.md`\*\*

# &nbsp;  - It defines global constraints, escalation rules, and verification requirements.

# &nbsp;  - All other prompts inherit its rules.

# 

# 2\. \*\*Select exactly ONE execution prompt\*\*

# &nbsp;  - Use the selection matrix inside `00-guardrails.md`

# &nbsp;  - If a task spans layers, use orchestration (`05-…`) first.

# 

# 3\. \*\*Paste the chosen prompt into Cursor\*\*

# &nbsp;  - Then describe the task clearly.

# &nbsp;  - Do not mix multiple prompts in one request unless orchestrated.

# 

# ---

# 

# \## Prompt Index (Execution Order Matters)

# 

# \### Core

# \- \*\*00-guardrails.md\*\*  

# &nbsp; Global execution contract. Always applies.

# 

# \- \*\*01-output-format.md\*\*  

# &nbsp; Mandatory response structure Cursor must follow.

# 

# ---

# 

# \### Orchestration

# \- \*\*05-multi-prompt-coordination.md\*\*  

# &nbsp; Use when work spans UI + API + business logic or requires phased execution.

# 

# ---

# 

# \### Execution Prompts

# 

# \- \*\*10-refactor-safe.md\*\*  

# &nbsp; Safe refactors only. No behavior change.

# 

# \- \*\*20-feature-add.md\*\*  

# &nbsp; New user-facing features with clean architecture.

# 

# \- \*\*30-bugfix-triage.md\*\*  

# &nbsp; Root-cause debugging with minimal fixes.

# 

# \- \*\*40-api-route-handler.md\*\*  

# &nbsp; API route handlers as strict contracts.

# 

# \- \*\*50-ui-component.md\*\*  

# &nbsp; UI components with accessibility and composability standards.

# 

# ---

# 

# \### Indexing \& Accuracy

# \- \*\*60-repo-indexing.md\*\*  

# &nbsp; Improves Cursor’s repo awareness and prevents hallucinated paths.

# 

# ---

# 

# \## Design Principles

# 

# \- App Router only (`src/app/\*\*`)

# \- Server Components by default

# \- Explicit client boundaries

# \- No speculative refactors

# \- Minimal blast radius

# \- Verification before confidence

# 

# This prompt system exists to \*\*reduce entropy\*\*, not increase velocity at the cost of correctness.

# 

# ---

# 

# \## When in Doubt

# 

# \- Choose the \*\*most restrictive prompt\*\*

# \- Or escalate to \*\*05-multi-prompt-coordination.md\*\*

# \- Or pause and ask for clarification

# 

# Incorrect prompt selection is a correctness error.

# 

# ---

# 

# \## Status

# 

# This prompt pack is \*\*stable\*\* and intended for long-term use.

# Changes should be deliberate and versioned.



