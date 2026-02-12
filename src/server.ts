import express from "express";
import { CopilotClient, defineTool } from "@github/copilot-sdk";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

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

// --- Initialize Copilot Client ---

const client = new CopilotClient();
let sessionMap = new Map();

// --- API Routes ---

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    // Create a new session for each request (simple approach)
    // For production, you might want to maintain sessions per user
    const session = await client.createSession({
      model: "gpt-4.1",
      streaming: false,
      tools: [performTask, lookupInfo, listTasks],
      systemMessage: {
        content:
          "You are a helpful custom agent that can perform tasks, look up information, " +
          "and manage a task queue. Be concise and action-oriented. When the user " +
          "asks you to do something, use the appropriate tool to accomplish it.",
      },
    });

    let fullResponse = "";

    // Collect the full response
    session.on("assistant.message_delta", (event) => {
      fullResponse += event.data.deltaContent;
    });

    // Wait for the session to complete
    await new Promise<void>((resolve, reject) => {
      session.on("session.idle", () => resolve());
      session.on("session.error", (event) => reject(new Error(event.data.message)));
      
      // Send the user message
      session.sendAndWait({ prompt: message }).catch(reject);
    });

    res.json({ response: fullResponse });
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "Failed to process message",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Epic Copilot Web UI running at http://localhost:${PORT}`);
  console.log(`   Open your browser and start chatting!`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\n👋 Shutting down server...");
  await client.stop();
  process.exit(0);
});
