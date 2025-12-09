#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DATA_PATH = path.join(__dirname, "../../apps/web/projectData.ts");
const VERSION_JSON_PATH = path.join(__dirname, "../../version.json");
const VERSIONS_DIR = path.join(__dirname, "../../Versions");

function parseVersion(version) {
  // Parse semantic version with optional pre-release suffix
  const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/);
  if (!match) {
    throw new Error(`Invalid version format: ${version}`);
  }

  return {
    major: parseInt(match[1], 10),
    minor: parseInt(match[2], 10),
    patch: parseInt(match[3], 10),
    prerelease: match[4] || null,
    full: version,
  };
}

function incrementVersion(version, isMaster = false) {
  const parsed = parseVersion(version);

  if (parsed.prerelease) {
    // Handle pre-release versions (e.g., "0.1.10-canary-1" -> "0.1.10-canary-2")
    const prereleaseMatch = parsed.prerelease.match(/^(.+)-(\d+)$/);
    if (prereleaseMatch) {
      const prefix = prereleaseMatch[1];
      const number = parseInt(prereleaseMatch[2], 10);

      if (isMaster) {
        // On master branch, remove pre-release suffix and increment patch
        return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
      } else {
        // On other branches, increment pre-release number
        return `${parsed.major}.${parsed.minor}.${parsed.patch}-${prefix}-${number + 1}`;
      }
    } else {
      // Pre-release without number, add -1
      if (isMaster) {
        return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
      } else {
        return `${parsed.major}.${parsed.minor}.${parsed.patch}-${parsed.prerelease}-1`;
      }
    }
  } else {
    // Stable version, increment patch
    return `${parsed.major}.${parsed.minor}.${parsed.patch + 1}`;
  }
}

function isStableRelease(version) {
  // Check if version is a stable release (not alpha, beta, canary, etc.)
  const prereleasePattern =
    /-(alpha|beta|canary|canery|rc|dev|pre|snapshot|nightly|test)/i;
  return !prereleasePattern.test(version);
}

function readVersionJson() {
  if (!fs.existsSync(VERSION_JSON_PATH)) {
    return {
      prod_version: "0.1.0",
      dev_version: "0.1.1-canary-1",
    };
  }

  return JSON.parse(fs.readFileSync(VERSION_JSON_PATH, "utf8"));
}

function writeVersionJson(versions) {
  fs.writeFileSync(VERSION_JSON_PATH, JSON.stringify(versions, null, 2) + "\n");
}

function readProjectData() {
  if (!fs.existsSync(PROJECT_DATA_PATH)) {
    throw new Error(`ProjectData file not found: ${PROJECT_DATA_PATH}`);
  }

  const content = fs.readFileSync(PROJECT_DATA_PATH, "utf8");
  const versionPattern = /version:\s*["']([^"']+)["']/;
  const match = content.match(versionPattern);

  if (!match) {
    throw new Error("Could not find version property in projectData.ts");
  }

  return {
    content,
    version: match[1],
  };
}

function writeProjectData(content, newVersion) {
  const versionPattern = /version:\s*["']([^"']+)["']/;
  const newContent = content.replace(
    versionPattern,
    `version: "${newVersion}"`,
  );
  fs.writeFileSync(PROJECT_DATA_PATH, newContent, "utf8");
}

function createVersionFile(version, releaseNotes) {
  if (!fs.existsSync(VERSIONS_DIR)) {
    fs.mkdirSync(VERSIONS_DIR, { recursive: true });
  }

  // Convert version to filename format (e.g., "0.1.10" -> "v0-1-10.md")
  const filename = `v${version.replace(/\./g, "-")}.md`;
  const filepath = path.join(VERSIONS_DIR, filename);

  // Don't overwrite existing version files
  if (fs.existsSync(filepath)) {
    console.log(`Version file already exists: ${filename}`);
    return filepath;
  }

  const repoName = process.env.GITHUB_REPOSITORY || "your-org/your-repo";
  const content = `# Updates v${version}

${releaseNotes}

**Release Date:** ${new Date().toISOString().split("T")[0]}

**Docker Image:**
\`\`\`bash
docker pull ghcr.io/${repoName}:v${version}
\`\`\`

**Full Changelog:** https://github.com/${repoName}/releases/tag/v${version}
`;

  fs.writeFileSync(filepath, content);
  console.log(`Created version file: ${filename}`);
  return filepath;
}

function getCommitsSinceLastTag() {
  try {
    // Get the last tag
    const lastTag = execSync("git describe --tags --abbrev=0 2>/dev/null", {
      encoding: "utf8",
    }).trim();

    // Get commits since last tag
    const commits = execSync(
      `git log ${lastTag}..HEAD --pretty=format:"%s (%h)" --no-merges`,
      {
        encoding: "utf8",
      },
    ).trim();

    return commits ? commits.split("\n") : [];
  } catch (error) {
    // If no tags exist, get recent commits
    try {
      const commits = execSync(
        'git log --pretty=format:"%s (%h)" --no-merges -10',
        {
          encoding: "utf8",
        },
      ).trim();

      return commits ? commits.split("\n") : [];
    } catch (e) {
      return [];
    }
  }
}

function categorizeCommits(commits) {
  const categories = {
    features: [],
    fixes: [],
    improvements: [],
    chores: [],
    other: [],
  };

  commits.forEach((commit) => {
    // Skip auto-increment commits
    if (commit.includes("🤖 Auto-increment version")) {
      return;
    }

    const lowerCommit = commit.toLowerCase();

    if (
      lowerCommit.startsWith("feat:") ||
      lowerCommit.startsWith("feature:") ||
      lowerCommit.includes("add ") ||
      lowerCommit.includes("new ")
    ) {
      categories.features.push(commit);
    } else if (
      lowerCommit.startsWith("fix:") ||
      lowerCommit.startsWith("bug:") ||
      lowerCommit.includes("fix ") ||
      lowerCommit.includes("resolve")
    ) {
      categories.fixes.push(commit);
    } else if (
      lowerCommit.startsWith("improve:") ||
      lowerCommit.startsWith("enhancement:") ||
      lowerCommit.includes("improve ") ||
      lowerCommit.includes("optimize")
    ) {
      categories.improvements.push(commit);
    } else if (
      lowerCommit.startsWith("chore:") ||
      lowerCommit.startsWith("ci:") ||
      lowerCommit.startsWith("docs:") ||
      lowerCommit.includes("update ")
    ) {
      categories.chores.push(commit);
    } else {
      categories.other.push(commit);
    }
  });

  return categories;
}

function generateReleaseNotes(version) {
  const commits = getCommitsSinceLastTag();

  if (commits.length === 0) {
    return `Automatic release for version ${version}.

This release includes the latest updates and improvements. For detailed changes, please refer to the commit history and pull requests.`;
  }

  const categories = categorizeCommits(commits);
  let notes = `## What's Changed in v${version}\n\n`;

  // Features
  if (categories.features.length > 0) {
    notes += "### ✨ New Features\n";
    categories.features.forEach((commit) => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Bug fixes
  if (categories.fixes.length > 0) {
    notes += "### 🐛 Bug Fixes\n";
    categories.fixes.forEach((commit) => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Improvements
  if (categories.improvements.length > 0) {
    notes += "### 🚀 Improvements\n";
    categories.improvements.forEach((commit) => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Other changes
  if (categories.other.length > 0) {
    notes += "### 📝 Other Changes\n";
    categories.other.forEach((commit) => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Maintenance (less prominent)
  if (categories.chores.length > 0) {
    notes += "### 🔧 Maintenance\n";
    categories.chores.forEach((commit) => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  return notes.trim();
}

function main() {
  try {
    const isMaster =
      process.env.GITHUB_REF_NAME === "master" ||
      process.env.GITHUB_REF_NAME === "main" ||
      process.argv.includes("--master");

    console.log(`Running on branch: ${process.env.GITHUB_REF_NAME || "local"}`);
    console.log(`Master branch mode: ${isMaster}`);

    // Read current state
    const versions = readVersionJson();
    const projectData = readProjectData();

    console.log(`Current prod_version: ${versions.prod_version}`);
    console.log(`Current dev_version: ${versions.dev_version}`);
    console.log(`Current projectData version: ${projectData.version}`);

    let newVersion;
    let newProdVersion = versions.prod_version;
    let newDevVersion;

    // Check if prod and dev versions are the same
    if (versions.prod_version === versions.dev_version) {
      console.log(
        "prod_version == dev_version, auto-incrementing and adding canary suffix",
      );
      newDevVersion = incrementVersion(versions.dev_version) + "-canary-1";
      newVersion = newDevVersion;
    } else {
      // Normal increment logic
      if (isMaster) {
        // On master: increment and potentially remove canary
        newVersion = incrementVersion(projectData.version, true);

        // If this creates a stable version, update prod_version
        if (isStableRelease(newVersion)) {
          newProdVersion = newVersion;
          newDevVersion = newVersion;
        } else {
          newDevVersion = newVersion;
        }
      } else {
        // On other branches: normal increment
        newVersion = incrementVersion(projectData.version, false);
        newDevVersion = newVersion;
      }
    }

    // Update projectData.ts
    writeProjectData(projectData.content, newVersion);
    console.log(
      `Updated projectData.ts: ${projectData.version} → ${newVersion}`,
    );

    // Update version.json
    const newVersions = {
      prod_version: newProdVersion,
      dev_version: newDevVersion,
    };
    writeVersionJson(newVersions);
    console.log(`Updated version.json:`, newVersions);

    // Create version file for stable releases
    let versionFilePath = null;
    if (isStableRelease(newVersion) && isMaster) {
      const releaseNotes = generateReleaseNotes(newVersion);
      versionFilePath = createVersionFile(newVersion, releaseNotes);
    }

    // Output for GitHub Actions
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `previous_version=${projectData.version}\n`,
      );
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `new_version=${newVersion}\n`,
      );
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `is_stable=${isStableRelease(newVersion)}\n`,
      );
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `is_master=${isMaster}\n`);
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `prod_version=${newProdVersion}\n`,
      );
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `dev_version=${newDevVersion}\n`,
      );

      if (versionFilePath) {
        fs.appendFileSync(
          process.env.GITHUB_OUTPUT,
          `version_file=${path.basename(versionFilePath)}\n`,
        );
      }
    } else {
      // Local testing output
      console.log("\n=== OUTPUTS ===");
      console.log(`previous_version=${projectData.version}`);
      console.log(`new_version=${newVersion}`);
      console.log(`is_stable=${isStableRelease(newVersion)}`);
      console.log(`is_master=${isMaster}`);
      console.log(`prod_version=${newProdVersion}`);
      console.log(`dev_version=${newDevVersion}`);
      if (versionFilePath) {
        console.log(`version_file=${path.basename(versionFilePath)}`);
      }
    }
  } catch (error) {
    console.error("Error managing versions:", error.message);
    process.exit(1);
  }
}

// Export functions for testing
export {
  parseVersion,
  incrementVersion,
  isStableRelease,
  readVersionJson,
  writeVersionJson,
  createVersionFile,
  generateReleaseNotes,
  getCommitsSinceLastTag,
  categorizeCommits,
};

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
