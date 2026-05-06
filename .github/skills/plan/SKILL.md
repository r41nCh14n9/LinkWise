---
name: plan
description: "Use when: Creating project plans, generating phased roadmaps, breaking down project phases, estimating timelines, and organizing project structure."
---

# Plan Skill

Generate comprehensive project plans, roadmaps, and phased workflows.

## What This Skill Does

Transforms DRAFT documents and project ideas into structured, actionable project plans with:
- Clear project objectives and scope definition
- Phased breakdown with milestones and deliverables
- Resource and effort estimation
- Timeline and schedule planning
- Project governance and organizational structure

## How to Use

**In Copilot Chat:**
```
/plan [Your project idea or requirements document]

Examples:
- /plan Generate a detailed project roadmap based on our requirements
- /plan Create a phased breakdown for the module implementation
- /plan Estimate effort and timeline for system redesign
- /plan Generate an agile sprint plan for the next release
```

## Available Plan Templates

This skill includes three professionally-designed, customizable templates:

### 1. 📋 Standard Project Plan
**File:** `assets/project-plan-template.md`

For typical 3-6 month projects with clear phases:
- Executive Summary & Objectives
- Scope Definition (In/Out)
- Phased Timeline with Milestones
- Resource & Effort Estimation
- Risk Management
- Governance & Communication

**Best for:** Mid-sized projects with mixed methodology

---

### 2. 🏃 Agile/Sprint-Based Plan
**File:** `assets/agile-sprint-plan-template.md`

For iterative, fast-moving projects with frequent releases:
- Release Overview & Sprint Breakdown
- User Stories by Epic (with story points)
- Sprint-by-Sprint Planning
- Velocity Projection & Capacity Planning
- Quality Gates & Definition of Done
- Release & Deployment Strategy

**Best for:** Scrum/Kanban teams, 2-4 week release cycles

---

### 3. 🏗️ Phase-Gate Waterfall Plan
**File:** `assets/phase-gate-waterfall-template.md`

For large, complex projects with sequential phases:
- Project Charter & Objectives
- 5 Formal Phases with Gate Reviews
- Detailed Timeline & Milestones
- Team Structure & Phase-by-Phase Effort
- Budget Breakdown
- Phase Gate Approval Criteria

**Best for:** Large projects, regulated industries, capital projects

---

## Using Templates for Your Project

All templates are available in `assets/` folder. When chosen by the Plan Agent:

1. The agent selects the appropriate template based on your project characteristics
2. Template content is customized with your project details
3. Placeholders are replaced with actual project information
4. Output is saved to `docs/plans/` for team reference

### Template Selection Guide

See complete selection logic in: `assets/TEMPLATE_SELECTION_GUIDE.md`

**Quick Reference:**
- **Iterative projects** (2-4 week cycles) → **Agile/Sprint template**
- **Sequential projects** (phases) → **Phase-Gate Waterfall template**
- **Mixed/Flexible projects** → **Standard template**
```

**Need a detailed, interactive guide?** See [TEMPLATE_SELECTION_GUIDE.md](./assets/TEMPLATE_SELECTION_GUIDE.md) for:
- Decision matrices and 3-dimensional analysis
- Generic project scenarios
- Quick reference flowchart
- Common selection mistakes
- Team scenarios checklist

### Customization Examples

**Example 1: Standard Module Project**
```
Base Template: Standard Project Plan
Customizations:
- Add module-specific requirements to Phase 1
- Include compliance/security considerations
- Add 15% contingency for testing
```

**Example 2: Release Cycle**
```
Base Template: Agile/Sprint Plan
Customizations:
- Set 3-sprint release cycle
- Define team velocity based on capacity
- Add feature prioritization strategy
```

**Example 3: Complex Migration**
```
Base Template: Phase-Gate Waterfall
Customizations:
- Add Phase 0 for legacy system analysis
- Require UAT sign-off as Phase 4 gate
- Include rollback procedures in Phase 5
```

---

## Integration with Project Workflow

### Template Usage Flow

```
1. SELECT Template
   (Standard / Agile / Waterfall)
           ↓
2. GATHER Project Details
   (Scope, Timeline, Team, Budget)
           ↓
3. POPULATE Template
   (Replace placeholders, customize sections)
           ↓
4. REVIEW & REFINE
   (Get stakeholder feedback)
           ↓
5. FINALIZE & PUBLISH
   (Save to project documentation)
           ↓
6. HANDOFF TO SA/SD
   (Use as basis for requirements & design)
```

### Outputs

The skill generates:
- **PLAN.md** files using selected template structure
- **Customized sections** tailored to your project type
- **Timeline visualizations** with phases and milestones
- **Resource allocations** with effort estimates
- **Risk matrices** with mitigation strategies
- **Handoff documents** for downstream teams (SA, SD, Test)

## Template Resources

**Template Documentation:** [View Guide](./assets/README.md)
- Template Selection Flowchart
- Customization Guide
- Best Practices
- Common Mistakes to Avoid
- Integration Tips

**Reference Materials:**
- Project Plan Examples
- Milestone Definition Guide
- Effort Estimation Framework
- Risk Mitigation Strategies

## Output

The skill generates:
- **PLAN.md** files with structured project plans (using selected template)
- Phase definitions with milestones and deliverables
- Resource allocation and effort estimates
- Project timeline and critical path analysis
- Handoff documents for downstream teams (SA, SD, Test)
- **Template-based structure** for consistency and maintainability

**📁 Save to:** `docs/plans/`
- Active plans: `docs/plans/active/`
- Completed plans: `docs/plans/completed/`
- Templates: `docs/plans/templates/`

**📖 Reference:** [Documentation Hub](../../../docs/INDEX.md)

## Related

- [Plan Agent](./../agents/plan.agent.md)
- [Next: System Analysis Skill](../sa/)
