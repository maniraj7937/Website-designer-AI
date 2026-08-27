import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

export const maxDuration = 60;
export const dynamic = "force-dynamic";

const asyncExecute = promisify(exec);
const BASE_DIR = process.env.VERCEL
  ? path.join("/tmp", "generated")
  : path.join(process.cwd(), "generated");
const MODEL = "gemini-3.5-flash-lite";
const MAX_AGENT_TURNS = 5;

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
      description: "Execute short shell commands like mkdir folder. Do not use this to write file contents.",
      parameters: { type: "OBJECT", properties: { command: { type: "STRING" } }, required: ["command"] },
    },
    {
      name: "writeFile",
      description: "Write complete code or text content directly into a file safely.",
      parameters: {
        type: "OBJECT",
        properties: { filepath: { type: "STRING" }, content: { type: "STRING" } },
        required: ["filepath", "content"],
      },
    },
  ],
}];

const systemInstruction = `You are a Website builder expert. Analyze the user's request and create the frontend website.
Use executeCommand only for short shell commands such as mkdir. Use writeFile for all file contents.
Use relative paths inside the workspace, such as calculator/index.html. Never use absolute paths.
The current operating system is ${os.platform()}.
Create index.html, style.css, and script.js as appropriate, then reply with a short summary.`;

async function getGeneratedFiles() {
  const generatedFiles = {};
  for (const filename of ["index.html", "style.css", "script.js"]) {
    try {
      generatedFiles[filename] = await fs.readFile(safePath(filename), "utf8");
    } catch {
      // Files may be inside a generated project subdirectory.
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
        reply = response.text || "Done!";
        break;
      }
    }

    if (!reply) reply = "I reached the step limit. Ask me to continue if something is missing.";
    return Response.json({ reply, history: conversation, toolLogs, generatedFiles: await getGeneratedFiles() });
  } catch (error) {
    return Response.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
