# Documentation Architecture Summary

A complete guide to LinkWise's organized documentation structure with agent output locations and reference materials.

## 🏗️ Overall Architecture

```
docs/
├── INDEX.md (START HERE)
│
├── 📁 plans/                 ← Plan Agent Output
│   ├── active/               
│   ├── completed/            
│   └── templates/            
│
├── 📁 analysis/              ← SA Agent Output
│   ├── requirements/         
│   ├── nfr/                  
│   ├── mapping/              
│   └── reverse-engineering/  
│
├── 📁 design/                ← SD Agent Output
│   ├── architecture/         
│   ├── components/           
│   ├── apis/                 
│   ├── database/             
│   └── diagrams/             
│
├── 📁 tests/                 ← Test Agent Output
│   ├── plans/                
│   ├── cases/                
│   ├── integration/          
│   └── scripts/              
│
└── 📁 reference/             ← Agent Input References
    ├── requirements/         (Input data for analysis)
    ├── templates/            (All template types)
    ├── guidelines/           (Standards & best practices)
    ├── definitions/          (Business glossary)
    ├── examples/             (Reference implementations)
    └── external/             (Compliance & standards)
```

## 🔄 Complete Agent Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                        INPUT PHASE                              │
│                                                                  │
│  Team adds requirements and materials to docs/reference/        │
│  - Place DRAFT.md in requirements/                              │
│  - Add business glossary to definitions/                        │
│  - Document standards in guidelines/                            │
│                                                                  │
└─────────────────┬──────────────────────────────────────────────┘
                  │
                  v
┌─────────────────────────────────────────────────────────────────┐
│                      PLAN AGENT                                 │
│  Input: docs/reference/requirements/DRAFT.md                    │
│  Output: docs/plans/active/[ProjectName]-Plan.md               │
│  Uses: Templates, Guidelines                                    │
└─────────────────┬──────────────────────────────────────────────┘
                  │
                  v (Project plan provides context)
┌─────────────────────────────────────────────────────────────────┐
│                      SA AGENT                                   │
│  Input: docs/reference/requirements/ + plan                     │
│  Output: docs/analysis/requirements/ and nfr/                  │
│  Uses: Templates, Guidelines, Definitions                       │
│  Produces: [Requirements-Subject].md                            │
└─────────────────┬──────────────────────────────────────────────┘
                  │
         ┌────────┴────────┐
         v                 v
    ┌─────────────┐   ┌─────────────┐
    │ SD AGENT    │   │ Test AGENT  │
    │             │   │             │
    │ Input: SA   │   │ Input: SA + │
    │ Output:     │   │ Design      │
    │ docs/design/│   │ Output:     │
    │             │   │ docs/tests/ │
    └─────────────┘   └─────────────┘
         │                 │
         └────────┬────────┘
                  │
                  v
         All outputs feed back to:
      - Reference Materials
      - Project Tracking
      - Implementation Teams
```

## 📊 Agent I/O Matrix

### Input Sources
| Agent | Primary Input | Secondary Input | Reference Materials |
|-------|--------------|-----------------|-------------------|
| **Plan** | `docs/reference/requirements/` | Previous plans | Templates, Guidelines |
| **SA** | `docs/reference/requirements/` | Project plans | Templates, Guidelines, Definitions |
| **SD** | `docs/analysis/` | Project plans | Templates, Guidelines, Examples |
| **Test** | `docs/analysis/` + `docs/design/` | Project plans | Templates, Guidelines |

### Output Destinations
| Agent | Primary Output | Subfolder | Naming Pattern |
|-------|---------------|-----------|----------------|
| **Plan** | `docs/plans/` | `active/` | `[Project]-[Phase]-[Date].md` |
| **SA** | `docs/analysis/` | `requirements/`, `nfr/`, `mapping/` | `[Type]-[Subject]-[Version].md` |
| **SD** | `docs/design/` | `architecture/`, `components/`, `apis/` | `[Type]-[Name]-[Version].md` |
| **Test** | `docs/tests/` | `plans/`, `cases/`, `integration/` | `[Type]-[Module]-[Version].md` |

## 🎯 Usage Patterns

### Creating a Project Plan
```
1. Team prepares requirements
   → docs/reference/requirements/PROJECT-BRIEF.md

2. Plan Agent generates plan
   /plan Create a project plan for [Project] using the [template] template

3. Output saved to
   → docs/plans/active/[Project]-Plan-[Date].md
```

### Creating System Design
```
1. Plan Agent creates project plan
   → docs/plans/active/...

2. SA Agent creates analysis
   → docs/analysis/requirements/[Project]-Requirements.md

3. SD Agent creates design
   /sd Based on docs/analysis/, create architecture design

4. Output saved to
   → docs/design/architecture/[Component]-Architecture.md
   → docs/design/apis/[Service]-API-Spec.md
   → docs/design/database/[Schema]-Design.md
```

### Creating Test Plan
```
1. SA Agent creates analysis
   → docs/analysis/...

2. SD Agent creates design
   → docs/design/...

3. Test Agent creates test plan
   /test Based on docs/analysis/ and docs/design/, create test strategy

4. Output saved to
   → docs/tests/plans/[Module]-Test-Plan.md
   → docs/tests/cases/[Module]-Test-Cases.md
```

## 📚 Reference Materials Guide

### What to Populate

#### requirements/ folder
- **DRAFT.md** - Project idea/draft
- **REQUIREMENTS-*.md** - Detailed requirements
- **PROJECT-BRIEF-*.md** - High-level project scope

#### templates/ folder
- **project-plan-template.md** - From `.github/skills/plan/assets/`
- **requirement-template.md** - Your requirement doc structure
- **design-template.md** - Your design doc structure
- **test-plan-template.md** - Your test plan structure

#### guidelines/ folder
- **CODING-STANDARDS.md** - Code style guide
- **API-DESIGN-GUIDELINES.md** - REST API patterns
- **DATABASE-DESIGN-GUIDELINES.md** - Schema patterns
- **TESTING-STANDARDS.md** - QA procedures

#### definitions/ folder
- **GLOSSARY.md** - Business terms
- **TECHNICAL-TERMS.md** - Technical vocabulary
- **DATA-DEFINITIONS.md** - Field definitions

#### examples/ folder
- **EXAMPLE-[Component].md** - Reference implementation
- Document architecture, design decisions
- Include diagrams if helpful

#### external/ folder
- **COMPLIANCE-REQUIREMENTS.md** - Regulatory needs
- **SECURITY-STANDARDS.md** - Security best practices
- **API-STANDARDS.md** - OpenAPI specifications

## ✨ Key Features

### ✅ Centralized Documentation
- All agent outputs in one place
- Clear folder hierarchy by phase
- Easy to find and reference

### ✅ Organized by Agent
- Plan outputs → `docs/plans/`
- Analysis outputs → `docs/analysis/`
- Design outputs → `docs/design/`
- Test outputs → `docs/tests/`

### ✅ Reference Materials Available
- Agents can read from `docs/reference/`
- Templates ensure consistency
- Guidelines ensure quality

### ✅ Clear Workflow
- Plan → Analysis → Design → Testing
- Each phase builds on previous
- All artifacts documented

### ✅ Traceability
- Easy to trace requirement → analysis → design → test
- Links between documents
- Version control via git

## 🚀 Getting Started

### Step 1: Set Up Reference Materials
```bash
# Move/copy initial materials
mv docs/DRAFT.md docs/reference/requirements/DRAFT.md

# Copy templates
cp .github/skills/plan/assets/*.md docs/reference/templates/

# Create initial standards docs
touch docs/reference/guidelines/CODING-STANDARDS.md
touch docs/reference/definitions/GLOSSARY.md
```

### Step 2: Use Plan Agent
```bash
/plan Create project plan for LinkWise 2.0 based on docs/reference/requirements/DRAFT.md
```

### Step 3: Use SA Agent
```bash
/sa Analyze docs/reference/requirements/ and create comprehensive analysis
```

### Step 4: Use SD Agent
```bash
/sd Based on docs/analysis/, create system architecture and design
```

### Step 5: Use Test Agent
```bash
/test Create test strategy based on docs/analysis/ and docs/design/
```

## 📖 Documentation Hub

**Start with:** [docs/INDEX.md](./INDEX.md)

Provides:
- Complete folder structure
- Agent workflow diagram
- Quick links to all sections
- Setup checklist

## 🔗 Related Documentation

- [agents/plan.agent.md](./../.github/agents/plan.agent.md) - Plan Agent output location
- [agents/sa.agent.md](./../.github/agents/sa.agent.md) - SA Agent output location
- [agents/sd.agent.md](./../.github/agents/sd.agent.md) - SD Agent output location
- [agents/test.agent.md](./../.github/agents/test.agent.md) - Test Agent output location
- [skills/plan/SKILL.md](./../.github/skills/plan/SKILL.md) - Plan Skill output location
- [skills/sa/SKILL.md](./../.github/skills/sa/SKILL.md) - SA Skill output location
- [skills/sd/SKILL.md](./../.github/skills/sd/SKILL.md) - SD Skill output location
- [skills/test/SKILL.md](./../.github/skills/test/SKILL.md) - Test Skill output location

---

**Version:** 1.0  
**Last Updated:** May 2026  
**Architecture:** 4-Phase Agent Workflow with Centralized Documentation Hub
