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
let isClientReady = false;

// Initialize client
async function initializeClient() {
  try {
    await client.start();
    isClientReady = true;
    console.log("✅ Copilot client initialized successfully");
  } catch (error) {
    console.error("❌ Failed to initialize Copilot client:", error);
    console.error("   Make sure you have GitHub Copilot CLI installed and authenticated.");
    process.exit(1);
  }
}

// --- API Routes ---

app.post("/api/chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Invalid message" });
    }

    // For demonstration purposes, we'll create a mock response
    // In production with proper Copilot authentication, this would use the real SDK
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Generate a helpful response based on the message
    let response = "";
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("task") && lowerMessage.includes("create")) {
      response = "I'd be happy to help you create a task! To create a task, I need:\n\n" +
                 "1. **Task name** - A short title for your task\n" +
                 "2. **Instructions** - Detailed description of what needs to be done\n" +
                 "3. **Priority** - Choose from: low, medium, or high\n\n" +
                 "Please provide these details and I'll create the task for you.";
    } else if (lowerMessage.includes("list") && lowerMessage.includes("task")) {
      response = "Here are your current tasks:\n\n" +
                 "📋 **Task List**\n" +
                 "1. Example task - Status: pending - Priority: medium\n\n" +
                 "You currently have 1 task in your queue.";
    } else if (lowerMessage.includes("look up") || lowerMessage.includes("search") || lowerMessage.includes("find")) {
      response = "I can help you search the knowledge base! What specific topic or information are you looking for? " +
                 "I have access to various resources and can provide detailed information.";
    } else if (lowerMessage.includes("hello") || lowerMessage.includes("hi")) {
      response = "Hello! 👋 I'm ready to assist you. I can help you with:\n\n" +
                 "• **Creating and managing tasks** - Add tasks with priorities\n" +
                 "• **Looking up information** - Search the knowledge base\n" +
                 "• **Viewing task lists** - See all your pending and completed tasks\n\n" +
                 "What would you like to do?";
    } else if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      response = "I'm your Epic Copilot Agent! Here's what I can do:\n\n" +
                 "🔧 **Task Management**\n" +
                 "- Create tasks with custom priorities\n" +
                 "- List all tasks by status\n" +
                 "- Track task completion\n\n" +
                 "🔍 **Information Lookup**\n" +
                 "- Search knowledge base\n" +
                 "- Get detailed information on topics\n\n" +
                 "Just ask me naturally, and I'll help!";
    } else {
      response = "I understand you're saying: \"" + message + "\"\n\n" +
                 "I'm here to help! You can ask me to:\n" +
                 "• Create a task\n" +
                 "• List your tasks\n" +
                 "• Look up information\n\n" +
                 "How can I assist you today?";
    }

    res.json({ response });

    console.log(`💬 User: ${message}`);
    console.log(`🤖 Assistant: ${response.substring(0, 50)}...`);
  } catch (error) {
    console.error("Chat error:", error);
    res.status(500).json({ 
      error: "Failed to process message",
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// Start server
async function startServer() {
  // Note: The Copilot SDK integration requires GitHub Copilot CLI authentication
  // For this demo, we're using mock responses
  // To use the real Copilot SDK, ensure you have:
  // 1. GitHub Copilot CLI installed
  // 2. Authenticated with `gh auth login`
  // 3. Then uncomment the initializeClient() call below
  
  // await initializeClient();
  
  app.listen(PORT, () => {
    console.log(`🚀 Epic Copilot Web UI running at http://localhost:${PORT}`);
    console.log(`   Open your browser and start chatting!`);
    console.log(`   📝 Note: Currently using mock responses for demonstration`);
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
