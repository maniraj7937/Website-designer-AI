import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const BASE_DIR = process.env.VERCEL
  ? path.join("/tmp", "generated")
  : path.join(process.cwd(), "generated");

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
    const target = path.resolve(BASE_DIR, file);
    const base = path.resolve(BASE_DIR);
    if (target !== base && !target.startsWith(base + path.sep)) {
      return Response.json({ error: "Invalid path" }, { status: 400 });
    }
    try {
      const content = await fs.readFile(target, "utf8");
      return Response.json({ file, content });
    } catch {
      return Response.json({ error: "File not found" }, { status: 404 });
    }
  }

  const files = await listFiles(BASE_DIR, BASE_DIR);
  files.sort();
  return Response.json({ files });
}
