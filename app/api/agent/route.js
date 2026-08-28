import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";
const platform = os.platform(); // returns 'win32', 'darwin', 'linux', etc.

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const asyncExecute = promisify(exec);
const BASE_DIR = process.env.VERCEL
  ? path.join("/tmp", "generated")
  : path.join(process.cwd(), "generated");
const MODEL = "gemini-3.5-flash-lite";
const MAX_AGENT_TURNS = 7;

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
    const target = safePath(filepath);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, content, "utf8");
    return { success: true, output: `Successfully wrote file to ${filepath}` };
  } catch (error) {
    return { error: error.message };
  }
}

const availableTools = { executeCommand, writeFile };
const tools = [{
  functionDeclarations: [
    {
      name: "executeCommand",
      description: "Execute short shell commands like mkdir folder. Do NOT use touch or shell commands to create files; use writeFile instead.",
      parameters: { type: "OBJECT", properties: { command: { type: "STRING" } }, required: ["command"] },
    },
    {
      name: "writeFile",
      description: "Write complete code or text content directly into a file safely. ALWAYS use this tool to create index.html, style.css, and script.js with full functional code.",
      parameters: {
        type: "OBJECT",
        properties: { filepath: { type: "STRING" }, content: { type: "STRING" } },
        required: ["filepath", "content"],
      },
    },
  ],
}];

const systemInstruction = `You are a full stack Website builder expert. You have to create the frontend of the website by analysing the user Input.
        You have two tools:
        1. 'executeCommand' for shell commands like creating folders (e.g., mkdir).
        2. 'writeFile' to write code into files. ALWAYS use 'writeFile' instead of shell echo commands.
        
       Current user operating system is: ${os.platform()}
        Give commands to the user according to its operating system support.

<-- Your job -->
1: Analyze the user query to see what type of website they want to build
2: Give commands one by one, step by step
3: Use available tool executeCommand

Example command flow:
1: Create a folder, e.g. mkdir "calculator"
2: Inside the folder create index.html, e.g. touch "calculator/index.html"
3: Then create  calculator /style.css
4: Then create  calculator/script.js
5: Write code in the html file

You have to provide terminal or shell commands to the user, they will directly execute them.`;

async function getGeneratedFiles() {
  const generatedFiles = {};
  try {
    const entries = await fs.readdir(BASE_DIR, { recursive: true, withFileTypes: true });
    for (const entry of entries) {
      if (entry.isFile()) {
        const relPath = path.relative(BASE_DIR, path.join(entry.path || entry.parentPath, entry.name));
        // Only grab web code files
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