import { kv } from "@vercel/kv";
import fs from "fs/promises";
import path from "path";

export const dynamic = "force-dynamic";

const IS_VERCEL = !!process.env.VERCEL;
const BASE_DIR = path.join(process.cwd(), "generated");

async function listFiles(dir, base) {
  const out = [];
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        out.push(...(await listFiles(full, base)));
      } else {
        out.push(path.relative(base, full).split(path.sep).join("/"));
      }
    }
  } catch {
    // Directory might not exist yet
  }
  return out;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file");

  if (file) {
    if (IS_VERCEL) {
      const content = await kv.get(`file:${file}`);
      if (content === null) {
        return Response.json({ error: "File not found" }, { status: 404 });
      }
      return Response.json({ file, content });
    } else {
      try {
        const target = path.join(BASE_DIR, file);
        const content = await fs.readFile(target, "utf8");
        return Response.json({ file, content });
      } catch {
        return Response.json({ error: "File not found" }, { status: 404 });
      }
    }
  }

  if (IS_VERCEL) {
    const keys = await kv.keys("file:*");
    const files = keys.map((k) => k.replace("file:", "")).sort();
    return Response.json({ files });
  } else {
    const files = await listFiles(BASE_DIR, BASE_DIR);
    files.sort();
    return Response.json({ files });
  }
}

export async function DELETE(request) {
  const { searchParams } = new URL(request.url);
  const file = searchParams.get("file") || searchParams.get("target");

  if (!file) {
    return Response.json({ error: "File parameter required" }, { status: 400 });
  }

  if (IS_VERCEL) {
    await kv.del(`file:${file}`);
    return Response.json({ success: true });
  } else {
    try {
      const target = path.join(BASE_DIR, file);
      await fs.rm(target, { recursive: true, force: true });
      return Response.json({ success: true });
    } catch {
      return Response.json({ error: "Failed to delete" }, { status: 500 });
    }
  }
}