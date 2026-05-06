# System Analysis Scripts

This folder contains helper scripts for creating and managing professional requirements documentation.

## Overview

These scripts support two main workflows:
1. **Doc-Coauthoring** - Structured workflow for collaborative requirements documentation
2. **DOCX Generation** - Creating professional Word documents for business stakeholders

## Scripts

### DOCX Helper Scripts

#### accept_changes.py
**Purpose**: Accept all tracked changes in a Word document to produce a clean version.

**Usage**:
```bash
python accept_changes.py input.docx output.docx
```

**Requirements**: LibreOffice (auto-configured)

---

#### comment.py
**Purpose**: Add comments to Word documents programmatically.

**Usage**:
```bash
# Add comment
python comment.py unpacked/ 0 "Comment text with &amp; and &#x2019;"

# Reply to comment
python comment.py unpacked/ 1 "Reply text" --parent 0

# Custom author
python comment.py unpacked/ 0 "Text" --author "Custom Author"
```

**Prerequisites**:
1. Unpack DOCX first: `python office/unpack.py document.docx unpacked/`
2. Add comments
3. Pack back: `python office/pack.py unpacked/ output.docx`

---

### office/ subdirectory

Located in `scripts/office/`, these utilities handle document operations:
- `unpack.py` - Extract DOCX to editable XML
- `pack.py` - Repack XML into DOCX format
- `validate.py` - Validate DOCX file integrity
- `soffice.py` - LibreOffice integration for conversions

**Common workflow:**
```bash
# Extract for editing
python office/unpack.py requirements.docx unpacked/

# Edit unpacked/word/document.xml

# Pack back with validation
python office/pack.py unpacked/ requirements_updated.docx --original requirements.docx
```

---

## Node.js Setup (for DOCX Generation)

Install the docx library (one-time):
```bash
npm install -g docx
```

Then create Word documents using JavaScript:
```javascript
const { Document, Packer, Paragraph, TextRun } = require('docx');
const fs = require('fs');

const doc = new Document({
  sections: [{
    children: [
      new Paragraph({ children: [new TextRun("Your content")] })
    ]
  }]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("output.docx", buffer);
});
```

---

## Dependencies

- **Python 3.7+** - For script execution
- **Node.js** - For DOCX generation with the `docx` npm package
- **LibreOffice** - For document conversion (auto-configured via `office/soffice.py`)
- **Pandoc** - For Markdown to Word conversion (optional)

### Install All Dependencies

```bash
# Python packages
pip install python-docx docx

# Node.js package
npm install -g docx

# System packages (Ubuntu/Debian)
sudo apt-get install libreoffice pandoc

# System packages (macOS)
brew install libreoffice pandoc

# System packages (Windows with chocolatey)
choco install libreoffice pandoc
```

---

## Document Workflow Example

### Scenario: Create 需求確認文件 (Requirements Confirmation Document)

**Step 1: Gather Requirements (Using Doc-Coauthoring)**
- Use `/sa` skill in Copilot to run doc-coauthoring workflow
- Output: `requirements.md`

**Step 2: Convert to Word**
```bash
# Create Node.js script
node create_requirements_doc.js  # generates Requirements_Confirmation.docx
```

**Step 3: Distribute to Stakeholders**
- Send Word document to business team and requirements unit
- Collect feedback on tracked changes
- Use `accept_changes.py` to produce final clean version

**Step 4: Archive**
- Store in project documentation
- Link to related SA artifacts

---

## Reference

- **Official Anthropic doc-coauthoring**: https://github.com/anthropics/skills/tree/main/skills/doc-coauthoring
- **Official Anthropic DOCX skill**: https://github.com/anthropics/skills/tree/main/skills/docx
- **DOCX Library Docs**: https://docx.js.org/
- **Pandoc User Guide**: https://pandoc.org/MANUAL.html

---

## ✅ Configuration Status

### Office Module - VERIFIED ✓

All required modules from official Anthropic docx skill have been properly installed:

**Core Modules**:
- ✅ `accept_changes.py` - Accept tracked changes in DOCX  
- ✅ `comment.py` - Add comments to Word documents
- ✅ `office/soffice.py` - LibreOffice helper (AF_UNIX socket shim included)

**Supporting Modules**:
- ✅ `office/helpers/merge_runs.py` - Merge adjacent runs
- ✅ `office/helpers/simplify_redlines.py` - Simplify tracked changes
- ✅ `office/validators/base.py` - Base validator class
- ✅ `office/validators/docx.py` - DOCX validation
- ✅ `office/validators/pptx.py` - PPTX validation
- ✅ `office/validators/redlining.py` - Tracked changes validation

### What This Means

✅ SA Agent can now:
- Accept tracked changes in Word documents
- Add comments to Word documents programmatically
- Generate professional DOCX files for stakeholder reviews
- Validate document integrity before distribution
- Create 需求確認文件 (Requirements Confirmation Documents)

**All office module dependencies are satisfied and ready for use!**
