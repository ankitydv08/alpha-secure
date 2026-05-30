export interface DetectedFramework {
  frontend: string[];
  backend: string[];
  tools: string[];
}

/**
 * Detects React, Express, Next.js, Vite from package.json deps.
 */
export function detectFramework(files: FileMap): DetectedFramework {
  const result: DetectedFramework = {
    frontend: [],
    backend: [],
    tools: [],
  };

  // Find package.json files (root or one level deep)
  const pkgFiles = Object.entries(files).filter(
    ([path]) =>
      path === "package.json" ||
      (path.includes("/package.json") && path.split("/").length <= 3)
  );

  for (const [, content] of pkgFiles) {
    let pkg: Record<string, unknown>;
    try {
      pkg = JSON.parse(content);
    } catch {
      continue;
    }

    const allDeps = {
      ...((pkg.dependencies as Record<string, string>) || {}),
      ...((pkg.devDependencies as Record<string, string>) || {}),
    };

    const depNames = Object.keys(allDeps);

    if (depNames.includes("next")) result.frontend.push("Next.js");
    if (depNames.includes("react") && !depNames.includes("next"))
      result.frontend.push("React");
    if (depNames.includes("vue")) result.frontend.push("Vue.js");
    if (depNames.includes("express")) result.backend.push("Express.js");
    if (depNames.includes("fastify")) result.backend.push("Fastify");
    if (depNames.includes("koa")) result.backend.push("Koa");
    if (depNames.includes("vite")) result.tools.push("Vite");
    if (depNames.includes("webpack")) result.tools.push("Webpack");
    if (depNames.includes("typescript")) result.tools.push("TypeScript");
  }

  return result;
}

export type FileMap = Record<string, string>;
