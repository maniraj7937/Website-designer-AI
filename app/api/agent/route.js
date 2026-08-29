import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { kv } from "@vercel/kv";

const IS_VERCEL = !!process.env.VERCEL;
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const asyncExecute = promisify(exec);
const BASE_DIR = process.env.VERCEL
  ? path.join("/tmp", "generated")
  : path.join(process.cwd(), "generated");
const MODEL = "gemini-3.5-flash-lite";
const MAX_AGENT_TURNS = 12; // Increased turns so agent has time to create HTML, CSS, and JS

function safePath(filepath) {
  const resolved = path.resolve(BASE_DIR, filepath);
  const base = path.resolve(BASE_DIR);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error("Path is outside the agent workspace");
  }
  return resolved;
}

async function executeCommand({ command }) {
  try {
    await fs.mkdir(BASE_DIR, { recursive: true });
    const { stdout, stderr } = await asyncExecute(command, { cwd: BASE_DIR, timeout: 20000 });
    if (stderr) return { error: stderr };
    return { success: true, output: stdout || "Task executed completely" };
  } catch (error) {
    return { error: error.message };
  }
}

async function writeFile({ filepath, content }) {
  try {
    const normalizedPath = filepath.replace(/\\/g, "/");
    if (IS_VERCEL) {
      await kv.set(`file:${normalizedPath}`, content);
      return { success: true, output: `Successfully wrote file to cloud storage: ${normalizedPath}` };
    } else {
      const target = safePath(normalizedPath);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, content, "utf8");
      return { success: true, output: `Successfully wrote file locally: ${normalizedPath}` };
    }
  } catch (error) {
    return { error: error.message };
  }
}

const availableTools = { executeCommand, writeFile };
const tools = [{
  functionDeclarations: [
    {
      name: "executeCommand",
      description: "Execute terminal shell commands like mkdir for directory management.",
      parameters: { type: "OBJECT", properties: { command: { type: "STRING" } }, required: ["command"] },
    },
    {
      name: "writeFile",
      description: "Write code content directly into files. MANDATORY: You must write index.html, style.css, AND script.js for every website project.",
      parameters: {
        type: "OBJECT",
        properties: { filepath: { type: "STRING" }, content: { type: "STRING" } },
        required: ["filepath", "content"],
      },
    },
  ],
}];

const systemInstruction = `You are a world-class Full Stack Website Architect and Senior Frontend Engineer. Your objective is to build complete, multi-file, fully functional, production-ready web applications based on user prompts.

## MANDATORY RULES
1. **Always Create 3 Files:** For every request, you MUST create a folder and write THREE separate files using the \`writeFile\` tool:
   - \`folder-name/index.html\` (linking to style.css and script.js)
   - \`folder-name/style.css\` (modern, responsive CSS design)
   - \`folder-name/script.js\` (full production JavaScript containing all interactive button handlers, dynamic rendering, and logic)
2. **Never Skip script.js:** Do not put JavaScript inside HTML script tags unless necessary; always implement fully working functionality inside \`script.js\`.
3. **Complete Code Only:** No placeholders or comments like \`// add code here\`. Write fully working, production-ready code.

## Execution Workflow
1. Use \`executeCommand\` to create the directory: \`mkdir project-name\`
2. Use \`writeFile\` to create \`project-name/index.html\`
3. Use \`writeFile\` to create \`project-name/style.css\`
4. Use \`writeFile\` to create \`project-name/script.js\` with full interactive logic.
`;

async function getGeneratedFiles() {
  const generatedFiles = {};
  if (IS_VERCEL) {
    try {
      const keys = await kv.keys("file:*");
      for (const k of keys) {
        const relPath = k.replace("file:", "");
        if (relPath.endsWith(".html") || relPath.endsWith(".css") || relPath.endsWith(".js")) {
          generatedFiles[relPath] = await kv.get(k);
        }
      }
    } catch {
      // Ignore read errors
    }
  } else {
    try {
      const entries = await fs.readdir(BASE_DIR, { recursive: true, withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile()) {
          const relPath = path.relative(BASE_DIR, path.join(entry.path || entry.parentPath, entry.name));
          if (relPath.endsWith(".html") || relPath.endsWith(".css") || relPath.endsWith(".js")) {
            try {
              generatedFiles[relPath] = await fs.readFile(safePath(relPath), "utf8");
            } catch {
              // Ignore read errors
            }
          }
        }
      }
    } catch {
      // Directory might not exist yet
    }
  }
  return generatedFiles;
}

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json({ error: "GEMINI_API_KEY is not set. Add it to .env.local." }, { status: 500 });
    }

    const { message, history = [] } = await request.json();
    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    await fs.mkdir(BASE_DIR, { recursive: true });
    const conversation = [...history, { role: "user", parts: [{ text: message }] }];
    const toolLogs = [];
    let reply = "";

    for (let turn = 0; turn < MAX_AGENT_TURNS; turn += 1) {
      const response = await ai.models.generateContent({
        model: MODEL,
        contents: conversation,
        config: { systemInstruction, tools },
      });

      if (response.functionCalls?.length) {
        const call = response.functionCalls[0];
        if (response.candidates?.length) conversation.push(response.candidates[0].content);
        
        const result = availableTools[call.name]
          ? await availableTools[call.name](call.args)
          : { error: `Unknown tool: ${call.name}` };
          
        toolLogs.push({
          tool: call.name,
          args: call.name === "writeFile" ? { filepath: call.args?.filepath } : { ...call.args },
          result: result.error ? { error: String(result.error).slice(0, 300) } : { success: true },
        });
        
        conversation.push({ role: "user", parts: [{ functionResponse: { name: call.name, response: result } }] });
      } else {
        if (response.candidates?.length) conversation.push(response.candidates[0].content);
        reply = response.text || "Website built successfully!";
        break;
      }
    }

    if (!reply) reply = "I reached the step limit. Website files have been generated!";
    return Response.json({ 
      reply, 
      history: conversation, 
      toolLogs, 
      generatedFiles: await getGeneratedFiles() 
    });
  } catch (error) {
    return Response.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}