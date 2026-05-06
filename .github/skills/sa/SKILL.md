---
name: sa
description: "Use when: Analyzing requirements, creating requirement-code mapping documents, documenting non-functional requirements, decomposing requirements into system analysis artifacts, or reverse-engineering existing systems."
---

# System Analysis (SA) Skill

Transform requirements and project plans into comprehensive system analysis documentation.

## What This Skill Does

Analyzes requirements and generates system analysis artifacts including:
- Detailed requirement analysis and decomposition
- Requirement-to-code mapping documents
- Non-functional requirements (NFR) specification
- System analysis decomposition documents
- Reverse engineering analysis for existing systems
- Traceability matrices and impact analysis

## How to Use

**In Copilot Chat:**
```
/sa [Your requirements or project plan]

Examples:
- /sa Analyze these requirements and create a requirement-code mapping
- /sa Document non-functional requirements for the LinkWise core system
- /sa Reverse-engineer the existing authentication system and create system analysis docs
- /sa Decompose the payment module requirements into SA artifacts
```

## Structured Documentation Workflow (Doc-Coauthoring)

This skill integrates **Anthropic's official doc-coauthoring workflow** for systematic requirements documentation. The workflow has three stages:

### Stage 1: Context Gathering
- **Purpose**: Capture all relevant context about the requirements
- **Process**: 
  1. Answer initial metadata questions (doc type, audience, desired impact)
  2. Dump all available context about requirements
  3. Answer clarifying questions to close knowledge gaps
- **Output**: Complete context for authoring

### Stage 2: Refinement & Structure
- **Purpose**: Build requirements document section by section
- **Process** (for each section):
  1. Clarifying questions about what to include
  2. Brainstorm 5-20 relevant points
  3. Curate and select which points to keep
  4. Gap check for missing items
  5. Draft the section
  6. Iterative refinement with surgical edits
- **Output**: Well-structured requirements document (Markdown or Word)

### Stage 3: Reader Testing
- **Purpose**: Verify the document works for actual readers
- **Process**:
  1. Predict what readers will ask
  2. Test with fresh context to catch blind spots
  3. Run additional consistency/clarity checks
  4. Iterate on problematic sections
- **Output**: Reader-tested requirements document ready for stakeholder review

### When to Use This Workflow
- Creating complex requirements documents for business teams
- Writing requirement confirmation documents (需求確認書)
- Drafting non-functional requirement specifications
- Preparing documents for stakeholder review and approval

---

## Word Document Generation (DOCX Skill)

For professional Word document delivery to business teams, this skill integrates **Anthropic's official docx skill** for creating polished .docx files with:
- Professional formatting (headers, footers, styles)
- Tables and structured layouts
- Table of Contents with hyperlinks
- Tracked changes and comments
- Images and media

### Quick Start: Generate Requirements Confirmation Document

**Install Node.js dependency (one-time):**
```bash
npm install -g docx
```

**Create a Word requirements document:**

1. **Use the doc-coauthoring workflow** to prepare Markdown content
2. **Convert to Word** using Node.js with the docx library:

```javascript
// requirements.js - Example
const { Document, Packer, Paragraph, TextRun, HeadingLevel, Table, TableRow, TableCell } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },  // US Letter
        margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 }
      }
    },
    children: [
      new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("需求確認文件")] }),
      new Paragraph({ children: [new TextRun("LinkWise 項目 - 2024")] }),
      new Paragraph({ children: [new TextRun("")] }),
      new Paragraph({ children: [new TextRun("需求摘要和確認細節...")] }),
      // Add more sections here
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("Requirements_Confirmation.docx", buffer);
  console.log("✅ Document created: Requirements_Confirmation.docx");
});
```

**Run to generate:**
```bash
node requirements.js
```

### Document Structure Tips

**Best Practices for Requirements Confirmation:**
- **Header**: Project name, date, version, author
- **Table of Contents**: Auto-generated from Heading 1/2/3
- **Executive Summary**: 1-2 page overview
- **Functional Requirements**: Detailed specifications table
- **Non-Functional Requirements**: Performance, security, scalability
- **Assumptions & Constraints**: Business and technical context
- **Sign-off Section**: For stakeholder approval

### Helper Scripts

**Unpack existing .docx for editing:**
```bash
# Requires: python scripts available in .github/skills/sa/scripts/
python scripts/office/unpack.py document.docx unpacked/
# Edit XML in unpacked/word/
python scripts/office/pack.py unpacked/ output.docx
```

**Add tracked changes comments:**
```bash
python scripts/comment.py unpacked/ 0 "Comment text"
```

---

## Output

The skill generates:
- **需求代碼對照表.md** - Requirement-code mapping documentation
- **non-functional-requirement-analysis.md** - NFR specifications
- System analysis decomposition documents
- Requirement traceability matrices
- Reverse engineering analysis reports
- Impact analysis for requirement changes
- **需求確認文件.docx** - Professional Word requirements document
- **需求確認書.docx** - Formal requirements confirmation letter

## Resources

- **Doc-Coauthoring Workflow**: [Anthropic doc-coauthoring skill](https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring)
- **DOCX Creation & Editing**: [Anthropic docx skill](https://github.com/anthropics/skills/tree/main/skills/docx)
- **DOCX Library**: [docx npm package](https://www.npmjs.com/package/docx)
- **Markdown to HTML/PDF**: [Pandoc documentation](https://pandoc.org/)

## Related

- [SA Agent](./../agents/sa.agent.md)
- [Previous: Plan Skill](../plan/)
- [Next: System Design Skill](../sd/)
