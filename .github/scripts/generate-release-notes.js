#!/usr/bin/env node

import { execSync } from "child_process";
import fs from "fs";

function getCommitsSinceLastTag() {
  try {
    // Get the last tag
    const lastTag = execSync("git describe --tags --abbrev=0 2>/dev/null", {
      encoding: "utf8",
    }).trim();

    // Get commits since last tag
    const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s"`, {
      encoding: "utf8",
    }).trim();

    return commits ? commits.split("\n") : [];
  } catch (error) {
    // If no tags exist, get all commits from the beginning
    try {
      const commits = execSync('git log --pretty=format:"%s"', {
        encoding: "utf8",
      }).trim();

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
    breaking: [],
    other: []
  };

  commits.forEach(commit => {
    // Skip auto-increment commits
    if (commit.includes("🤖 Auto-increment version")) {
      return;
    }

    const lowerCommit = commit.toLowerCase();

    if (lowerCommit.includes("breaking") || lowerCommit.includes("breaking change")) {
      categories.breaking.push(commit);
    } else if (lowerCommit.startsWith("feat:") || lowerCommit.startsWith("feature:") || lowerCommit.includes("add ")) {
      categories.features.push(commit);
    } else if (lowerCommit.startsWith("fix:") || lowerCommit.startsWith("bug:") || lowerCommit.includes("fix ")) {
      categories.fixes.push(commit);
    } else if (lowerCommit.startsWith("improve:") || lowerCommit.startsWith("enhancement:") || lowerCommit.includes("improve ")) {
      categories.improvements.push(commit);
    } else if (lowerCommit.startsWith("chore:") || lowerCommit.startsWith("ci:") || lowerCommit.startsWith("docs:")) {
      categories.chores.push(commit);
    } else {
      categories.other.push(commit);
    }
  });

  return categories;
}

function generateReleaseNotes(version, categories) {
  let notes = `# Release ${version}\n\n`;

  // Add date
  const date = new Date().toISOString().split('T')[0];
  notes += `**Release Date:** ${date}\n\n`;

  // Breaking changes (if any)
  if (categories.breaking.length > 0) {
    notes += "## ⚠️ Breaking Changes\n\n";
    categories.breaking.forEach(commit => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Features
  if (categories.features.length > 0) {
    notes += "## ✨ New Features\n\n";
    categories.features.forEach(commit => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Bug fixes
  if (categories.fixes.length > 0) {
    notes += "## 🐛 Bug Fixes\n\n";
    categories.fixes.forEach(commit => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Improvements
  if (categories.improvements.length > 0) {
    notes += "## 🚀 Improvements\n\n";
    categories.improvements.forEach(commit => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Other changes
  if (categories.other.length > 0) {
    notes += "## 📝 Other Changes\n\n";
    categories.other.forEach(commit => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Chores (optional, usually less important)
  if (categories.chores.length > 0) {
    notes += "## 🔧 Maintenance\n\n";
    categories.chores.forEach(commit => {
      notes += `- ${commit}\n`;
    });
    notes += "\n";
  }

  // Add footer
  notes += "---\n\n";
  notes += `**Full Changelog:** https://github.com/${process.env.GITHUB_REPOSITORY}/compare/...${version}\n\n`;

  return notes.trim();
}

function main() {
  const version = process.argv[2];

  if (!version) {
    console.error("Usage: node generate-release-notes.js <version>");
    process.exit(1);
  }

  console.log(`Generating release notes for version ${version}...`);

  const commits = getCommitsSinceLastTag();
  console.log(`Found ${commits.length} commits since last release`);

  const categories = categorizeCommits(commits);
  const releaseNotes = generateReleaseNotes(version, categories);

  // Output for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    // Escape newlines for GitHub Actions
    const escapedNotes = releaseNotes.replace(/\n/g, '%0A').replace(/\r/g, '%0D');
    fs.appendFileSync(process.env.GITHUB_OUTPUT, `release_notes=${escapedNotes}\n`);

    // Also write to a file for easier debugging
    fs.writeFileSync('release-notes.md', releaseNotes);
    console.log("Release notes written to release-notes.md");
  } else {
    // For local testing
    console.log("\n" + "=".repeat(50));
    console.log("RELEASE NOTES:");
    console.log("=".repeat(50));
    console.log(releaseNotes);
  }
}

// Run if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { generateReleaseNotes, categorizeCommits, getCommitsSinceLastTag };
