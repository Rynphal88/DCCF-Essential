# Compass Architectural Review

**Status**: Pre-Implementation Review  
**Date**: 2025-01-XX  
**Purpose**: Validate domain assumptions, invariants, and boundaries before ratification

---

## 1. Core Invariants

**Definition**: Rules that MUST always be true. Violation of an invariant means the system is in an invalid state. These are non-negotiable and must be enforced at the domain level.

### Structural Invariants

1. **Four Quadrants Required**
   - A Compass MUST have exactly four quadrants: `problem`, `gap`, `contribution`, `alignment`
   - Missing quadrants = invalid Compass
   - Extra quadrants = invalid Compass
   - **Enforcement**: Domain model constructor/validation

2. **Score Range Constraints**
   - `progress`: MUST be in [0, 100]
   - `clarity`: MUST be in [0, 100]
   - `momentum`: MUST be in [-100, 100]
   - `overallAlignment`: MUST be in [0, 100]
   - `researchDrift`: MUST be in [0, 100]
   - `weeklyMomentum`: MUST be in [-100, 100]
   - **Enforcement**: Value object constructors reject out-of-range values

3. **Timestamp Validity**
   - `lastUpdated` for each quadrant MUST be ≤ current time
   - `lastUpdated` MUST be set when quadrant changes
   - **Enforcement**: Domain model update methods

4. **Quadrant Completeness**
   - All quadrants MUST have: `id`, `title`, `description`
   - All quadrants MUST have: `progress`, `clarity`, `momentum`
   - All quadrants MUST have: `lastUpdated`
   - **Enforcement**: Domain model validation

### Consistency Invariants

5. **Metrics Are Derived, Never Directly Set**
   - `overallAlignment` MUST be computed from quadrant states
   - `researchDrift` MUST be computed from alignment (with penalties)
   - `weeklyMomentum` MUST be computed from quadrant momentums
   - Metrics MUST be recalculated when any quadrant changes
   - **Enforcement**: No setter methods for metrics; only computation methods

6. **Metrics Consistency**
   - Metrics MUST be consistent with quadrant states
   - If quadrants change, metrics MUST be recalculated before persistence
   - **Enforcement**: Service layer ensures recalculation on quadrant updates

7. **Alignment-Drift Relationship**
   - `researchDrift` = 100 - `overallAlignment` (base case)
   - Additional drift penalties for quadrant divergence
   - Drift CANNOT be negative
   - **Enforcement**: Metrics calculator algorithm

### Business Logic Invariants

8. **Insight Validity**
   - `aiInsights` array elements MUST be non-empty strings
   - `nextBestAction` MUST be actionable (not vague) if present
   - Insights MUST be relevant to current Compass state
   - **Enforcement**: Insight generator validation

9. **Quadrant Identity Uniqueness**
   - Each quadrant MUST have a unique `id` within a Compass
   - Quadrant `id` MUST be one of: `"problem" | "gap" | "contribution" | "alignment"`
   - **Enforcement**: Type system + domain validation

10. **Compass Lifecycle**
    - Compass is NEVER deleted (archived if research direction changes)
    - Compass MUST belong to exactly one user
    - **Enforcement**: Repository layer (soft delete pattern)

---

## 2. Hard Assumptions

**Definition**: Foundational assumptions that are unlikely to change. These form the bedrock of the system. Changing these would require significant architectural rework.

### Domain Model Assumptions

1. **Four Fixed Quadrants**
   - Quadrants are NOT user-configurable in MVP
   - Quadrant metadata (title, description, color, icon) is FIXED
   - The four-quadrant model is the core domain structure
   - **Rationale**: Simplifies MVP, ensures consistency across users
   - **Impact if changed**: Would require schema migration, UI redesign, algorithm changes

2. **Single Researcher per Compass**
   - One Compass per user (1:1 relationship)
   - No shared/team Compass in MVP
   - Compass is personal to the researcher
   - **Rationale**: Doctoral research is typically individual work
   - **Impact if changed**: Would require multi-tenancy, permissions, collaboration features

3. **Compass as Root Aggregate**
   - Compass is the aggregate root
   - Quadrants, Metrics, Insights are owned by Compass
   - All Compass operations go through the aggregate root
   - **Rationale**: Domain-driven design pattern for consistency
   - **Impact if changed**: Would require restructuring domain model

### Integration Assumptions

4. **Read-Only Integration Pattern**
   - Compass READS from external systems (artifacts, rituals, wins)
   - Compass does NOT modify external systems
   - Compass is a consumer, not a controller
   - **Rationale**: Clear separation of concerns, prevents circular dependencies
   - **Impact if changed**: Would require bidirectional integration, potential coupling issues

5. **Supabase as Primary Storage**
   - Compass state stored in `compass_objects` table
   - User-scoped via `user_id` column
   - JSONB for quadrant data
   - **Rationale**: Existing infrastructure, flexible schema
   - **Impact if changed**: Would require new persistence layer, migration strategy

6. **AI System Availability**
   - AI system is available for insight generation
   - AI system can analyze artifacts and rituals
   - AI failures are handled gracefully (fallback to rule-based insights)
   - **Rationale**: Core feature depends on AI for value
   - **Impact if changed**: Would require alternative insight generation strategies

### Architectural Assumptions

7. **Synchronous Updates**
   - Compass updates are synchronous (no async processing)
   - Metrics are computed on-demand, not pre-computed
   - No background jobs for Compass state
   - **Rationale**: Simplicity, immediate consistency
   - **Impact if changed**: Would require async infrastructure, eventual consistency handling

8. **Metrics Computation on Quadrant Change**
   - Metrics MUST be recalculated when any quadrant changes
   - No caching of metrics (always fresh)
   - **Rationale**: Ensures consistency, prevents stale data
   - **Impact if changed**: Would require caching strategy, invalidation logic

---

## 3. Soft Assumptions

**Definition**: Assumptions that are reasonable defaults but could change based on user feedback or requirements. These are implementation choices that can be adjusted without major architectural changes.

### Behavioral Assumptions

1. **Quadrant Metadata Fixed**
   - Title, description, color, icon are hardcoded
   - **Could change to**: User-configurable metadata
   - **Impact**: Low (UI change, no domain model change)

2. **Insight Generation Frequency**
   - Insights generated on-demand (when requested)
   - **Could change to**: Scheduled generation, cached insights with TTL
   - **Impact**: Medium (requires caching layer, background jobs)

3. **Artifact Analysis Trigger**
   - Artifact analysis is manual (explicit API call)
   - **Could change to**: Automatic on artifact creation/update
   - **Impact**: Medium (requires event system or polling)

4. **Ritual Analysis Trigger**
   - Ritual analysis is manual (explicit API call)
   - **Could change to**: Automatic on ritual completion
   - **Impact**: Medium (requires event system or polling)

5. **Fallback State Behavior**
   - Missing Compass returns default/empty state
   - **Could change to**: Requires explicit Compass creation first
   - **Impact**: Low (API contract change)

### Algorithm Assumptions

6. **Metrics Calculation Algorithm**
   - `overallAlignment`: Weighted average of quadrant clarity
   - `researchDrift`: 100 - alignment + divergence penalties
   - `weeklyMomentum`: Sum of quadrant momentums, normalized
   - **Could change to**: Machine learning models, custom algorithms per user
   - **Impact**: Medium (strategy pattern already planned)

7. **Drift Penalty Calculation**
   - Divergence penalties are fixed formula
   - **Could change to**: Configurable penalties, user-specific thresholds
   - **Impact**: Low (algorithm parameter change)

8. **Insight Generation Strategy**
   - Single AI provider for insights
   - **Could change to**: Multiple providers, rule-based fallback, user preferences
   - **Impact**: Medium (plugin architecture already planned)

### Data Assumptions

9. **Quadrant Data Structure**
   - `insights` and `risks` are string arrays
   - **Could change to**: Structured objects with metadata (source, confidence, etc.)
   - **Impact**: Low (schema migration, backward compatible)

10. **Historical Data**
    - No historical tracking in MVP
    - **Could change to**: Version history, state snapshots, time-series data
    - **Impact**: High (requires new schema, query patterns, storage strategy)

---

## 4. Open Design Decisions

**Definition**: Decisions that need to be made but haven't been finalized. These require explicit choices before implementation can proceed.

### Update Frequency & Triggers

1. **Artifact Analysis Frequency**
   - **Question**: How often should Compass analyze artifacts automatically?
   - **Options**:
     - Manual only (explicit API call)
     - On artifact creation/update (event-driven)
     - Scheduled (daily/weekly batch)
     - Hybrid (manual + scheduled)
   - **Recommendation**: Start with manual, add event-driven later
   - **Impact**: Affects integration architecture

2. **Insight Regeneration Frequency**
   - **Question**: How often should AI insights be regenerated?
   - **Options**:
     - Always fresh (on every request)
     - Cached with TTL (e.g., 1 hour, 24 hours)
     - Regenerate on quadrant change
     - Hybrid (fresh if recent change, cached otherwise)
   - **Recommendation**: Cache with 1-hour TTL, invalidate on quadrant change
   - **Impact**: Affects API performance, AI cost, freshness guarantees

3. **Metrics Recalculation Trigger**
   - **Question**: When should metrics be recalculated?
   - **Options**:
     - On every quadrant change (current assumption)
     - On read (lazy computation)
     - Scheduled (periodic recalculation)
   - **Recommendation**: On every quadrant change (ensures consistency)
   - **Impact**: Affects write performance, consistency guarantees

### Thresholds & Configuration

4. **Drift Warning Thresholds**
   - **Question**: What drift level triggers warnings?
   - **Options**:
     - Fixed threshold (e.g., >30% drift)
     - User-configurable threshold
     - Context-aware (early stage vs. late stage)
     - No automatic warnings (manual review only)
   - **Recommendation**: Fixed threshold (30%) for MVP, make configurable later
   - **Impact**: Affects notification system, user experience

5. **Momentum Significance Threshold**
   - **Question**: What momentum change is considered "significant"?
   - **Options**:
     - Fixed threshold (e.g., ±10 points)
     - Percentage-based (e.g., ±10% change)
     - Context-aware (relative to current momentum)
   - **Recommendation**: Fixed threshold (±10 points) for MVP
   - **Impact**: Affects insight generation, user notifications

### Data Management

6. **Historical State Tracking**
   - **Question**: Should Compass track historical states?
   - **Options**:
     - No history (current state only)
     - Snapshot on significant changes (e.g., >10% drift change)
     - Full version history (every change)
     - Time-series data (daily/weekly snapshots)
   - **Recommendation**: No history for MVP, add snapshots later
   - **Impact**: Affects storage, query complexity, analytics capabilities

7. **Data Retention Policy**
   - **Question**: How long should Compass history be retained?
   - **Options**:
     - Indefinite (no deletion)
     - Time-based (e.g., 2 years)
     - Size-based (e.g., last 100 snapshots)
     - User-configurable
   - **Recommendation**: N/A for MVP (no history), decide when adding history
   - **Impact**: Affects storage costs, compliance, user experience

### Integration Patterns

8. **Artifact Analysis Scope**
   - **Question**: Which artifacts should Compass analyze?
   - **Options**:
     - All artifacts
     - Recent artifacts only (e.g., last 30 days)
     - Artifacts tagged with Compass-relevant tags
     - User-selected artifacts
   - **Recommendation**: Recent artifacts (last 30 days) for MVP
   - **Impact**: Affects analysis performance, relevance of insights

9. **Ritual Analysis Scope**
   - **Question**: Which rituals should Compass analyze?
   - **Options**:
     - All completed rituals
     - Recent rituals only (e.g., last 7 days)
     - Rituals with specific types/tags
     - User-selected rituals
   - **Recommendation**: Recent rituals (last 7 days) for MVP
   - **Impact**: Affects analysis performance, relevance of insights

### Error Handling & Resilience

10. **AI System Failure Handling**
    - **Question**: What happens when AI system is unavailable?
    - **Options**:
      - Return error (fail fast)
      - Return cached insights (if available)
      - Return rule-based insights (fallback)
      - Return empty insights (graceful degradation)
    - **Recommendation**: Rule-based fallback insights for MVP
    - **Impact**: Affects user experience, system reliability

11. **External System Unavailability**
    - **Question**: What happens when artifacts/rituals systems are unavailable?
    - **Options**:
      - Return error (fail fast)
      - Return Compass state without external context
      - Use cached external data (if available)
    - **Recommendation**: Return Compass state without external context (graceful degradation)
    - **Impact**: Affects system resilience, user experience

### API Design

12. **Update Granularity**
    - **Question**: Can users update individual quadrant properties or must they update entire quadrants?
    - **Options**:
      - Partial updates (update individual properties)
      - Full quadrant updates (replace entire quadrant)
      - Hybrid (partial updates, but validate full quadrant)
    - **Recommendation**: Partial updates with full quadrant validation
    - **Impact**: Affects API design, validation logic

13. **Batch Operations**
    - **Question**: Can users update multiple quadrants in a single operation?
    - **Options**:
      - Single quadrant only
      - Multiple quadrants in one request
      - Transactional updates (all or nothing)
    - **Recommendation**: Multiple quadrants in one request, transactional
    - **Impact**: Affects API design, consistency guarantees

---

## Review Checklist

Before proceeding with implementation, validate:

### Invariants
- [ ] All invariants are testable and enforceable
- [ ] Invariant violations are detectable and handled
- [ ] No conflicting invariants

### Hard Assumptions
- [ ] All hard assumptions are explicitly documented
- [ ] Impact of changing hard assumptions is understood
- [ ] Hard assumptions align with business requirements

### Soft Assumptions
- [ ] Soft assumptions have clear default values
- [ ] Soft assumptions can be changed without major refactoring
- [ ] Soft assumptions are documented for future reference

### Open Decisions
- [ ] All open decisions have been resolved OR
- [ ] Open decisions have clear "MVP default" choices
- [ ] Open decisions have documented rationale
- [ ] Open decisions have identified impact

---

## Next Steps

1. **Review this document** with stakeholders
2. **Resolve open design decisions** (choose MVP defaults)
3. **Validate hard assumptions** against business requirements
4. **Confirm soft assumptions** are acceptable defaults
5. **Verify invariants** are complete and non-conflicting
6. **Proceed to implementation** once all items are resolved

---

## Notes

- **MVP Philosophy**: When in doubt, choose the simplest option that maintains invariants
- **Future-Proofing**: Design for extensibility even if not implementing now
- **Documentation**: All decisions should be documented with rationale
- **Testing**: Invariants must be testable; hard assumptions should have integration tests

