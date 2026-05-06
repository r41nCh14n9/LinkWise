---
name: test
description: "Use when: Creating integration test plans, generating test cases from requirements, validating design against requirements, defining test strategies, or planning quality assurance for the system."
---

# Test Skill

Create comprehensive test plans, test cases, and quality assurance strategies based on requirements and design.

## What This Skill Does

Generates test and QA artifacts including:
- Integration test plans and testing strategies
- Test case generation from requirements and design specifications
- Design validation against functional and non-functional requirements
- Test coverage strategies and quality metrics
- Test traceability matrices linking tests to requirements
- Quality assurance procedures and acceptance criteria

## How to Use

**In Copilot Chat:**
```
/test [Your requirements or design specifications]

Examples:
- /test Create an integration test plan for the payment module
- /test Generate test cases from the requirements and design specifications
- /test Validate the design against all functional and non-functional requirements
- /test Define test strategy and coverage approach for LinkWise
```

## Web Application Testing with Playwright

This skill includes automated browser testing capabilities for LinkWise frontend components using Playwright and the official Anthropic webapp-testing patterns (bundled locally).

### Quick Start

**1. Install Playwright:**
```bash
pip install playwright
playwright install chromium
```

**2. Run tests with managed server lifecycle:**

Single server (e.g., LinkWise frontend):
```bash
python .github/skills/test/scripts/with_server.py \
  --server "cd src/linkwise-front && npm run dev" --port 3000 \
  -- python test_app.py
```

Multiple servers (e.g., backend + frontend):
```bash
python .github/skills/test/scripts/with_server.py \
  --server "cd src/linkwise-core && npm run dev" --port 5000 \
  --server "cd src/linkwise-front && npm run dev" --port 3000 \
  -- python e2e_test.py
```

### Example: Writing a Web Test

```python
from playwright.sync_api import sync_playwright

with sync_playwright() as p:
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    
    page.goto('http://localhost:3000')
    page.wait_for_load_state('networkidle')  # CRITICAL: Wait for JS to load
    
    # Interact with UI
    page.click('button:has-text("Login")')
    page.fill('input[name="email"]', 'test@linkwise.com')
    page.fill('input[name="password"]', 'password123')
    page.click('button:has-text("Submit")')
    
    # Verify result
    page.wait_for_selector('text=Dashboard')
    page.screenshot(path='/tmp/test_success.png')
    
    browser.close()
```

### Best Practices

- **Always wait for dynamic content**: Use `page.wait_for_load_state('networkidle')` before inspecting DOM
- **Use descriptive selectors**: Prefer `text=`, `role=`, or CSS selectors with clear intent
- **Organize tests**: Group related tests in separate files
- **Manage servers**: The `with_server.py` helper handles server startup/cleanup automatically

### Reference

- **Helper Script**: `scripts/with_server.py` - Manages server lifecycle for testing
- **Based on**: [Anthropic webapp-testing skill](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)
- **Playwright Docs**: [playwright.dev/python](https://playwright.dev/python/)

## Output

The skill generates:
- **Test Plans** - 整合測試計畫.md with detailed testing strategies
- **Test Cases** - Comprehensive test case specifications
- **Test Traceability** - Requirement-to-test mapping matrices
- **Design Validation** - Design verification reports
- **QA Documentation** - Acceptance criteria and test scenarios
- **Metrics & Coverage** - Quality metrics and test coverage analysis

## Related

- [Test Agent](./../agents/test.agent.md)
- [Previous: SD Skill](../sd/)
