import { readFileSync, writeFileSync, readdirSync } from "fs";
import { join } from "path";
import { builtinModules } from "module";

/**
 * Recursively get all files from a directory
 */
function getFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
    const res = join(dir, d.name);
    return d.isDirectory() ? getFiles(res) : res;
  });
}

/**
 * Extract imports from file content
 * Supports:
 *   import x from 'pkg'
 *   import 'pkg'
 */
function extractImports(content) {
  const regex =
    /(?:from\s+['"`]([^'"`]+)['"`]|import\s+['"`]([^'"`]+)['"`])/g;

  const matches = [];
  let m;

  while ((m = regex.exec(content))) {
    matches.push(m[1] || m[2]);
  }

  return matches;
}

/**
 * Normalize package names
 * - Handles scoped packages (@scope/pkg)
 * - Removes subpaths (lodash/get → lodash)
 */
function normalizePackage(p) {
  if (!p) return null;

  // ❌ ignore relative + alias imports
  if (p.startsWith(".") || p.startsWith("@/")) return null;

  // ✅ scoped packages
  if (p.startsWith("@")) {
    const parts = p.split("/");
    return parts.length >= 2 ? `${parts[0]}/${parts[1]}` : null;
  }

  // ✅ normal packages
  return p.split("/")[0];
}

/**
 * MAIN
 */

// 1. Collect all worker-related files
const files = [
  ...getFiles("src/workers"),
  ...getFiles("src/lib"),
].filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

// 2. Extract all imports
let imports = [];

for (const file of files) {
  const content = readFileSync(file, "utf8");
  imports.push(...extractImports(content));
}

// 3. Normalize + dedupe
imports = [...new Set(imports)]
  .map(normalizePackage)
  .filter(Boolean)
  .sort();

// 4. Load dependencies from main package.json
const main = JSON.parse(readFileSync("package.json", "utf8"));
const allDeps = {
  ...main.dependencies,
  ...main.devDependencies,
};

// 5. Node built-ins (crypto, fs, etc.)
const builtins = new Set(builtinModules);

// 6. Match dependencies
const deps = {};
const missing = [];

for (const pkg of imports) {
  if (builtins.has(pkg)) continue;

  if (allDeps[pkg]) {
    deps[pkg] = allDeps[pkg];
  } else {
    missing.push(pkg);
  }
}

// 7. Warnings
if (missing.length) {
  console.warn("⚠️ Not found in package.json:", missing);
}

// 8. Write worker package.json
writeFileSync(
  "package.worker.json",
  JSON.stringify(
    {
      name: "wa-api-worker",
      version: "1.0.0",
      private: true,
      dependencies: deps,
    },
    null,
    2
  )
);

console.log(`✅ Written ${Object.keys(deps).length} deps to package.worker.json`);