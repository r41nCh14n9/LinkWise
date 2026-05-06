# Test Scripts

This folder contains helper scripts for automated testing in LinkWise.

## with_server.py

**Purpose**: Manages development server lifecycle for Playwright automation tests.

**Bundled from**: [Anthropic webapp-testing skill](https://github.com/anthropics/skills/tree/main/skills/webapp-testing)

**License**: Apache 2.0 (see LICENSE.txt in the parent directory)

### Usage

```bash
# Single server
python with_server.py --server "cd src/linkwise-front && npm run dev" --port 3000 -- python test.py

# Multiple servers
python with_server.py \
  --server "cd src/linkwise-core && npm run dev" --port 5000 \
  --server "cd src/linkwise-front && npm run dev" --port 3000 \
  -- python e2e_test.py
```

### What it does

1. Starts one or more development servers
2. Waits for all servers to be ready (configurable timeout)
3. Runs your test/automation script
4. Automatically cleans up and stops all servers

### Help

```bash
python with_server.py --help
```
