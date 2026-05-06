---
name: agents
description: "Quick guide for using 7 custom agents in your development workflow"
---

# Custom Agents - Quick Guide

👋 **New to agents?** Start with [How to Use](#-how-to-use) and the examples below.

📚 **Need technical details?** See [ARCHITECTURE.md](./ARCHITECTURE.md) for:
- Complete system design and philosophy
- Detailed file structure and organization
- Full agent input/output specifications
- Technical implementation details

---

## Available Agents (7-Agent System)

### 🎯 [Reference Agent](./agents/reference.agent.md) **[Foundation]**
**Role:** Standards Management & Guidelines Maintenance

**When to use:** Setting up project standards, creating guidelines, managing templates and examples

**Command:** `/reference Create [guidelines/templates/examples]`

📖 See [ARCHITECTURE.md § Reference Agent](./ARCHITECTURE.md#reference-agent) for output details

---

### 📋 [Plan Agent](./agents/plan.agent.md)
**Role:** Project Planning & Roadmap Generation

**When to use:** Starting new projects, creating project plans, phased roadmaps, timelines

**Command:** `/plan [project description]`

📖 See [ARCHITECTURE.md § Plan Agent](./ARCHITECTURE.md#plan-agent) for output details

---

### 📊 [System Analysis Agent (SA)](./agents/sa.agent.md)
**Role:** Requirements Analysis & System Documentation

**When to use:** Analyzing requirements, creating requirement mappings, documenting NFRs, analyzing existing systems

**Command:** `/sa [requirements/analysis task]`

📖 See [ARCHITECTURE.md § SA Agent](./ARCHITECTURE.md#sa-system-analysis-agent) for output details

---

### 🏗️ [System Design Agent (SD)](./agents/sd.agent.md)
**Role:** Technical Architecture & System Design

**When to use:** Designing architecture, creating component models, specifying APIs and data models

**Command:** `/sd [architecture/design task]`

📖 See [ARCHITECTURE.md § SD Agent](./ARCHITECTURE.md#sd-system-design-agent) for output details

---

### 💻 [Development Agent](./agents/development.agent.md) **[NEW]**
**Role:** Feature Implementation & Code Generation

**When to use:** Implementing features based on requirements and designs

**Command:** `/dev Implement [feature name]`

📖 See [ARCHITECTURE.md § Development Agent](./ARCHITECTURE.md#development-agent) for output details

---

### ✨ [Review Agent](./agents/review.agent.md) **[NEW]**
**Role:** Code & Design Quality Verification

**When to use:** Reviewing implementation for standards compliance, validating design

**Command:** `/review [code/design/requirements review]`

📖 See [ARCHITECTURE.md § Review Agent](./ARCHITECTURE.md#review-agent-new-) for output details

---

### ✅ [Test Agent](./agents/test.agent.md)
**Role:** Quality Assurance & Test Planning

**When to use:** Creating test plans, generating test cases, validating design against requirements

**Command:** `/test [test plan/test cases]`

📖 See [ARCHITECTURE.md § Test Agent](./ARCHITECTURE.md#test-agent) for output details

## 🔄 Workflow Overview

Complete development workflow with all 7 agents:

```
Reference Agent (Foundation - provides guidelines to all)
  ↓
IDEA/DRAFT → Plan → Analyze → Design → Implement → Review → Test → Deploy
   |        |       |         |        |           |        |
  /plan    /sa     /sd      /dev    /review    /test
```

**What happens at each stage:**
1. **/plan** - Create project timeline and milestones
2. **/sa** - Analyze requirements and document system (if needed)
3. **/sd** - Design architecture and components
4. **/dev** - Write code and generate implementation records
5. **/review** - Quality verification (code, design, requirements)
6. **/test** - Create test plans and test cases
7. **Deploy** - Ready for production

📖 See [ARCHITECTURE.md § Complete Workflow Integration](./ARCHITECTURE.md#-complete-workflow-integration) for detailed data flow and dependencies

## 🚀 How to Use

### Basic Workflow

1. **Open VS Code Copilot Chat**
2. **Type agent command** - `/reference`, `/plan`, `/sa`, `/sd`, `/dev`, `/review`, or `/test`
3. **Describe your task** - Be specific about what you need
4. **Agent handles it** - With full domain expertise

### Example: Complete Feature Implementation

```bash
# Step 1: Establish standards
/reference Create GUIDELINES-Naming-Convention for our project

# Step 2: Plan the work
/plan Generate roadmap for user authentication feature

# Step 3: Analyze requirements
/sa Create functional and non-functional requirements for user login

# Step 4: Design the system
/sd Design authentication service architecture and API endpoints

# Step 5: Implement the feature
/dev Implement user authentication service following all guidelines

# Step 6: Review the code
/review Code review user authentication implementation

# Step 7: Create tests
/test Create integration test plan for user authentication
```

### Quick Reference Commands

| Agent | Command Format | Example |
|-------|---|---|
| 🎯 Reference | `/reference Create [guidelines/templates]` | `/reference Create TEMPLATE-React-Component` |
| 📋 Plan | `/plan [project task]` | `/plan Generate 6-month roadmap for LinkWise` |
| 📊 SA | `/sa [analysis task]` | `/sa Create NFR analysis for performance requirements` |
| 🏗️ SD | `/sd [design task]` | `/sd Design payment processing service architecture` |
| 💻 Development | `/dev Implement [feature]` | `/dev Implement payment processing feature` |
| ✨ Review | `/review [review type] [component]` | `/review Code review payment service implementation` |
| ✅ Test | `/test [test task]` | `/test Create integration test plan for payment API` |

### Tips for Best Results

- **Be specific** - More detail = better output
- **Provide context** - Reference requirements or design docs when available
- **Use exact file names** - Reference specific docs like `REQUIREMENTS-User-Auth-v1.md`
- **Review outputs** - Check what the agent produces before using it
- **Iterate** - If output isn't right, refine your request

---

## � Documentation Structure

**Where to find what:**

| What | Where |
|-----|-------|
| **How agents work together** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Detailed agent definitions** | `.github/agents/[agent-name].agent.md` |
| **How to use each agent** | `.github/skills/[agent-name]/SKILL.md` |
| **Agent outputs & workflow** | [ARCHITECTURE.md](./ARCHITECTURE.md) |
| **Project guidelines & templates** | `docs/_reference/` |

**Quick Navigation:**
- 🚀 **Just getting started?** → Read this file (you're here!)
- 🏛️ **Need technical details?** → Read [ARCHITECTURE.md](./ARCHITECTURE.md)
- 📖 **Want to learn an agent deeply?** → Read `.github/agents/[name].agent.md`
- 💡 **Looking for examples?** → Read `.github/skills/[name]/SKILL.md`

## 🔄 Future Extensions

The 7-Agent system can be extended with:
- **Custom skills** - Add specialized workflows in `.github/skills/`
- **Domain guidance** - Create `.instructions.md` files for project-specific context
- **CI/CD hooks** - Integrate agents into your build pipeline
- **Notifications** - Alert teams on reviews, blockers, or completions
- **Custom agents** - Create new agents for specialized domains

See [ARCHITECTURE.md § Future Extensions](./ARCHITECTURE.md#-future-extensions) for detailed extension patterns.
