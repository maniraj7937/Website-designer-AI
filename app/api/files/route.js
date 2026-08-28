import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const BASE_DIR = process.env.VERCEL
  ? path.join("/tmp", "generated")
  : path.join(process.cwd(), "generated");

/**
 * Validates and resolves a file path to prevent directory traversal attacks.
 */
function safePath(filepath) {
  const resolved = path.resolve(BASE_DIR, filepath);
  const base = path.resolve(BASE_DIR);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error("Path is outside the agent workspace");
  }
  return resolved;
}

async function listFiles(dir, base) {
  const out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out; // workspace doesn't exist yet
  }
  for (const entry of entries) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await listFiles(full, base)));
    } else {
      out.push(path.relative(base, full).split(path.sep).join("/"));
    }
  }
  return out;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  if (file) {
    try {
      const target = safePath(file);
      const content = await fs.readFile(target, "utf8");
      return Response.json({ file, content });
    } catch (error) {
      return Response.json({ error: error.message || "File not found" }, { status: 404 });
    }
  }

  const files = await listFiles(BASE_DIR, BASE_DIR);
  files.sort();
  return Response.json({ files });
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    // Supports both 'target' and 'file' query parameters for compatibility
    const targetParam = searchParams.get("target") || searchParams.get("file");

    if (!targetParam) {
      return Response.json({ error: "Target or file parameter is required" }, { status: 400 });
    }

    const target = safePath(targetParam);
    
    // Use fs.rm with recursive option to support deleting both files and directories securely
    await fs.rm(target, { recursive: true, force: true });
    
    return Response.json({ success: true, message: "Target deleted successfully" });
  } catch (error) {
    return Response.json({ error: error.message || "Failed to delete target" }, { status: 500 });
  }
}