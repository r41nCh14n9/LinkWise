# 📊 Diagram Standards for SA Agent Output

> **Scope:** Diagram specifications for System Analysis (SA) agent outputs
> **Apply To:** SA agent when generating analysis documents
> **Status:** Active
> **Extends:** `.github/skills/reference/assets/DIAGRAM-STANDARDS.md`

---

## 🎯 SA Diagram Focus

The SA agent generates diagrams for **requirements analysis and system behavior documentation**.

---

## 📐 Supported Diagram Types (SA)

### 1. **Sequence Diagrams** (Primary)

**Purpose:** Document user interactions, system flows, and message sequences

**Mermaid Format:**
```mermaid
sequenceDiagram
    participant User
    participant System
    participant Database
    
    User->>System: Request
    System->>Database: Query
    Database-->>System: Result
    System-->>User: Response
```

**Naming:** `FLOW-[ProcessName]-Sequence.md`

**Embedding Location:** `docs/analysis/requirements/`

**Example Use Cases:**
- User login flow
- Payment processing
- Data synchronization
- Error handling

---

### 2. **Process Flow Diagrams** (Secondary)

**Purpose:** Document workflows, decision trees, and business processes

**Mermaid Format:**
```mermaid
flowchart TD
    A[Start] --> B{Decision?}
    B -->|Yes| C[Process A]
    B -->|No| D[Process B]
    C --> E[End]
    D --> E
```

**Naming:** `PROCESS-[WorkflowName]-Flow.md`

**Embedding Location:** `docs/analysis/system-analysis/`

**Example Use Cases:**
- Task creation workflow
- Approval processes
- Data validation steps
- Integration workflows

---

### 3. **State Transition Diagrams** (Supporting)

**Purpose:** Document entity lifecycle, status transitions, and state machines

**Mermaid Format:**
```mermaid
stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Idle: Retry
```

**Naming:** `STATE-[Entity]-Lifecycle.md`

**Embedding Location:** `docs/analysis/system-analysis/`

**Example Use Cases:**
- Task status lifecycle (Created → In Progress → Completed)
- User states (Pending → Active → Suspended)
- Order processing states

---

## 🎨 SA-Specific Styling

### Color Conventions

```mermaid
graph TD
    A["Analysis Phase: #4A90E2"]:::analysis
    B["In Progress: #FF8C00"]:::progress
    C["Decision Point: #FFD700"]:::decision
    D["User Action: #7ED321"]:::user
    
    classDef analysis fill:#4A90E2,stroke:#0047AB,color:#fff
    classDef progress fill:#FF8C00,stroke:#FF6347,color:#fff
    classDef decision fill:#FFD700,stroke:#FFA500,color:#000
    classDef user fill:#7ED321,stroke:#5CA000,color:#000
```

### Actor/Entity Styling

```mermaid
sequenceDiagram
    participant User as 👤 User
    participant Frontend as 🖥️ Frontend
    participant API as 🔌 Backend API
    participant DB as 🗄️ Database
```

---

## 📋 Template: SA Document with Diagrams

```markdown
# Analysis: [Feature/Process Name]

## Overview
[Description of requirements]

## User Interaction Flow

\`\`\`mermaid
sequenceDiagram
    [Sequence diagram here]
\`\`\`

## Process Steps

\`\`\`mermaid
flowchart TD
    [Process flow diagram here]
\`\`\`

## Status Lifecycle

\`\`\`mermaid
stateDiagram-v2
    [State transitions here]
\`\`\`

## Functional Requirements
[Requirements listed]

## Non-Functional Requirements
[NFR specifications]
```

---

## ✅ SA Diagram Checklist

Before finalizing SA diagrams:

- [ ] All user interactions are documented
- [ ] Edge cases and error scenarios included
- [ ] Actor roles clearly identified (👤, 🖥️, 🔌, etc.)
- [ ] Message sequences are accurate and complete
- [ ] Decision points clearly shown with conditions
- [ ] State transitions cover all scenarios
- [ ] Diagram is embedded in markdown (not separate)
- [ ] Following SA naming convention
- [ ] Located in `docs/analysis/` folder

---

## 📚 Related

- [Framework: Diagram Standards](../reference/assets/DIAGRAM-STANDARDS.md)
- [SA Skill](../SKILL.md)
- [Output Location](../../../docs/analysis/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| v1 | 2026-05-06 | Initial SA diagram specifications |
