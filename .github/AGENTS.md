---
name: agents
description: "Registry of custom agents for LinkWise project workflow"
---

# LinkWise Custom Agents

This document lists all custom agents available for the LinkWise project. These agents are specialized for different phases of the project development workflow.

## Available Agents

### 📋 [Plan Agent](./agents/plan.agent.md)
- **Role**: Project Planning & Roadmap Generation
- **When to use**: Starting new projects, creating project plans, phased roadmaps, timelines
- **Key tasks**: Generate structured project plans, break down phases, organize project structure
- **Scope**: DRAFT → PLAN phase

### 📊 [System Analysis Agent (SA)](./agents/sa.agent.md)
- **Role**: Requirements Analysis & Documentation
- **When to use**: Analyzing requirements, creating requirement mappings, documenting NFRs
- **Key tasks**: Requirements analysis, requirement-code mapping, decompose into SA documents, reverse-engineer systems
- **Scope**: PLAN → Requirements → SA phase

### 🏗️ [System Design Agent (SD)](./agents/sd.agent.md)
- **Role**: Technical Architecture & System Design
- **When to use**: Designing architecture, creating component models, specifying APIs and data models
- **Key tasks**: Architecture design, component specification, data modeling, design documentation
- **Scope**: SA → SD phase

### ✅ [Test Agent](./agents/test.agent.md)
- **Role**: Quality Assurance & Test Planning
- **When to use**: Creating test plans, generating test cases, validating design against requirements
- **Key tasks**: Integration test planning, test case generation, design validation, QA documentation
- **Scope**: Integration Testing phase

## Workflow Integration

The agents work together across the LinkWise development workflow:

```
DRAFT 
  ↓
PLAN (Plan Agent)
  ↓
Requirements Gathering
  ↓
SA (SA Agent) → Requirement-Code Mapping, NFR Docs, System Analysis
  ↓
SD (SD Agent) → Architecture, Components, Data Model, API Design
  ↓
Integration Testing (Test Agent) → Test Plans, Test Cases
```

## How to Use

To invoke a specific agent in VS Code:
1. Open the Copilot Chat
2. Type `/plan`, `/sa`, `/sd`, or `/test` followed by your task
3. The specialized agent will handle your request with its domain expertise

Example prompts:
- `/plan Generate a project roadmap for LinkWise 2.0`
- `/sa Create a requirement-code mapping for the authentication module`
- `/sd Design the system architecture for LinkWise`
- `/test Create an integration test plan for the payment module`

## Future Extensions

Each agent can be extended with:
- Custom **skills** (SKILL.md files) in `skills/` folder
- **File instructions** (*.instructions.md) in `.github/instructions/` for domain-specific guidance
- **Hooks** for deterministic lifecycle management
