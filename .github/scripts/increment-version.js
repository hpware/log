#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PROJECT_DATA_PATH = path.join(__dirname, "../../apps/web/projectData.ts");

function incrementVersion(version) {
  // Handle different version formats:
  // "0.1.10-canery-1" -> "0.1.10-canery-2"
  // "0.1.10" -> "0.1.11"
  // "1.2.3-alpha-5" -> "1.2.3-alpha-6"

  // Pattern 1: ends with -number (e.g., "0.1.10-canery-1")
  const dashNumberPattern = /^(.+-)(\d+)$/;
  const dashMatch = version.match(dashNumberPattern);

  if (dashMatch) {
    const prefix = dashMatch[1];
    const number = parseInt(dashMatch[2], 10);
    return `${prefix}${number + 1}`;
  }

  // Pattern 2: semantic version (e.g., "0.1.10" or "1.2.3")
  const semverPattern = /^(\d+)\.(\d+)\.(\d+)(.*)$/;
  const semverMatch = version.match(semverPattern);

  if (semverMatch) {
    const major = parseInt(semverMatch[1], 10);
    const minor = parseInt(semverMatch[2], 10);
    const patch = parseInt(semverMatch[3], 10);
    const suffix = semverMatch[4] || "";
    return `${major}.${minor}.${patch + 1}${suffix}`;
  }

  // Fallback: find the last number in the string and increment it
  const lastNumberPattern = /^(.*?)(\d+)([^\d]*)$/;
  const lastNumberMatch = version.match(lastNumberPattern);

  if (lastNumberMatch) {
    const prefix = lastNumberMatch[1];
    const number = parseInt(lastNumberMatch[2], 10);
    const suffix = lastNumberMatch[3];
    return `${prefix}${number + 1}${suffix}`;
  }

  // If no number found, append .1
  return `${version}.1`;
}

function updateProjectData() {
  try {
    // Read the current file
    const content = fs.readFileSync(PROJECT_DATA_PATH, "utf8");

    // Extract current version using regex
    const versionPattern = /version:\s*["']([^"']+)["']/;
    const match = content.match(versionPattern);

    if (!match) {
      throw new Error("Could not find version property in projectData.ts");
    }

    const currentVersion = match[1];
    const newVersion = incrementVersion(currentVersion);

    // Replace the version in the content
    const newContent = content.replace(
      versionPattern,
      `version: "${newVersion}"`,
    );

    // Write back to file
    fs.writeFileSync(PROJECT_DATA_PATH, newContent, "utf8");

    console.log(`Version updated from ${currentVersion} to ${newVersion}`);

    // Output for GitHub Actions (using modern format)
    if (process.env.GITHUB_OUTPUT) {
      fs.appendFileSync(
        process.env.GITHUB_OUTPUT,
        `current=${currentVersion}\n`,
      );
      fs.appendFileSync(process.env.GITHUB_OUTPUT, `new=${newVersion}\n`);
    } else {
      // Fallback for local testing
      console.log(`current=${currentVersion}`);
      console.log(`new=${newVersion}`);
    }
  } catch (error) {
    console.error("Error updating version:", error.message);
    process.exit(1);
  }
}

// Run if this script is executed directly
if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  updateProjectData();
}

export { incrementVersion, updateProjectData };
