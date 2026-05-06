---
name: sd
description: "Use when: Designing system architecture, creating component models, generating design documentation, designing data models and database schemas, specifying APIs, or translating system analysis into technical design."
---

# System Design (SD) Skill

Transform system analysis into detailed technical architecture and design specifications.

## What This Skill Does

Creates technical design artifacts from system analysis including:
- System architecture and component diagrams
- Detailed component and module design specifications
- Data models and database schema design
- API contract and interface specifications
- Design pattern documentation and technology stack decisions
- Design rationale and architectural trade-off analysis

## How to Use

**In Copilot Chat:**
```
/sd [Your system analysis or requirements]

Examples:
- /sd Design the system architecture based on the SA documentation
- /sd Create component design and data models for the payment module
- /sd Generate API specifications from the requirements analysis
- /sd Design the database schema for LinkWise core system
```

## Output

The skill generates:
- **System Architecture** - High-level architecture diagrams and documentation
- **Component Design** - Detailed component specifications and relationships
- **Data Models** - ER diagrams and database schema designs
- **API Specifications** - REST API contracts and interface definitions
- **Design Documentation** - Design rationale and pattern documentation
- **Technology Stack** - Technology choices and architectural decisions

**📁 Save to:** `docs/design/`
- Architecture designs: `docs/design/architecture/`
- Component specs: `docs/design/components/`
- API specs: `docs/design/apis/`
- Database schemas: `docs/design/database/`
- Diagrams: `docs/design/diagrams/`

**📖 Reference:** [Documentation Hub](../../../docs/INDEX.md)

## Related

- [SD Agent](./../agents/sd.agent.md)
- [Previous: SA Skill](../sa/)
- [Next: Test Skill](../test/)
