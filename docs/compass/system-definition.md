# Compass System Definition

**Status**: Core System Architecture  
**Last Updated**: 2025-01-XX  
**Intent Lock**: Active — No UI/Components until system boundaries are stable

---

## Executive Summary

Compass is a **domain model** that tracks doctoral research progress across four quadrants: Problem Space, Knowledge Gap, Contribution, and Research Alignment. It serves as the **North Star** for all research activity, ensuring daily work remains aligned with the ultimate contribution goal.

Compass is **not** a UI component, not a feature, not a page. It is a **long-lived system** with strict invariants that must survive years of evolution.

---

## 1. Domain Model

### 1.1 Core Entities

#### `Compass`
The root aggregate. A Compass belongs to a single researcher (user) and represents their current understanding of their doctoral work.

**Identity**: `CompassId` (UUID, user-scoped)

**Owned Entities**:
- Four `Quadrant` instances (one per quadrant type)
- `CompassMetrics` (derived state)
- `CompassInsights` (generated recommendations)

**Lifecycle**:
- Created when researcher first defines their problem statement
- Updated through explicit researcher actions or derived from artifacts
- Never deleted (archived if research direction changes)

#### `Quadrant`
One of four fixed domains of doctoral research tracking.

**Types** (invariant set):
- `problem`: Problem Space — "What problem are you really solving?"
- `gap`: Knowledge Gap — "What is missing in the existing literature?"
- `contribution`: Your Contribution — "What novel value are you adding?"
- `alignment`: Research Alignment — "How well do your actions match your goals?"

**Properties**:
- `id`: QuadrantId (one of the four types)
- `progress`: 0–100 (completion/development level)
- `clarity`: 0–100 (how well-defined this quadrant is)
- `momentum`: -100 to 100 (rate of change, positive = improving)
- `lastUpdated`: Timestamp
- `insights`: string[] (AI-generated observations)
- `risks`: string[] (identified threats to this quadrant)

**Invariants**:
- All four quadrants must exist for a valid Compass
- `progress`, `clarity`, `momentum` must be within their defined ranges
- `lastUpdated` must be ≤ current time

#### `CompassMetrics`
Derived metrics computed from quadrant states.

**Properties**:
- `overallAlignment`: 0–100 (how well quadrants align with each other)
- `researchDrift`: 0–100 (0 = perfectly aligned, 100 = severe drift)
- `weeklyMomentum`: -100 to 100 (aggregate momentum across all quadrants)

**Computation Rules**:
- `overallAlignment`: Weighted average of quadrant clarity, adjusted for coherence
- `researchDrift`: Inverse of alignment, with penalties for quadrant divergence
- `weeklyMomentum`: Sum of quadrant momentums, normalized

**Invariants**:
- Metrics are **derived**, never directly set
- Metrics must be recalculated when any quadrant changes
- Metrics must be consistent with quadrant states

#### `CompassInsights`
AI-generated recommendations and observations.

**Properties**:
- `aiInsights`: string[] (contextual observations)
- `nextBestAction`: string | null (single recommended action)

**Generation Rules**:
- Generated from quadrant states, metrics, and external context (artifacts, rituals)
- Must be actionable and specific
- Must respect researcher's current phase (early vs. late stage)

---

### 1.2 Value Objects

#### `QuadrantId`
Type-safe identifier for quadrants.  
**Values**: `"problem" | "gap" | "contribution" | "alignment"`  
**Invariant**: Must be one of the four fixed values.

#### `ProgressScore`
Integer 0–100 representing completion/development level.  
**Invariant**: Must be within [0, 100].

#### `ClarityScore`
Integer 0–100 representing definition quality.  
**Invariant**: Must be within [0, 100].

#### `MomentumScore`
Integer -100 to 100 representing rate of change.  
**Invariant**: Must be within [-100, 100].

#### `AlignmentScore`
Integer 0–100 representing overall coherence.  
**Invariant**: Must be within [0, 100].

#### `DriftScore`
Integer 0–100 representing misalignment (0 = perfect).  
**Invariant**: Must be within [0, 100].

---

### 1.3 Domain Events

Events that Compass emits when state changes:

- `CompassCreated` — Initial Compass established
- `QuadrantUpdated` — Any quadrant property changed
- `MetricsRecalculated` — Derived metrics updated
- `InsightsGenerated` — New AI insights available
- `DriftDetected` — Research drift threshold exceeded
- `AlignmentImproved` — Overall alignment increased significantly

**Note**: Events are for future extensibility (analytics, notifications). Not required for MVP.

---

## 2. System Boundaries

### 2.1 What Compass Owns

Compass **owns** and is **authoritative** for:

1. **Quadrant definitions** — The four fixed quadrants and their metadata (title, description, color, icon)
2. **Quadrant state** — Progress, clarity, momentum, insights, risks for each quadrant
3. **Compass metrics** — Overall alignment, drift, weekly momentum
4. **Compass insights** — AI-generated recommendations
5. **Compass persistence** — Storage and retrieval of Compass state

### 2.2 What Compass Does NOT Own

Compass **does not own** but may **read**:

1. **Artifacts** — Research notes, drafts, literature reviews (owned by Research Hub)
2. **Rituals** — Daily/weekly check-ins (owned by Rituals system)
3. **Wins** — Progress log entries (owned by Wins system)
4. **User identity** — Authentication and user management (owned by Auth system)

### 2.3 Integration Points

Compass **integrates with** (but does not control):

1. **Research Hub** — Reads artifacts to derive quadrant insights
2. **AI System** — Generates insights and recommendations
3. **Rituals System** — Receives alignment signals from ritual completions
4. **Knowledge Graph** — Provides context for AI generation

**Integration Pattern**: Compass is a **read consumer** of external systems. It does not modify artifacts, rituals, or wins. It only reads them to inform its own state.

---

## 3. Inputs

### 3.1 Explicit Researcher Inputs

**Direct Updates** (researcher explicitly modifies Compass):

1. `updateQuadrant(quadrantId, updates)` — Researcher edits quadrant properties
   - Input: `{ progress?, clarity?, insights?, risks? }`
   - Validation: Scores must be in valid ranges
   - Side effect: Triggers metrics recalculation

2. `setProblemStatement(text)` — Researcher defines their problem
   - Input: `string` (problem description)
   - Side effect: Updates `problem` quadrant clarity and insights

3. `setGapStatement(text)` — Researcher defines knowledge gap
   - Input: `string` (gap description)
   - Side effect: Updates `gap` quadrant clarity and insights

4. `setContributionStatement(text)` — Researcher defines contribution
   - Input: `string` (contribution description)
   - Side effect: Updates `contribution` quadrant clarity and insights

### 3.2 Derived Inputs (Automatic)

**Artifact Analysis** (Compass reads artifacts and infers state):

1. `analyzeArtifacts(artifacts[])` — Compass analyzes research artifacts
   - Input: Array of artifacts from Research Hub
   - Process: AI analysis to extract quadrant-relevant signals
   - Output: Updates to quadrant insights, risks, and momentum

2. `analyzeRitualCompletion(ritual)` — Compass reads ritual completion
   - Input: Completed ritual from Rituals system
   - Process: Assess alignment between ritual action and Compass goals
   - Output: Updates to `alignment` quadrant momentum

3. `analyzeWeeklyActivity(activity)` — Compass reads weekly activity summary
   - Input: Weekly activity data (time spent, artifacts created, etc.)
   - Process: Compute weekly momentum vectors
   - Output: Updates to quadrant momentums and weekly metrics

### 3.3 AI-Generated Inputs

**Insight Generation** (AI system generates recommendations):

1. `generateInsights(compassState, context)` — AI generates insights
   - Input: Current Compass state + external context (artifacts, rituals)
   - Process: AI analysis of alignment, drift, and opportunities
   - Output: Updates to `aiInsights` and `nextBestAction`

---

## 4. Outputs

### 4.1 Primary Outputs

**CompassState** — The complete, current state of a Compass:

```typescript
{
  quadrants: Record<QuadrantId, QuadrantData>;
  overallAlignment: AlignmentScore;
  researchDrift: DriftScore;
  weeklyMomentum: MomentumScore;
  nextBestAction: string | null;
  aiInsights: string[];
}
```

**Usage**: Consumed by UI components, API endpoints, AI system context.

### 4.2 Secondary Outputs

**Quadrant Snapshot** — State of a single quadrant:
- Used for focused views and detailed analysis

**Metrics Summary** — Just the derived metrics:
- Used for dashboards and quick status checks

**Insights Feed** — Just the AI insights:
- Used for recommendation panels

**Drift Warning** — Alert when drift exceeds threshold:
- Used for notifications and warnings

### 4.3 Output Guarantees

1. **Consistency**: All outputs are derived from the same source of truth
2. **Freshness**: Outputs reflect the latest state (no stale data)
3. **Completeness**: All four quadrants are always present
4. **Validity**: All scores are within their defined ranges

---

## 5. Responsibilities

### 5.1 Core Responsibilities

1. **Maintain Quadrant State**
   - Store and update quadrant properties
   - Enforce invariants (ranges, completeness)
   - Track last updated timestamps

2. **Compute Derived Metrics**
   - Calculate overall alignment from quadrant states
   - Calculate research drift from alignment
   - Calculate weekly momentum from quadrant momentums
   - Ensure metrics are always consistent with quadrants

3. **Generate Insights**
   - Analyze quadrant states for patterns
   - Identify risks and opportunities
   - Recommend next best actions
   - Integrate external context (artifacts, rituals) when available

4. **Persist State**
   - Save Compass state to durable storage
   - Load Compass state for a user
   - Handle missing data gracefully (fallback states)

5. **Validate Inputs**
   - Ensure all scores are in valid ranges
   - Ensure all required quadrants exist
   - Reject invalid updates

### 5.2 Non-Responsibilities

Compass is **NOT responsible** for:

1. **Rendering UI** — UI components consume Compass outputs
2. **Managing Artifacts** — Research Hub owns artifacts
3. **Managing Rituals** — Rituals system owns rituals
4. **User Authentication** — Auth system handles users
5. **AI Model Selection** — AI system decides which model to use
6. **Notification Delivery** — Notification system handles alerts

---

## 6. Invariants

### 6.1 Structural Invariants

1. **Four Quadrants Required**
   - A Compass must have exactly four quadrants: `problem`, `gap`, `contribution`, `alignment`
   - Missing quadrants are invalid
   - Extra quadrants are invalid

2. **Score Ranges**
   - `progress`: [0, 100]
   - `clarity`: [0, 100]
   - `momentum`: [-100, 100]
   - `overallAlignment`: [0, 100]
   - `researchDrift`: [0, 100]
   - `weeklyMomentum`: [-100, 100]

3. **Timestamps**
   - `lastUpdated` for each quadrant must be ≤ current time
   - `lastUpdated` must be set when quadrant changes

### 6.2 Consistency Invariants

1. **Metrics Derivation**
   - `overallAlignment` must be computed from quadrant states
   - `researchDrift` must be inverse of alignment (with penalties)
   - `weeklyMomentum` must be sum of quadrant momentums
   - Metrics must be recalculated when any quadrant changes

2. **Quadrant Completeness**
   - All quadrants must have `id`, `title`, `description`
   - All quadrants must have `progress`, `clarity`, `momentum`
   - All quadrants must have `lastUpdated`

### 6.3 Business Logic Invariants

1. **Alignment-Drift Relationship**
   - `researchDrift` = 100 - `overallAlignment` (base case)
   - Additional drift penalties for quadrant divergence
   - Drift cannot be negative

2. **Momentum Consistency**
   - `weeklyMomentum` should reflect recent quadrant momentum changes
   - Negative momentum in one quadrant can offset positive in another

3. **Insight Validity**
   - `aiInsights` must be non-empty strings
   - `nextBestAction` must be actionable (not vague)
   - Insights must be relevant to current Compass state

---

## 7. Extensibility

### 7.1 Extension Points

1. **Quadrant Types** (NOT extensible in MVP)
   - Current: Fixed set of four quadrants
   - Future: May allow custom quadrants (requires schema migration)
   - **Decision**: Keep fixed for MVP to maintain simplicity

2. **Metrics Calculation** (Extensible)
   - Current: Simple weighted averages
   - Future: Custom algorithms, machine learning models
   - **Pattern**: Strategy pattern for metric calculators

3. **Insight Generation** (Extensible)
   - Current: AI-generated insights
   - Future: Multiple insight providers, rule-based insights
   - **Pattern**: Plugin architecture for insight generators

4. **Integration Sources** (Extensible)
   - Current: Artifacts, rituals
   - Future: Calendar events, email, citations, collaboration data
   - **Pattern**: Adapter pattern for external data sources

### 7.2 Migration Strategy

When extending Compass:

1. **Schema Changes**
   - Add new fields as nullable initially
   - Migrate existing data with sensible defaults
   - Never remove fields (deprecate instead)

2. **Algorithm Changes**
   - Version metric calculation algorithms
   - Support multiple algorithms simultaneously
   - A/B test new algorithms before full rollout

3. **Integration Changes**
   - New integrations must not break existing ones
   - Use feature flags for new integrations
   - Maintain backward compatibility for API consumers

### 7.3 Future Considerations

**Not in MVP, but designed for**:

1. **Historical Tracking** — Version history of Compass state
2. **Multi-User Compass** — Collaborative research projects
3. **Compass Templates** — Pre-configured Compass for different research types
4. **Compass Comparison** — Compare Compass states over time
5. **Export/Import** — Backup and restore Compass state

---

## 8. Data Flow

### 8.1 Read Flow

```
UI Component → API Endpoint → Compass Service → Database
                                    ↓
                              CompassState (output)
```

### 8.2 Write Flow

```
Researcher Input → API Endpoint → Compass Service → Validation
                                                      ↓
                                              Update Quadrants
                                                      ↓
                                              Recalculate Metrics
                                                      ↓
                                              Generate Insights
                                                      ↓
                                              Persist to Database
                                                      ↓
                                              Return Updated State
```

### 8.3 Derived Update Flow

```
External System (Artifacts/Rituals) → Compass Service → Analyze
                                                          ↓
                                                    Update Quadrants
                                                          ↓
                                                    Recalculate Metrics
                                                          ↓
                                                    Generate Insights
                                                          ↓
                                                    Persist to Database
```

---

## 9. Assumptions

### 9.1 Current Assumptions

1. **Single Researcher per Compass**
   - One Compass per user
   - No shared/team Compass (future consideration)

2. **Four Fixed Quadrants**
   - Quadrants are not user-configurable
   - Quadrant metadata (title, description, color, icon) is fixed

3. **Supabase as Primary Storage**
   - Compass state stored in `compass_objects` table
   - User-scoped via `user_id` column

4. **AI System Integration**
   - AI system is available for insight generation
   - AI system can analyze artifacts and rituals

5. **Synchronous Updates**
   - Compass updates are synchronous (no async processing)
   - Metrics are computed on-demand, not pre-computed

### 9.2 Explicit Uncertainties

1. **Update Frequency**
   - How often should Compass analyze artifacts automatically?
   - Should there be a manual "refresh" trigger?

2. **Insight Freshness**
   - How often should AI insights be regenerated?
   - Should insights be cached or always fresh?

3. **Drift Thresholds**
   - What drift level triggers warnings?
   - Should warnings be configurable per user?

4. **Historical Data**
   - Should Compass track historical states?
   - How long should history be retained?

---

## 10. Scope Constraints

### 10.1 In Scope (MVP)

1. ✅ Four fixed quadrants with progress/clarity/momentum
2. ✅ Derived metrics (alignment, drift, momentum)
3. ✅ AI-generated insights and next best action
4. ✅ Persistence to Supabase
5. ✅ Integration with artifacts and rituals (read-only)
6. ✅ API endpoints for read/write operations

### 10.2 Out of Scope (Future)

1. ❌ Custom quadrants
2. ❌ Historical tracking/versioning
3. ❌ Multi-user/team Compass
4. ❌ Real-time notifications
5. ❌ Compass templates
6. ❌ Export/import functionality
7. ❌ Advanced analytics/visualizations

---

## 11. Implementation Notes

### 11.1 File Structure

```
src/lib/compass/
  ├── domain/
  │   ├── compass.ts           # Compass aggregate root
  │   ├── quadrant.ts          # Quadrant entity
  │   ├── metrics.ts           # Metrics value objects
  │   └── types.ts             # Domain types
  ├── services/
  │   ├── compass-service.ts   # Core business logic
  │   ├── metrics-calculator.ts # Metrics computation
  │   └── insight-generator.ts  # AI insight generation
  ├── repositories/
  │   └── compass-repository.ts # Data persistence
  └── integrations/
      ├── artifacts-adapter.ts  # Read artifacts
      └── rituals-adapter.ts   # Read rituals
```

### 11.2 API Endpoints

```
GET  /api/compass/summary      # Get current Compass state
POST /api/compass/update       # Update quadrant(s)
POST /api/compass/analyze      # Trigger artifact analysis
POST /api/compass/insights     # Generate new insights
```

### 11.3 Database Schema

```sql
CREATE TABLE compass_objects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quadrants JSONB NOT NULL,
  overall_alignment INTEGER NOT NULL CHECK (overall_alignment >= 0 AND overall_alignment <= 100),
  research_drift INTEGER NOT NULL CHECK (research_drift >= 0 AND research_drift <= 100),
  weekly_momentum INTEGER NOT NULL CHECK (weekly_momentum >= -100 AND weekly_momentum <= 100),
  next_best_action TEXT,
  ai_insights TEXT[],
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

---

## 12. Success Criteria

A successful Compass system:

1. ✅ Maintains consistent state across all operations
2. ✅ Enforces all invariants (no invalid states)
3. ✅ Computes metrics accurately from quadrant states
4. ✅ Generates actionable insights
5. ✅ Integrates cleanly with external systems (read-only)
6. ✅ Handles missing data gracefully (fallback states)
7. ✅ Survives schema migrations and algorithm changes
8. ✅ Provides clear API for UI consumption

---

## Next Steps

1. **Review and validate** this system definition
2. **Implement domain model** (entities, value objects, invariants)
3. **Implement services** (business logic, metrics calculation)
4. **Implement repository** (persistence layer)
5. **Implement integrations** (artifacts, rituals adapters)
6. **Implement API endpoints** (read/write operations)
7. **Write tests** (unit tests for domain logic, integration tests for API)
8. **Document API** (OpenAPI/Swagger spec)

**Only after system is stable**: Build UI components that consume Compass outputs.

