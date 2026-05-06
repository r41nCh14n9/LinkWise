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
┌─────────────────────────────────────────────────────────────┐
│                    .github/ (Generic Framework)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  agents/                    skills/                        │
│  ├── plan.agent.md          ├── plan/                      │
│  ├── sa.agent.md            ├── sa/                        │
│  ├── sd.agent.md            ├── sd/                        │
│  └── test.agent.md          └── test/                      │
│                                                             │
│  All reference docs/ folder for:                           │
│  - Output location: docs/plans/, docs/analysis/, etc.      │
│  - Input references: docs/reference/                       │
│  - Guidelines: docs/reference/guidelines/                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                            ↕
                    (references only)
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                   docs/ (Project Content)                   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  plans/                     reference/                     │
│  ├── active/                ├── requirements/              │
│  ├── completed/             ├── guidelines/                │
│  └── templates/             ├── templates/                 │
│                             └── examples/                  │
│  analysis/                                                 │
│  ├── requirements/          design/                        │
│  ├── nfr/                   ├── architecture/              │
│  └── system-analysis/       ├── components/                │
│                             ├── apis/                      │
│  testing/                   ├── database/                  │
│  ├── integration/           └── diagrams/                  │
│  ├── user/                                                 │
│  └── unit/                                              │
│                                                             │
│  Project-specific content & team outputs                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## � Agent Output Definitions

### Plan Agent
**Output Location:** `docs/plans/`
**Produces:**
- Project timeline and milestones
- Resource allocation plans
- Risk assessments

### SA (System Analysis) Agent
**Output Location:** `docs/analysis/`
**Produces (Minimum):**
- `requirements/` - Functional and non-functional requirements
- `requirements/` - Requirements specification documents

**Produces (Optional):**
- `system-analysis/` - System architecture analysis and design decisions documentation
  - Existing system architecture analysis (for integration scenarios)
  - Current system architecture snapshot (for reference during development)
  - Reverse engineering documents (when analyzing legacy systems)
  - Architecture decision records (ADR) for future reference and updates

**Decision Rule:**
- ✅ Always produce requirements analysis
- ✅ Produce system analysis IF:
  - Working with existing systems or doing integrations
  - Analyzing legacy architectures for migration
  - Need to document current system state as reference for development teams
  - Want to maintain architecture decision records for future updates
- ✅ Skip system analysis IF: purely greenfield project with no existing systems and no documentation needs

### SD (System Design) Agent
**Output Location:** `docs/design/`
**Produces:**
- `architecture/` - System architecture design
- `components/` - Component specifications
- `apis/` - API specifications
- `database/` - Database schema design
- `diagrams/` - Architecture and interaction diagrams

### Test Agent
**Output Location:** `docs/testing/`
**Produces:**
- `integration/` - Integration test plans and cases
- `user/` - User acceptance test cases
- `unit/` - Unit test documentation (optional)

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
