import "dotenv/config";
import express from "express";
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { randomUUID } from "crypto";
import { readFileSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.static(join(__dirname, "../public")));

// --- Custom Tools for the Agent ---

const performTask = defineTool("perform_task", {
  description:
    "Execute a specific task given a name and detailed instructions. " +
    "Use this tool when the user asks to perform an action.",
  parameters: {
    type: "object",
    properties: {
      taskName: {
        type: "string",
        description: "Short name describing the task",
      },
      instructions: {
        type: "string",
        description: "Detailed instructions for the task",
      },
      priority: {
        type: "string",
        enum: ["low", "medium", "high"],
        description: "Priority level of the task",
      },
    },
    required: ["taskName", "instructions"],
  },
  handler: async (args: {
    taskName: string;
    instructions: string;
    priority?: string;
  }) => {
    const priority = args.priority ?? "medium";
    console.log(`⚡ Executing task: "${args.taskName}" [${priority}]`);
    console.log(`   Instructions: ${args.instructions}`);

    return {
      status: "completed",
      taskName: args.taskName,
      priority,
      result: `Task "${args.taskName}" has been processed successfully.`,
    };
  },
});

const lookupInfo = defineTool("lookup_info", {
  description:
    "Look up information from the knowledge base on a given topic. " +
    "Use this when the user asks a factual question about something specific.",
  parameters: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description: "The search query or topic to look up",
      },
    },
    required: ["query"],
  },
  handler: async (args: { query: string }) => {
    console.log(`🔍 Looking up: "${args.query}"`);

    return {
      query: args.query,
      results: [
        {
          title: `Information about "${args.query}"`,
          summary:
            "This is a placeholder result. Connect your own data source here.",
        },
      ],
    };
  },
});

const listTasks = defineTool("list_tasks", {
  description:
    "List all pending or completed tasks tracked by the agent. " +
    "Use this when the user wants to see task status.",
  parameters: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["all", "pending", "completed"],
        description: "Filter tasks by status",
      },
    },
  },
  handler: async (args: { status?: string }) => {
    const filter = args.status ?? "all";
    console.log(`📋 Listing tasks (filter: ${filter})`);

    return {
      filter,
      tasks: [
        { id: 1, name: "Example task", status: "pending", priority: "medium" },
      ],
      message: "Connect a real task store to persist and manage tasks.",
    };
  },
});

// --- Copilot Client & Session Management ---

const client = new CopilotClient();

interface ManagedSession {
  session: Awaited<ReturnType<CopilotClient["createSession"]>>;
  busy: boolean;
}

const sessionCache = new Map<string, ManagedSession>();

// Track the active SSE response per session so delta listeners can stream to it
const activeResponses = new Map<string, express.Response>();

// ── TEMP MOCKS (remove when real data sources are wired up) ──────────────────
const PROJECT_NAME = "Parts Unlimited";

const MOCK_PROJECT_CONTEXT =
  `The user is currently working in the project called "${PROJECT_NAME}". ` +
  `All work-item operations, queries, and discussions should default to this project ` +
  `unless the user explicitly specifies a different one.`;
// ── END TEMP MOCKS ───────────────────────────────────────────────────────────

const SYSTEM_MESSAGE =
  "You are Epic Copilot, an AI assistant specialized in helping project managers, " +
  "product owners, and delivery managers manage work items on Azure Boards. " +
  "You ALWAYS operate within the Azure Boards context. All taxonomy assumptions " +
  "(e.g. epics, features, user stories, tasks, bugs, sprints, iterations, areas, backlogs) " +
  "MUST be mapped to Azure Boards work item types and categories. " +
  "Be concise and action-oriented.\n\n" +
  MOCK_PROJECT_CONTEXT + "\n\n" +
  "Tool routing rules:\n" +
  "- For ALL Azure Boards operations — creating, updating, querying, linking, and managing " +
  "work items, iterations, sprints, backlogs, areas, and any other Azure Boards category — " +
  "ALWAYS use the Azure DevOps CLI (az boards / az devops commands). Never fall back to other tools for these operations.\n" +
  "- For general discussion, chat questions, information retrieval about emails, meetings, " +
  "files, calendar, and other Microsoft 365 data — ALWAYS use the Work IQ MCP server.\n\n" +
  "When the user asks you to do something, use the appropriate tool to accomplish it.";

async function getOrCreateSession(sessionId: string): Promise<ManagedSession> {
  const existing = sessionCache.get(sessionId);
  if (existing) return existing;

  const session = await client.createSession({
    model: "claude-opus-4.6",
    streaming: true,
    tools: [performTask, lookupInfo, listTasks],
    mcpServers: {
      workiq: {
        type: "local",
        command: "npx",
        args: ["-y", "@microsoft/workiq", "mcp"],
        tools: ["*"],
        timeout: 300_000, // 5 minutes — some MCP calls can be slow, especially if they involve complex queries or multiple steps
      },
    },
    systemMessage: { content: SYSTEM_MESSAGE },
  });

  // Permanent delta listener — streams tokens to the active SSE response
  session.on("assistant.message_delta", (event: { data: { deltaContent: string } }) => {
    const res = activeResponses.get(sessionId);
    if (res && !res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: "delta", content: event.data.deltaContent })}\n\n`);
    }
  });

  const managed: ManagedSession = { session, busy: false };
  sessionCache.set(sessionId, managed);
  console.log(`🆕 Created session ${sessionId}`);
  return managed;
}

// --- API Routes ---

// Create a new session and return its ID
app.post("/api/sessions", async (_req, res) => {
  try {
    const sessionId = randomUUID();
    await getOrCreateSession(sessionId);
    res.json({ sessionId });
  } catch (error) {
    console.error("Session creation error:", error);
    res.status(500).json({
      error: "Failed to create session",
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Chat endpoint — streams response via SSE
app.post("/api/chat", async (req, res) => {
  const { message, sessionId } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Invalid message" });
  }
  if (!sessionId || typeof sessionId !== "string") {
    return res.status(400).json({ error: "Missing sessionId — call POST /api/sessions first" });
  }

  // Set up SSE headers
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no"); // disable nginx buffering if proxied
  res.flushHeaders();

  let managed: ManagedSession;
  try {
    managed = await getOrCreateSession(sessionId);
  } catch (error) {
    res.write(`data: ${JSON.stringify({ type: "error", message: "Failed to initialise session" })}\n\n`);
    res.end();
    return;
  }

  if (managed.busy) {
    res.write(`data: ${JSON.stringify({ type: "error", message: "Session is busy — wait for the previous response to finish" })}\n\n`);
    res.end();
    return;
  }

  managed.busy = true;
  activeResponses.set(sessionId, res);

  // Clean up on client disconnect
  req.on("close", () => {
    activeResponses.delete(sessionId);
    managed.busy = false;
  });

  console.log(`💬 [${sessionId.slice(0, 8)}] User: ${message}`);

  try {
    // 5-minute timeout — MCP tool calls (WorkIQ, Azure DevOps) can be slow
    await managed.session.sendAndWait({ prompt: message }, 300_000);

    if (!res.writableEnded) {
      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    }
    console.log(`✅ [${sessionId.slice(0, 8)}] Response complete`);
  } catch (error) {
    console.error(`❌ [${sessionId.slice(0, 8)}] Error:`, error);
    if (!res.writableEnded) {
      res.write(
        `data: ${JSON.stringify({ type: "error", message: error instanceof Error ? error.message : String(error) })}\n\n`
      );
      res.end();
    }
  } finally {
    activeResponses.delete(sessionId);
    managed.busy = false;
  }
});

// --- Start Server ---

async function startServer() {
  await client.start();
  console.log("✅ Copilot client initialised");

  app.listen(PORT, () => {
    console.log(`🚀 Epic Copilot running at http://localhost:${PORT}`);
    console.log(`   Real Copilot SDK — streaming responses via SSE`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down server...");
  await client.stop();
  process.exit(0);
});
