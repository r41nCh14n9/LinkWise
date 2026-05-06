---
name: test
description: "Use when: Creating integration test plans, generating test cases from requirements, validating design against requirements, defining test strategies, or planning quality assurance."
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
- /test Create an integration test plan for the module
- /test Generate test cases from requirements and design specifications
- /test Validate the design against all functional and non-functional requirements
- /test Define test strategy and coverage approach
```

## Web Application Testing with Playwright

This skill includes automated browser testing capabilities using Playwright and standard webapp-testing patterns.

### Quick Start

**1. Install Playwright:**
```bash
pip install playwright
playwright install chromium
```

**2. Run tests with managed server lifecycle:**

Single application server:
```bash
python .github/skills/test/scripts/with_server.py \
  --server "[your-build-command]" --port [port]\
  -- python test_app.py
```

Multiple servers (backend + frontend):
```bash
python .github/skills/test/scripts/with_server.py \
  --server "[backend-build]" --port [backend-port] \
  --server "[frontend-build]" --port [frontend-port] \
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
    page.fill('input[name="email"]', 'test@example.com')
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

**📁 Save to:** `docs/testing/`
- Integration tests: `docs/testing/integration/`
- User acceptance tests: `docs/testing/user/`
- Unit test docs: `docs/testing/unit/`

**📖 Reference:** [Documentation Hub](../../../docs/INDEX.md)

## Related

- [Test Agent](./../agents/test.agent.md)
- [Previous: SD Skill](../sd/)
