# CI Scripts

This directory contains scripts used by GitHub Actions workflows to automate various tasks.

## increment-version.js

Automatically increments the version number in `apps/web/projectData.ts`.

### Usage

```bash
node .github/scripts/increment-version.js
```

### Version Increment Logic

The script handles different version formats intelligently:

1. **Suffixed versions** (e.g., `"0.1.10-canary-1"` → `"0.1.10-canary-2"`)
   - Increments the number after the final dash

2. **Semantic versions** (e.g., `"0.1.10"` → `"0.1.11"`)
   - Increments the patch version (third number)

3. **Fallback pattern** - Increments the last number found in the version string

### Outputs

When run in GitHub Actions, the script sets these outputs:
- `current`: The previous version number
- `new`: The new incremented version number

### Integration

This script is used by the "Auto Update Version and Build" workflow (`version-and-build.yml`) to automatically increment the version on every push to the main branch, then build and tag a Docker image with the new version.

### Prevention of Infinite Loops

The workflow is designed to skip execution when the commit message contains "🤖 Auto-increment version" to prevent infinite loops of version updates.