# GitHub Workflows

This directory contains GitHub Actions workflows for automated testing and publishing.

## Workflows

### 1. CI Workflow (`ci.yml`)

**Trigger:** Runs on every push and pull request to any branch

**What it does:**
- Tests on Node.js versions 16.x, 18.x, and 20.x
- Installs dependencies with `npm ci`
- Runs ESLint to check for code quality issues
- Verifies code formatting with Prettier
- Builds the TypeScript project
- Runs all unit tests
- Checks that all example files can be compiled

**Status badges:**
You can add this badge to your README.md:
```markdown
[![CI](https://github.com/sinricpro/nodejs-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/sinricpro/nodejs-sdk/actions/workflows/ci.yml)
```

### 2. Publish Workflow (`publish.yml`)

**Trigger:** Runs when a new GitHub release is created

**What it does:**
1. Checks out the code
2. Installs dependencies
3. Runs linting and tests
4. Builds the project
5. Verifies the `dist/` directory exists
6. Checks that `package.json` version matches the release tag
7. Publishes to npm with provenance

**Setup Required:**

#### 1. Create an npm Access Token

1. Log in to [npmjs.com](https://www.npmjs.com/)
2. Go to your profile → Access Tokens
3. Click "Generate New Token" → "Classic Token"
4. Select "Automation" type
5. Copy the token (you won't see it again!)

#### 2. Add Token to GitHub Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Name: `NPM_TOKEN`
5. Value: Paste your npm token
6. Click "Add secret"

#### 3. Publishing a Release

When you're ready to publish:

1. **Update version in `package.json`:**
   ```bash
   npm version patch  # or minor, or major
   ```

2. **Push the version commit:**
   ```bash
   git push origin main
   ```

3. **Create a GitHub release:**
   - Go to Releases → "Draft a new release"
   - Tag: Use the version from package.json (e.g., `v3.0.0` or `3.0.0`)
   - Title: Version number (e.g., `v3.0.0`)
   - Description: Changelog for this release
   - Click "Publish release"

4. **Workflow runs automatically:**
   - The workflow will build and publish to npm
   - Check the Actions tab to monitor progress
   - If successful, your package will be live on npm!

#### Version Matching

The workflow verifies that your `package.json` version matches the release tag. Both of these are valid:
- Release tag `v3.0.0` with package.json `"version": "3.0.0"` ✅
- Release tag `3.0.0` with package.json `"version": "3.0.0"` ✅

#### npm Provenance

The workflow publishes with `--provenance` flag, which:
- Links your npm package to the GitHub source code
- Provides transparency about where the package was built
- Requires the `id-token: write` permission (already configured)

## Troubleshooting

### CI Workflow Issues

**Linting fails:**
```bash
npm run lint:fix
git commit -am "fix: lint errors"
git push
```

**Formatting fails:**
```bash
npm run format
git commit -am "style: format code"
git push
```

**Build fails:**
- Check TypeScript errors in the workflow logs
- Run `npm run build` locally to debug

**Examples don't compile:**
- Check the specific example file mentioned in the error
- Ensure all imports are correct
- Run `npx tsc --noEmit --skipLibCheck examples/[example-name]/index.ts`

### Publish Workflow Issues

**"NPM_TOKEN not found":**
- Verify the secret is named exactly `NPM_TOKEN`
- Check the secret is set in repository settings

**"Version mismatch":**
- Ensure `package.json` version matches the release tag
- Example: tag `v3.0.0` requires version `"3.0.0"` in package.json

**"dist directory not found":**
- The build step failed
- Check the build logs for TypeScript errors

**"Permission denied":**
- Verify your npm token has "Automation" permissions
- Check you're a maintainer of the npm package

**"Package already exists":**
- You cannot republish the same version
- Increment the version and create a new release

## Local Testing

Before creating a release, test the build process locally:

```bash
# Install dependencies
npm ci

# Run linting
npm run lint

# Check formatting
npx prettier --check "src/**/*.ts" "examples/**/*.ts" "test/**/*.ts"

# Build
npm run build

# Run tests
npm test

# Check examples compile
for example in examples/*/index.ts; do
  npx tsc --noEmit --skipLibCheck $example
done
```

## CI/CD Best Practices

1. **Always test locally first** before pushing
2. **Keep dependencies up to date** to avoid security issues
3. **Use semantic versioning** (major.minor.patch)
4. **Write meaningful release notes** in GitHub releases
5. **Monitor workflow runs** in the Actions tab
6. **Don't commit secrets** - always use GitHub Secrets

## Workflow Badges

Add these to your `README.md` to show build status:

```markdown
[![CI](https://github.com/sinricpro/nodejs-sdk/actions/workflows/ci.yml/badge.svg)](https://github.com/sinricpro/nodejs-sdk/actions/workflows/ci.yml)
[![npm version](https://badge.fury.io/js/sinricpro-sdk.svg)](https://www.npmjs.com/package/sinricpro-sdk)
[![License](https://img.shields.io/badge/License-CC--BY--SA--4.0-blue.svg)](LICENSE)
```
