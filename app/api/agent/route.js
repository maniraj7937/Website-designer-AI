import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";
import os from "os";

// Allow up to 60s on Vercel for multi-step agent runs
export const maxDuration = 60;
export const dynamic = "force-dynamic";

const asyncExecute = promisify(exec);

// Vercel's filesystem is read-only except /tmp, so the agent's workspace
// moves there automatically when deployed. Locally it's ./generated
const BASE_DIR = process.env.VERCEL
  ? path.join("/tmp", "generated")
  : path.join(process.cwd(), "generated");

const MODELS_TO_TRY = ["gemini-3.5-flash-lite"];

const MAX_AGENT_TURNS = 5;

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Keep every path the model asks for inside the workspace folder
function safePath(filepath) {
  const resolved = path.resolve(BASE_DIR, filepath);
  const base = path.resolve(BASE_DIR);
  if (resolved !== base && !resolved.startsWith(base + path.sep)) {
    throw new Error("Path is outside the agent workspace");
  }
  return resolved;
}

// ---------- tools ----------

async function executeCommand({ command }) {
  try {
    await fs.mkdir(BASE_DIR, { recursive: true });
    const { stdout, stderr } = await asyncExecute(command, {
      cwd: BASE_DIR,
      timeout: 20000,
    });
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

const executeCommandDeclaration = {
  name: "executeCommand",
  description:
    "Execute short shell commands like 'mkdir folder'. Do NOT use this to write file contents.",
  parameters: {
    type: "OBJECT",
    properties: {
      command: { type: "STRING" },
    },
    required: ["command"],
  },
};

const writeFileDeclaration = {
  name: "writeFile",
  description: "Write code or text content directly into a file safely.",
  parameters: {
    type: "OBJECT",
    properties: {
      filepath: {
        type: "STRING",
        description: "Relative path to the file, e.g., calculator/index.html",
      },
      content: {
        type: "STRING",
        description: "The complete code to put inside the file.",
      },
    },
    required: ["filepath", "content"],
  },
};

const availableTools = { executeCommand, writeFile };

const SYSTEM_INSTRUCTION = `You are a Website builder expert. You have to create the frontend of the website by analysing the user Input.
You have two tools:
1. 'executeCommand' for shell commands like creating folders (e.g., mkdir).
2. 'writeFile' to write code into files. ALWAYS use 'writeFile' instead of shell echo commands.

All commands and file paths run inside a dedicated workspace folder. ALWAYS use relative paths (e.g., "calculator/index.html"), never absolute paths.

Current server operating system is: ${os.platform()}

<-- Your job -->
1: Analyze the user query to see what type of website they want to build
2: Work step by step, one tool call at a time
3: Typical flow: create a project folder, then write index.html, style.css and script.js inside it using 'writeFile'
4: When everything is created, reply with a short friendly summary of what you built and which files exist.`;

// ---------- model call with retry + fallback (same strategy as the CLI version) ----------

async function callModelWithRetry(ai, contents) {
  let modelIndex = 0;
  const maxRetries = 1;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const currentModel = MODELS_TO_TRY[modelIndex];
    try {
      
      return await ai.models.generateContent({
        model: currentModel,
        contents,
        config: {
          systemInstruction: SYSTEM_INSTRUCTION,
          tools: [
            {
              functionDeclarations: [
                executeCommandDeclaration,
                writeFileDeclaration,
              ],
            },
          ],
        },
      });
    } catch (error) {
      const errStatus =
        error.status || error.statusCode || (error.error && error.error.code);
      const errCode = error.cause?.code || error.code;
      const retryable =
        errStatus === 429 ||
        errStatus === 503 ||
        errCode === "ECONNRESET" ||
        errCode === "UND_ERR_CONNECT_TIMEOUT";

      if (!retryable) throw error;

      if (attempt < maxRetries) {
        await sleep(Math.pow(2, attempt) * 1000);
      } else if (modelIndex < MODELS_TO_TRY.length - 1) {
        modelIndex++;
        attempt = 0; // fresh retries for the fallback model
      }
    }
  }
  return null;
}

// ---------- API handler ----------

export async function POST(request) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return Response.json(
        {
          error:
            "GEMINI_API_KEY is not set. Add it to .env.local (locally) or Project → Environment Variables (Vercel).",
        },
        { status: 500 }
      );
    }

    const { message, history = [] } = await request.json();
    if (!message || typeof message !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey });
    await fs.mkdir(BASE_DIR, { recursive: true });

    const History = [...history, { role: "user", parts: [{ text: message }] }];
    const toolLogs = [];
    let reply = "";

    for (let turn = 0; turn < MAX_AGENT_TURNS; turn++) {
      const response = await callModelWithRetry(ai, History);

      if (!response) {
        reply =
          "The AI service is busy or unreachable right now. Please try again in a moment.";
        break;
      }

      if (response.functionCalls && response.functionCalls.length > 0) {
        const call = response.functionCalls[0];

        if (response.candidates && response.candidates.length > 0) {
          History.push(response.candidates[0].content);
        }

        const { name, args } = call;
        const funCall = availableTools[name];
        const result = funCall
          ? await funCall(args)
          : { error: `Unknown tool: ${name}` };

        // Log a compact version for the UI (skip huge file contents)
        toolLogs.push({
          tool: name,
          args:
            name === "writeFile" ? { filepath: args.filepath } : { ...args },
          result: result.error
            ? { error: String(result.error).slice(0, 300) }
            : { success: true },
        });

        History.push({
          role: "user",
          parts: [{ functionResponse: { name, response: result } }],
        });
      } else {
        if (response.candidates && response.candidates.length > 0) {
          History.push(response.candidates[0].content);
        }
        reply = response.text || "Done!";
        break;
      }
    }

    if (!reply) {
      reply =
        "I reached the step limit for this request. The files created so far are in the panel on the right — ask me to continue if something is missing.";
    }

    return Response.json({ reply, history: History, toolLogs });
  } catch (error) {
    return Response.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
