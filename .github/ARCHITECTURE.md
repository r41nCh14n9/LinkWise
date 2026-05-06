# .github/ Agent-Skill Architecture

## 📐 Design Philosophy: Separating Framework from Content

This `.github/` structure implements a **generic, reusable framework** that works independently from project-specific content. All project data is separated into `docs/` folder.

---

## 🎯 Core Principle: Deidentification

**`.github/` contains:**
- ✅ Generic agent definitions (no project names)
- ✅ Reusable skill implementations (no specific examples)
- ✅ Framework for how agents work together
- ✅ References to `docs/` for all concrete content

**`docs/` contains:**
- ✅ Project-specific outputs from agents
- ✅ Reference materials and guidelines
- ✅ Templates and examples for this project
- ✅ Input requirements for each agent

---

## 🏗️ Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    .github/ (Generic Framework)                  │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  agents/                       skills/                          │
│  ├── plan.agent.md             ├── plan/                        │
│  ├── reference.agent.md        ├── reference/                   │
│  ├── sa.agent.md               ├── sa/                          │
│  ├── sd.agent.md               ├── sd/                          │
│  ├── development.agent.md      ├── development/                 │
│  ├── review.agent.md (NEW)     ├── review/ (NEW)               │
│  └── test.agent.md             └── test/                        │
│                                                                  │
│  All reference docs/ folder for:                                │
│  - Output location: docs/*/                                     │
│  - Input references: docs/reference/                            │
│  - Guidelines: docs/reference/guidelines/                       │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
                               ↕
                       (references only)
                               ↕
┌──────────────────────────────────────────────────────────────────┐
│                   docs/ (Project Content)                        │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  plans/              reference/ (consumed by all agents)         │
│  ├── active/         ├── guidelines/                             │
│  ├── completed/      │   ├── GUIDELINES-Tech-Stack-v1.md        │
│  └── templates/      │   ├── GUIDELINES-Naming-Convention-v1.md │
│                      │   ├── GUIDELINES-Coding-Standards-v1.md  │
│  analysis/           │   ├── GUIDELINES-Dev-Workflow-v1.md      │
│  ├── requirements/   │   └── GUIDELINES-Performance-Security-v1 │
│  └── system-analysis/├── templates/                             │
│                      │   ├── TEMPLATE-Component.ts              │
│  design/             │   ├── TEMPLATE-Service.ts                │
│  ├── architecture/   │   └── (other templates)                  │
│  ├── components/     └── examples/                              │
│  ├── apis/               ├── good/                              │
│  ├── database/           └── anti-patterns/                     │
│  └── diagrams/                                                  │
│                      implementation/                            │
│  review/             ├── plans/                                 │
│  ├── code-reviews/   ├── code-records/                          │
│  ├── design-reviews/ ├── review-guides/                         │
│  └── req-reviews/    └── integration-guides/                    │
│                                                                  │
│  testing/            (all outputs from agents)                  │
│  ├── integration/                                               │
│  ├── user/                                                      │
│  └── unit/                                                      │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📊 Agent Output Definitions

### Reference Agent
**Output Location:** `docs/reference/`

**Purpose:** Single source of truth for all project standards. Consumed by ALL other agents.

**Produces:**

1. **Guidelines** (`docs/reference/guidelines/`)
   - `GUIDELINES-Tech-Stack-v*.md` - Technology stack and versions
   - `GUIDELINES-Naming-Convention-v*.md` - Naming rules and file organization
   - `GUIDELINES-Coding-Standards-v*.md` - Code style and quality standards
   - `GUIDELINES-Development-Workflow-v*.md` - Git flow, CI/CD process
   - `GUIDELINES-Performance-Security-v*.md` - Performance and security best practices
   - `GUIDELINES-Architecture-Decisions-v*.md` - Architecture Decision Records (ADR)

2. **Templates** (`docs/reference/templates/`)
   - `TEMPLATE-Component.ts/tsx` - Component implementation template
   - `TEMPLATE-Service.ts` - Business logic service template
   - `TEMPLATE-Unit-Test.spec.ts` - Unit test template
   - `TEMPLATE-Integration-Test.spec.ts` - Integration test template
   - `TEMPLATE-API-Endpoint.ts` - REST API endpoint template
   - `TEMPLATE-README.md` - Documentation template

3. **Examples** (`docs/reference/examples/`)
   - `examples/good/EXAMPLE-*.ts` - Reference implementations
   - `examples/anti-patterns/ANTIPATTERN-*.ts` - What to avoid

**Consumed By:** All other agents (Plan, SA, SD, Development, Test)

---

### Plan Agent
**Output Location:** `docs/plans/`
**Produces:**
- Project timeline and milestones
- Resource allocation plans
- Risk assessments

**Input References:**
- `docs/reference/guidelines/` (naming conventions, workflow guidelines)

---

### SA (System Analysis) Agent
**Output Location:** `docs/analysis/`
**Produces (Minimum):**
- `requirements/` - Functional and non-functional requirements
- `requirements/` - Requirements specification documents

**Produces (Optional):**
- `system-analysis/` - System architecture analysis and design decisions
  - Existing system architecture analysis (integration scenarios)
  - Current system architecture snapshot (development reference)
  - Reverse engineering documents (legacy system analysis)
  - Architecture decision records (future reference and updates)

**Input References:**
- `docs/reference/guidelines/` (tech stack, architecture guidelines)
- `docs/plans/` (project context and timeline)

---

### SD (System Design) Agent
**Output Location:** `docs/design/`
**Produces:**
- `architecture/` - System architecture design
- `components/` - Component specifications
- `apis/` - API specifications
- `database/` - Database schema design
- `diagrams/` - Architecture and interaction diagrams

**Input References:**
- `docs/reference/guidelines/` (design standards, performance/security)
- `docs/analysis/` (requirements and system analysis)

---

### Development Agent
**Output Location:** `docs/implementation/`

**Purpose:** Transform requirements and designs into working code following all project standards.

**Produces:**

1. **Plans** (`docs/implementation/plans/`)
   - `IMPL-PLAN-[Feature]-v*.md` - Implementation approach and breakdown
   - `IMPL-PROGRESS-[Feature]-v*.md` - Progress tracking
   - `IMPL-DECISIONS-[Feature]-v*.md` - Technical decisions

2. **Code Records** (`docs/implementation/code-records/`)
   - `CODE-[Component]-[Feature]-v*.md` - Implementation documentation
   - Includes code snippets, patterns used, design decisions

3. **Review Guides** (`docs/implementation/review-guides/`)
   - `REVIEW-CHECKLIST-[Feature]-v*.md` - Code review checklist
   - `CODE-REVIEW-GUIDE-[Feature]-v*.md` - Review guidance
   - `QA-CHECKLIST-[Feature]-v*.md` - Quality assurance checklist

4. **Integration Guides** (`docs/implementation/integration-guides/`)
   - `INTEGRATION-GUIDE-[Feature]-v*.md` - Integration with system
   - `SETUP-LOCAL-DEV-[Feature]-v*.md` - Local development setup
   - `DEPLOYMENT-NOTES-[Feature]-v*.md` - Deployment considerations

**Input References (ALL MANDATORY):**
- `docs/reference/guidelines/` (ALL guidelines - strict adherence required)
- `docs/reference/templates/` (Code templates)
- `docs/reference/examples/` (Reference implementations)
- `docs/design/` (Architecture and design specs)
- `docs/analysis/requirements/` (Functional and non-functional requirements)
- `docs/plans/active/` (Project context)

**Key Characteristics:**
- Must read ALL Reference Agent materials before code generation
- Code must follow guidelines, templates, and standards exactly
- Implementation traceable back to requirements and design
- Produces comprehensive review materials for quality assurance
- Documents all technical decisions and rationale

---

### Review Agent (NEW ✨)
**Output Location:** `docs/review/`

**Purpose:** Conduct comprehensive static analysis to verify code, design, and requirements compliance.

**Produces:**

1. **Code Reviews** (`docs/review/code-reviews/`)
   - `CODE-REVIEW-[Component]-v*.md` - Code quality and standards compliance
   - Includes findings, recommendations, and action items

2. **Design Reviews** (`docs/review/design-reviews/`)
   - `DESIGN-REVIEW-[Module]-v*.md` - Architecture and design validation
   - Includes pattern verification, scalability, security assessment

3. **Requirements Reviews** (`docs/review/requirements-reviews/`)
   - `REQUIREMENTS-REVIEW-[Feature]-v*.md` - Requirements coverage and traceability
   - Includes implementation status matrix, gaps identification

**Input References:**
- `docs/reference/guidelines/` (ALL guidelines - for compliance verification)
- `docs/reference/examples/` (good practices and anti-patterns)
- `docs/implementation/` (code records and implementation plans)
- `docs/design/` (architecture and design specifications)
- `docs/analysis/requirements/` (functional and non-functional requirements)

**Key Characteristics:**
- Conducts static analysis (no code execution)
- References every finding back to specific guidelines
- Provides actionable, concrete feedback
- Creates traceability matrices for requirements
- Generates compliance scores
- Issues are classified (Critical/Major/Minor)

---

### Test Agent
**Output Location:** `docs/testing/`
**Produces:**
- `integration/` - Integration test plans and cases
- `user/` - User acceptance test cases
- `unit/` - Unit test documentation (optional)

**Input References:**
- `docs/reference/guidelines/` (testing guidelines, test templates)
- `docs/design/` (design specifications for test planning)
- `docs/review/` (review findings and issues for test planning)
- `docs/implementation/integration-guides/` (integration test setup)

---

## 🔄 Complete Agent Data Flow

```
Reference Agent (Maintains Standards)
    ↓ produces
    docs/reference/
    ├── guidelines/ (Tech stack, naming, coding standards, workflow, security/performance)
    ├── templates/ (Code and test templates)
    └── examples/ (Good implementations, anti-patterns)
        ↓ consumed by all agents
        ├────→ Plan Agent (workflow guidelines, naming conventions)
        ├────→ SA Agent (tech stack, architecture guidelines)
        ├────→ SD Agent (design standards, performance/security guidelines)
        ├────→ Development Agent (MUST follow ALL guidelines strictly)
        ├────→ Review Agent (guidelines for compliance verification)
        └────→ Test Agent (testing guidelines, test templates)
            ↓
Plan Agent → docs/plans/ (project timeline)
    ↓ provides context for
SA Agent → docs/analysis/ (functional/non-functional requirements)
    ↓ provides input for
SD Agent → docs/design/ (architecture and specifications)
    ↓ provides design for
Development Agent → docs/implementation/ (working code & documentation)
    ↓ provides implementation for
Review Agent → docs/review/ (code/design/requirements reviews)
    ├─ CODE-REVIEW-*.md (code compliance issues)
    ├─ DESIGN-REVIEW-*.md (architecture issues)
    └─ REQUIREMENTS-REVIEW-*.md (coverage gaps)
    ↓ provides review feedback for
Development Agent (v2) ← if issues found, iterates on fixes
    OR
Test Agent → docs/testing/ (test plans and cases)
    ↓ provides test results for
Team (approval/merge/deploy)
    ↓
    Complete end-to-end workflow with quality gates
```

---



```
Agent Usage (Generic)
        ↓
    Reads from docs/reference/
        ↓
    Processes instructions (from .github/)
        ↓
    Generates output
        ↓
    Saves to docs/[output-folder]/
        ↓
    Other agents reference docs/
        ↓
    Build comprehensive system
```

---

## 📋 How Each Layer Works

### Layer 1: `.github/agents/` (Generic Agent Definitions)

**What it contains:**
```markdown
# example.agent.md
---
name: example
description: "Use when: [generic use cases]"  ← No project name
---

## Role & Responsibility
The agent [does generic things]

## Output Location & Format
**Output Directory:** `docs/folder/`
**Input References:** 
- From: `docs/reference/`
- Guidelines: `docs/reference/guidelines/`
```

**Key principle:** Agent definitions never mention specific projects. They point to `docs/` structure instead.

---

### Layer 2: `.github/skills/` (Reusable Skill Implementations)

**What it contains:**
```markdown
# SKILL.md
---
name: example
description: "Use when: [generic capabilities]"  ← Framework, not project
---

## How to Use
/example [Your input]

Examples:  ← Generic examples, not project-specific
- /example Do generic thing
```

**Key principle:** Skill files contain reusable code and patterns, not project-specific examples.

---

### Layer 3: `docs/reference/` (Project Context)

**What it contains:**
- `docs/reference/requirements/` - Project requirements
- `docs/reference/guidelines/` - Team-specific conventions
- `docs/reference/templates/` - Customized templates for this project
- `docs/reference/examples/` - Project examples

**Purpose:** When agents need to understand project context, they reference materials here.

---

### Layer 4: `docs/[output-folder]/` (Agent Outputs)

**What it contains:**
- `docs/plans/` - Output from Plan Agent
- `docs/analysis/` - Output from SA Agent (requirements analysis, system analysis)
- `docs/design/` - Output from SD Agent (architecture, components, APIs, database)
- `docs/testing/` - Output from Test Agent (test plans, test cases)

**Purpose:** Where each agent saves its generated content.

**Data Flow Between Agents:**
```
Plan Agent
    ↓ output → docs/plans/
SA Agent
    ↓ reads docs/plans/ as context
    ↓ output → docs/analysis/
SD Agent
    ↓ reads docs/analysis/ + docs/plans/ as context
    ↓ output → docs/design/
Test Agent
    ↓ reads docs/plans/ + docs/design/ as context
    ↓ output → docs/testing/
```

---

## 🔀 Making This Reusable

### For Another Project

**Option 1: Copy the Framework**
```bash
# Copy just the .github/ folder
cp -r YourProject/.github/ NewProject/.github/

# NewProject has same agent/skill structure
# Create new docs/reference/ with your project context
# Everything else works automatically
```

**Option 2: Git Submodule (Shared Framework)**
```bash
# If multiple projects share same framework
git submodule add git@repo:org/agent-skill-framework .github
```

### Customization Points

When reusing `.github/` in a new project:

1. **Leave agents & skills unchanged** ← They're generic
2. **Customize `docs/reference/`** ← Your project context
3. **Create `docs/plans/`, `docs/analysis/`, etc.** ← For outputs
4. Update `.github/skills/[skill]/assets/` if you have custom templates

---

## 📝 Naming & Positioning Pattern

**Generic Framework Location:**
```
.github/agents/plan.agent.md         ← Never says "for Project X"
.github/skills/plan/SKILL.md         ← Describes what the skill does, generically
.github/skills/plan/assets/template.md  ← Reusable template structure
```

**Project Content Location:**
```
docs/reference/requirements/          ← Project requirements
docs/reference/guidelines/            ← Team conventions (optional)
docs/reference/templates/             ← Project-specific template examples
docs/plans/active/                    ← Where Plan Agent saves output
```

**Agent Instruction Pattern:**
```markdown
# In .github/agents/

Output Location: docs/[folder-name]/
- Generic folder structure
- No project-specific paths

Input References:
- From: docs/reference/
- Guidelines: docs/reference/guidelines/
```

---

## ✅ Checklist: Is Your `.github/` Truly Generic?

Use this to audit your framework:

- [ ] No project names in descriptions
- [ ] No project-specific examples in "How to Use"
- [ ] Output locations reference `docs/` generically
- [ ] Input references point to `docs/reference/`
- [ ] Guidelines referenced via `docs/reference/guidelines/`
- [ ] All concrete project content in `docs/` folder
- [ ] Framework would work for different project with different `docs/reference/`

---

## 🚀 Why This Matters

**Benefits:**

1. **Reusability** - Same `.github/` for multiple projects
2. **Maintainability** - Update framework in one place
3. **Clarity** - Clear separation of generic vs specific
4. **Scalability** - Can convert to shared package later
5. **Team Alignment** - Everyone knows where content belongs

**What You Can Do Now:**

- ✅ Copy `.github/` to a new project
- ✅ Share `.github/` as a template
- ✅ Document the framework in team wiki
- ✅ Train teams on the pattern

**What You Can Do Later:**

- 🔄 Convert to npm package: `@org/agent-framework`
- 🔄 Build company-wide agent registry
- 🔄 Create agent marketplace with versioning
- 🔄 Integrate with GitHub App for automatic setup

---

## 📚 Related Documentation

- [Agent Definitions](./agents/plan.agent.md)
- [Skill Implementations](./skills/plan/SKILL.md)
- [Documentation Hub](../docs/INDEX.md)
- [Reference Materials Structure](../docs/reference/README.md)
