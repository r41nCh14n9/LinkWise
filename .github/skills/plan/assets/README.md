# Plan Skill Templates

This folder contains reusable project plan templates for various project types.

## Available Templates

### 1. Standard Project Plan Template
**File:** `project-plan-template.md`

**Best For:**
- Mid-sized projects (3-6 months)
- Mixed methodologies
- Projects with clear phases but some flexibility

**Sections:**
- Executive Summary
- Project Scope (In/Out of Scope)
- Phased Timeline & Milestones
- Resource & Effort Estimation
- Risks & Mitigation
- Quality & Testing Strategy
- Governance & Communication

**Use When:**
- You need a comprehensive overview
- Multiple stakeholders with different concerns
- Formal project documentation required

---

### 2. Agile/Sprint-Based Plan Template
**File:** `agile-sprint-plan-template.md`

**Best For:**
- Fast-moving projects
- Iterative development
- Regular release cycles

**Sections:**
- Release Overview with Sprint Breakdown
- User Stories & Features by Epic
- Sprint-by-Sprint Planning
- Velocity Projection
- Dependencies & Risks
- Quality Gates & DoD
- Deployment Strategy

**Use When:**
- Using Scrum or Kanban methodology
- Frequent releases (every 2-4 weeks)
- Business prioritization changes often

---

### 3. Phase-Gate Waterfall Plan Template
**File:** `phase-gate-waterfall-template.md`

**Best For:**
- Large, complex projects
- Highly regulated industries
- Projects with clear sequential phases

**Sections:**
- Project Charter
- 5 Sequential Phases (Requirements, Design, Implementation, Testing, Deployment)
- Phase Gates with Approval Criteria
- Detailed Timeline per Phase
- Team Structure & Effort by Phase
- Budget Breakdown
- Quality Standards & Gate Process

**Use When:**
- Strict regulatory or compliance requirements
- Large capital projects
- Clear, sequential work breakdown
- Need formal phase-gate approvals

---

## How to Use These Templates

### Option 1: Direct Template Usage
1. Copy the entire template content
2. Paste into your project plan document
3. Replace [PLACEHOLDERS] with actual project data
4. Customize sections as needed

### Option 2: Hybrid Approach
Combine sections from multiple templates:
- Use Release Overview from Agile template
- Add Phase Gates from Waterfall template
- Include Risk Management from Standard template

### Option 3: Template-Guided Generation
Reference these templates when using `/plan` skill:
```
/plan Generate a project plan using the standard template for our payment module
/plan Create a release plan using the sprint-based template
```

---

## Customization Guide

### Key Areas to Customize

#### 1. Project Definition
- [ ] Update project name, dates, owner
- [ ] Define specific business objectives
- [ ] List actual deliverables

#### 2. Timeline & Phases
- [ ] Replace sample phases with your phases
- [ ] Adjust durations based on project complexity
- [ ] Set realistic milestone dates

#### 3. Team & Resources
- [ ] List actual team members and roles
- [ ] Update FTE allocations
- [ ] Adjust effort estimates

#### 4. Risks & Mitigation
- [ ] Identify project-specific risks
- [ ] Define mitigation strategies
- [ ] Assign risk owners

#### 5. Success Criteria
- [ ] Define what "done" means
- [ ] Set measurable acceptance criteria
- [ ] Establish quality standards

---

## 📖 Detailed Selection Guide

**For a comprehensive, step-by-step guide on choosing the right template, see:**
[TEMPLATE_SELECTION_GUIDE.md](./TEMPLATE_SELECTION_GUIDE.md)

This guide includes:
- Decision matrices and frameworks
- Generic project scenarios
- Quick selection flowcharts
- Common mistakes to avoid
- Team scenarios and recommendations

---

## Template Selection Flowchart

```
Start: Planning New Project
    |
    v
Project Duration?
├─ < 2 months → Consider Agile/Sprint template
├─ 2-6 months → Standard template (most flexible)
└─ > 6 months → Phase-Gate Waterfall

Additional Complexity?
├─ Regulatory/Compliance Heavy → Phase-Gate
├─ Frequent Stakeholder Changes → Agile/Sprint
└─ Well-defined Scope → Standard or Waterfall

Decision Made → Select Template → Customize → Generate Plan
```

---

## Tips for Effective Planning

### Best Practices
1. **Be Realistic** - Don't underestimate effort
2. **Include Contingency** - Add 10-20% buffer for risks
3. **Get Feedback** - Review plan with team before finalization
4. **Make It Visible** - Share with stakeholders early
5. **Plan to Update** - Plans should evolve as project progresses

### Common Mistakes to Avoid
- ❌ Overly optimistic timelines
- ❌ Missing resource constraints
- ❌ Ignoring dependencies
- ❌ No contingency planning
- ❌ Outdated plans (not reviewed)

---

## Integration with Development Workflow

### Plan Handoff
These templates prepare comprehensive plans that feed into downstream phases:
- **To SA (System Analysis):** Requirements section informs detailed analysis
- **To SD (System Design):** Scope and phases guide architecture work
- **To Test:** Timeline and deliverables establish testing strategy

### Version Control
- Store finalized plans in documentation (e.g., `docs/plans/`)
- Include plan version in project artifacts
- Update plan when scope changes
- Link plan to related requirements/design docs

---

## Support & Questions

For questions about adapting these templates:
- Reference the official project planning guidance
- Consult with the Project Manager for similar past projects
- Use `/plan` skill to generate customized versions

---

**Last Updated:** May 6, 2026
