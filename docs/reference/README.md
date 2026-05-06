# Reference Materials for Agent Usage

This directory contains all reference materials that agents use as input for their work. Teams should populate these folders with relevant information for agents to leverage.

## 📋 Folder Guide

### `requirements/` - Requirement Input Data
**What goes here:** Original requirements, DRAFT documents, project briefs, stakeholder input

**For SA Agent:** Use these as the primary input for requirement analysis
**For Plan Agent:** Use for creating project plans based on requirements
**For SD Agent:** Reference for design decisions

**Examples:**
- `DRAFT.md` - Initial project draft
- `REQUIREMENTS-LinkWise-2.0.md` - Detailed requirements doc
- `PROJECT-BRIEF-Payment-Module.md` - Project scope and objectives

---

### `templates/` - Reusable Templates
**What goes here:** Standard templates that agents should follow

**For All Agents:** Reference when creating output documents
**For Plan Agent:** Project plan templates (from `.github/skills/plan/assets/`)
**For SA Agent:** Requirement documentation templates
**For SD Agent:** Design specification templates
**For Test Agent:** Test plan and test case templates

**Current Templates:**
- `project-plan-template.md` - Standard project planning template
- `requirement-template.md` - Requirements document structure
- `design-template.md` - Design specification template
- `test-plan-template.md` - Test planning template

**How to Add Templates:**
1. Create well-structured template in this folder
2. Reference it in agent skills documentation
3. Use naming convention: `[type]-template.md`

---

### `guidelines/` - Best Practices & Standards
**What goes here:** Team standards, coding guidelines, architectural patterns

**For All Agents:** Reference when creating documentation
**For SD Agent:** Reference for design decisions and technology choices
**For Test Agent:** Reference for testing standards and quality criteria
**For SA Agent:** Reference for requirement structuring

**Examples:**
- `CODING-STANDARDS.md` - Code style and conventions
- `API-DESIGN-GUIDELINES.md` - REST API design patterns
- `DATABASE-DESIGN-GUIDELINES.md` - Database schema patterns
- `TESTING-STANDARDS.md` - QA procedures and test standards
- `DOCUMENTATION-STANDARDS.md` - Document formatting standards

**How to Add Guidelines:**
1. Document your team's standards
2. Add to this folder with clear naming
3. Reference in appropriate skill files
4. Keep updated as standards evolve

---

### `definitions/` - Glossary & Domain Knowledge
**What goes here:** Business glossary, technical terms, domain-specific definitions

**For All Agents:** Reference for consistent terminology
**For SA Agent:** Ensure requirement terminology is correct
**For SD Agent:** Ensure design uses correct terminology

**Examples:**
- `GLOSSARY.md` - Business and technical terms
- `BUSINESS-TERMS.md` - Domain-specific business vocabulary
- `TECHNICAL-TERMS.md` - Technical and architectural terminology
- `DATA-DEFINITIONS.md` - Data field and entity definitions

**How to Add Definitions:**
1. Create definition document with clear entries
2. Use consistent format (term → definition)
3. Reference in SA and Design documents
4. Keep updated with project evolution

---

### `examples/` - Reference Implementations
**What goes here:** Example projects, reference implementations, case studies

**For SD Agent:** Reference for similar implementations
**For Test Agent:** Reference for test patterns
**For Plan Agent:** Reference for similar project structures

**Examples:**
- `EXAMPLE-Payment-Flow.md` - Payment processing flow diagram
- `EXAMPLE-Auth-Implementation.md` - Authentication system design
- `EXAMPLE-API-Design.md` - Well-designed API example
- `EXAMPLE-Test-Strategy.md` - Comprehensive test plan example

**How to Add Examples:**
1. Document a completed or well-understood component
2. Explain design decisions and trade-offs
3. Include diagrams or code snippets if helpful
4. Label clearly as an example to reference

---

### `external/` - External References & Standards
**What goes here:** Industry standards, compliance requirements, external documentation

**For All Agents:** Reference for compliance and standards
**For SA Agent:** Reference for regulatory requirements
**For SD Agent:** Reference for security and performance standards
**For Test Agent:** Reference for compliance testing

**Examples:**
- `INDUSTRY-STANDARDS.md` - Payment industry, security standards, etc.
- `COMPLIANCE-REQUIREMENTS.md` - GDPR, HIPAA, SOC2, etc.
- `API-STANDARDS.md` - OpenAPI, REST specifications
- `SECURITY-STANDARDS.md` - Security best practices

**How to Add External References:**
1. Link or document external standards relevant to project
2. Summarize key requirements
3. Reference in appropriate artifact (design, test plan, etc.)
4. Keep URLs and versions current

---

## 🔄 How Agents Use These Materials

### Plan Agent
```
Reads from:
  - docs/reference/requirements/ → Understand project scope
  - docs/reference/templates/ → Follow project plan structure
  - docs/reference/guidelines/ → Follow planning standards

Example usage:
  /plan Create a project plan for LinkWise 2.0 based on 
        docs/reference/requirements/DRAFT.md using the agile template
```

### SA Agent
```
Reads from:
  - docs/reference/requirements/ → Source of truth for analysis
  - docs/reference/templates/ → Structure analysis documents
  - docs/reference/definitions/ → Ensure terminology consistency
  - docs/reference/guidelines/ → Follow documentation standards

Example usage:
  /sa Analyze docs/reference/requirements/REQUIREMENTS-LinkWise-2.0.md
      and create comprehensive analysis documents
```

### SD Agent
```
Reads from:
  - docs/analysis/ → Input from SA phase
  - docs/reference/templates/ → Structure design documents
  - docs/reference/guidelines/ → Follow design patterns and standards
  - docs/reference/examples/ → Reference similar implementations

Example usage:
  /sd Based on docs/analysis/ documents and our design guidelines,
      create system architecture for the payment module
```

### Test Agent
```
Reads from:
  - docs/analysis/ → Source requirements for test cases
  - docs/design/ → Source design for verification
  - docs/reference/templates/ → Structure test plans
  - docs/reference/guidelines/ → Follow testing standards

Example usage:
  /test Create test plan and test cases based on 
        docs/analysis/ and docs/design/ following our testing standards
```

---

## ✅ Setting Up Reference Materials

### Initial Setup Checklist

- [ ] **Move/Copy Existing Docs**
  - Move `DRAFT.md` to `requirements/DRAFT.md`
  - Copy existing guidelines to `guidelines/`
  - Copy existing glossary to `definitions/`

- [ ] **Add Templates**
  - Copy project plan templates from `.github/skills/plan/assets/` to `templates/`
  - Create requirement documentation template
  - Create design specification template
  - Create test plan template

- [ ] **Document Current Standards**
  - Document current coding standards → `guidelines/CODING-STANDARDS.md`
  - Document API design practices → `guidelines/API-DESIGN-GUIDELINES.md`
  - Document testing standards → `guidelines/TESTING-STANDARDS.md`

- [ ] **Create Business Glossary**
  - List key business terms → `definitions/GLOSSARY.md`
  - Define domain-specific concepts → `definitions/BUSINESS-TERMS.md`

- [ ] **Add External References**
  - Document compliance requirements → `external/COMPLIANCE-REQUIREMENTS.md`
  - Document security standards → `external/SECURITY-STANDARDS.md`

### Ongoing Maintenance

1. **Keep templates updated** - When standards change, update templates
2. **Maintain glossary** - Add new terms as project evolves
3. **Update guidelines** - Document best practices discovered during work
4. **Archive old references** - Move outdated materials to archive
5. **Link from artifacts** - Ensure SA/SD/Test documents reference these materials

---

## 📌 Quick Links

- [Requirements Input](./requirements/)
- [Templates](./templates/)
- [Guidelines & Standards](./guidelines/)
- [Definitions & Glossary](./definitions/)
- [Example Implementations](./examples/)
- [External References](./external/)

---

## 🎯 Best Practices

1. **Keep materials current** - Stale reference materials are misleading
2. **Be specific** - Link to exact sections, not just documents
3. **Version reference materials** - Track changes to standards
4. **Get feedback** - Have team review reference materials
5. **Reference in artifacts** - Link from analysis/design/test docs back to references

---

**Version:** 1.0  
**Last Updated:** May 2026
