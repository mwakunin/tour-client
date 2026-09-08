# GitHub Actions Workflows

This directory contains all the CI/CD workflows for the BOLDAFRICA Adventures Client project.

## Workflows

### 1. CI (`ci.yml`)

**Triggers:** Push to main/master/develop branches, Pull Requests

**Purpose:** Runs comprehensive quality checks and builds the application

**Jobs:**
- **quality-checks**: Runs on Node 18.x and 20.x
  - Linting with ESLint
  - Code formatting check with Prettier
  - TypeScript type checking
  - Tests with coverage
  - Uploads coverage to Codecov (optional)

- **build**: Creates a production build
  - Requires quality-checks to pass first
  - Uses environment variables from secrets
  - Uploads build artifacts

**Required Secrets:**
- `NEXT_PUBLIC_API_URL` (optional)
- `NEXT_PUBLIC_SENTRY_DSN` (optional)
- `NEXT_PUBLIC_POSTHOG_KEY` (optional)
- `NEXT_PUBLIC_POSTHOG_HOST` (optional)
- `CODECOV_TOKEN` (optional, for coverage reports)

---

### 2. PR Checks (`pr-checks.yml`)

**Triggers:** Pull Request opened, synchronized, or reopened

**Purpose:** Provides detailed information about pull requests

**Jobs:**
- **pr-info**: Comments on PR with statistics
  - Files changed
  - Lines added/removed

- **test-coverage**: Reports test coverage metrics
  - Runs tests with coverage
  - Comments coverage percentages on PR

- **size-check**: Analyzes bundle size
  - Builds the application
  - Reports .next directory size
  - Reports static files size

---

### 3. Security Checks (`security.yml`)

**Triggers:**
- Push to main/master/develop
- Pull Requests
- Scheduled (Monday 9 AM UTC)

**Purpose:** Security scanning and dependency auditing

**Jobs:**
- **dependency-audit**:
  - Runs npm audit for vulnerabilities
  - Checks for outdated dependencies

- **codeql-analysis**:
  - GitHub's code scanning tool
  - Analyzes JavaScript/TypeScript code
  - Reports security vulnerabilities

- **secret-scanning**:
  - Scans for accidentally committed secrets
  - Uses TruffleHog for detection

---

### 4. Lint Report (`lint-report.yml`)

**Triggers:** Pull Request opened, synchronized, or reopened

**Purpose:** Detailed linting and formatting reports on PRs

**Jobs:**
- **eslint**:
  - Runs ESLint
  - Comments detailed lint report on PR
  - Shows errors and warnings

- **prettier**:
  - Checks code formatting
  - Comments formatting issues on PR
  - Provides fix instructions

---

## Dependabot Configuration (`dependabot.yml`)

**Purpose:** Automated dependency updates

**Settings:**
- Weekly updates on Mondays at 9 AM
- Separate groups for production and development dependencies
- Auto-assigns to @nmwakuni
- Labels PRs with "dependencies" and "automated"
- Also updates GitHub Actions

---

## Setup Instructions

### 1. Enable GitHub Actions

GitHub Actions should be enabled by default. If not:
1. Go to repository Settings → Actions → General
2. Select "Allow all actions and reusable workflows"

### 2. Configure Secrets

Add the following secrets in repository Settings → Secrets and variables → Actions:

**Optional but Recommended:**
```
NEXT_PUBLIC_API_URL=https://api.boldafricaadventures.com
NEXT_PUBLIC_SENTRY_DSN=your-sentry-dsn
NEXT_PUBLIC_POSTHOG_KEY=your-posthog-key
NEXT_PUBLIC_POSTHOG_HOST=https://eu.i.posthog.com
```

**For Coverage Reports (Optional):**
```
CODECOV_TOKEN=your-codecov-token
```

### 3. Enable Dependabot

Dependabot is automatically enabled with the `dependabot.yml` file. To verify:
1. Go to repository Settings → Code security and analysis
2. Ensure "Dependabot alerts" and "Dependabot security updates" are enabled

### 4. Branch Protection Rules (Recommended)

Set up branch protection for `main`/`master`:
1. Go to Settings → Branches → Add rule
2. Branch name pattern: `main` (or `master`)
3. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - Required checks:
     - `Code Quality & Tests`
     - `Build`
     - `ESLint Report`
     - `Prettier Check`
   - ✅ Require conversation resolution before merging

---

## Workflow Status Badges

Add these badges to your README.md to show workflow status:

```markdown
![CI](https://github.com/nmwakuni/boldafricaadventures-client/workflows/CI/badge.svg)
![Security Checks](https://github.com/nmwakuni/boldafricaadventures-client/workflows/Security%20Checks/badge.svg)
```

---

## Troubleshooting

### Workflows not running?

1. **Check Actions tab**: Look for error messages
2. **Verify branch names**: Ensure workflows target the correct branches
3. **Check permissions**: Workflows need read access to repository

### PR comments not appearing?

1. **Token permissions**: GitHub Actions token needs write permissions
2. **First-time PRs**: May require approval for security reasons

### Build failures?

1. **Check environment variables**: Ensure all required secrets are set
2. **Node version**: Workflows use Node 18.x and 20.x
3. **Dependencies**: Run `npm ci` locally to verify package-lock.json

### CodeQL warnings?

CodeQL may flag potential security issues. Review them carefully:
- Some may be false positives
- Fix legitimate issues before merging
- Document reasons if dismissing alerts

---

## Customization

### Changing Node Versions

Edit the `node-version` in workflows:

```yaml
strategy:
  matrix:
    node-version: [18.x, 20.x]  # Modify these versions
```

### Adjusting Workflow Triggers

Modify the `on` section:

```yaml
on:
  push:
    branches: [main, develop]  # Add or remove branches
  pull_request:
    branches: [main, develop]
```

### Disabling PR Comments

Remove or comment out the comment steps in `pr-checks.yml` and `lint-report.yml`.

---

## Cost Considerations

- **GitHub Actions minutes**: Free for public repos, limited for private repos
- **Storage**: Artifacts are stored for 7 days (configurable)
- **Scheduled workflows**: Count against minutes quota

**Optimization Tips:**
- Use caching for dependencies (already implemented)
- Limit matrix builds if needed
- Adjust artifact retention period
- Use `if` conditions to skip unnecessary steps

---

## Support

For issues with workflows:
1. Check the Actions tab for detailed logs
2. Review workflow YAML syntax
3. Consult [GitHub Actions documentation](https://docs.github.com/actions)

---

**Last Updated:** 2025-11-14
