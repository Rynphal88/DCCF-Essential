# Compass Ratification Document

**Status:** Ratified (Binding Constitution)  
**Version:** 1.1.1  
**Canonical Scope:** System-wide  
**Audience:** Humans, AI agents, future maintainers

---

## PREAMBLE (Non-Binding, Symbolic)

Let this Compass serve as the unwavering north star—preserving intent, enforcing discipline, and guiding all creation—human and machine—from clarity of thought to precision of execution.

---

## 1. Purpose

This document formally ratifies the **Compass** as the system’s supreme alignment artifact.

Its purpose is to:
- Freeze intent
- Establish an authority hierarchy
- Enforce phase discipline (thinking before building)
- Prevent reinterpretation, drift, and invisible debt

If any implementation, prompt, tool, or system behavior conflicts with this document, the implementation is invalid until corrected or this document is formally amended.

---

## 2. Core Doctrine (Non-Negotiable)

> **Plan thinks. Agent builds.**  
> **If you build before thinking, you accumulate invisible debt.**

System order is absolute:
1. Intent is clarified and ratified in the Compass
2. Only then may agents or humans build

This order may not be inverted.

---

## 3. Definitions (Binding)

- **Compass:** A non-executable, human-ratified artifact that encodes stable intent, priorities, and constraints.  
- **Planning / Thinking:** Activities that clarify intent and define boundaries (documents, models, ratification).  
- **Agent:** Any automated, semi-automated, or human executor acting in an implementation role.  
- **Implementation / Build:** Any act that changes system reality, including code, schema, UI, APIs, prompts that generate production artifacts, automation, or deployment configuration.  
- **System Constraints:** Enforceable rules derived from the Compass (guardrails, standards, compliance rules). They translate Compass intent into “must/never” constraints without changing intent.  
- **Drift:** Any unratified change in meaning, scope, priority, or behavior.  
- **Amendment:** A documented, reviewed, and re-ratified change to Compass intent.

---

## 4. Authority Hierarchy (Why the “Middle Layer” Exists)

The hierarchy of authority is fixed and directional:

1. **Compass (Constitution)**  
   - Defines intent, priorities, boundaries, and authority.  
   - Does **not** execute or specify implementation details.

2. **System Constraints (Derived Rules)**  
   - Codifies Compass intent into enforceable rules (guardrails/standards/compliance).  
   - Exists to prevent agents/tools from “interpreting” the Compass differently during execution.  
   - Must be **derived from** the Compass, not invented beyond it.

3. **Execution Tools (Implementation Utilities)**  
   - Prompts, automation, scripts, APIs—used to produce work.  
   - Must obey System Constraints and must not rewrite Compass intent.

4. **Artifacts (Final Outputs)**  
   - Code, UI, schema, data, deployments—what gets shipped.

### Visual Map


COMPASS (Ratified Constitution)
↓
SYSTEM CONSTRAINTS (Guardrails/Standards derived from Compass)
↓
EXECUTION TOOLS (Prompts/Automation/Scripts/APIs — implementation-only)
↓
ARTIFACTS (Code/UI/Schema/Data — final outputs)




Lower layers may not reinterpret or override higher layers.

---

## 5. What the Compass Is (and Is Not)

### The Compass is:
- A constitutional decision anchor
- A north-star reference for alignment
- A source of truth for constraints and priorities

### The Compass is not:
- A backlog or roadmap
- A UI or API specification
- A database schema
- An execution engine
- A place for speculative ideas

Silence in the Compass means **no authorization**.

---

## 6. Frozen Decisions

The following are frozen unless amended:

1. The Compass precedes all build activity  
2. The Compass never executes or mutates state  
3. The Compass overrides all downstream interpretations  
4. Absence of instruction is intentional  

---

## 7. Agent Protocols & Constraints

All agents and builders must:

- Explicitly acknowledge Compass authority  
- Operate only in authorized phases  
- Avoid reinterpretation, scope expansion, or “improvements” to intent  
- Pause and request clarification if ambiguity exists  
- Escalate if an amendment appears necessary  

### 7.1 Agent Authentication & Audit

- All agent interactions referencing the Compass must be identifiable, logged, and timestamped.  
- Audit logs must be retained for historical traceability.

---

## 8. Phase Discipline Enforcement

Once this document exists and is acknowledged:

- **Thinking phase:** CLOSED  
- **Building phase:** AUTHORIZED (within Compass constraints)

Any action that re-enters planning requires amendment, not execution.

---

## 9. Anti-Drift Tests (Pre-Build)

Before building, all must answer **YES**:

1. Can I cite the Compass clause authorizing this?  
2. Am I implementing, not deciding?  
3. Does this preserve frozen intent?  
4. Does this introduce new scope or assumptions?  
5. Is escalation required instead of execution?

If any answer is **NO**, building must stop.

---

## 10. Conflict Resolution Rule

If implementation conflicts with the Compass:

1. Pause execution  
2. Document the conflict  
3. Either:  
   - Fix implementation (default), or  
   - Amend and re-ratify the Compass (explicit)

Silent compromise is forbidden.

---

## 11. Change Control & Future-Proofing

### 11.1 Amendment Protocol

Compass changes require:
- Explicit human review  
- Written amendment  
- Version bump  
- Re-ratification  

### 11.2 Periodic Review Trigger

Mandatory review occurs:
- Upon major architectural paradigm shifts  
- Upon significant AI capability changes  
- Or at minimum, annually  

---

## 12. Internationalization & Canonical Language

- The canonical language of the Compass is **English**.  
- Translations are permitted but must preserve semantic fidelity.  
- In case of conflict, the English version prevails.

---

## 13. Machine-Readable Requirement

The Compass must exist in:
- Human-readable Markdown (this file)  
- A machine-readable structured format (e.g., JSON or YAML)

Both representations must be semantically identical.

---

## 14. Non-Repudiation

- Ratification acknowledgments (human or agent) must be logged.  
- Denial of Compass awareness or authority is invalid once acknowledged.

---

## 15. Ratification Statement

By acceptance of this document:
- Compass intent is declared **stable**  
- Authority hierarchy is enforced  
- Disciplined execution is authorized  

---

## 16. Metadata

**Ratified by:** Nana — System Originator  
**Date:** 2025-12-18  
**Version:** 1.1.1  

---

## 17. Change Log

- **1.0.0** — Initial constitutional ratification  
- **1.1.0** — Agent protocols, auditability, internationalization, machine-readability, non-repudiation  
- **1.1.1** — Clarified “System Constraints” role, strengthened hierarchy explanation, formatting cleanup
