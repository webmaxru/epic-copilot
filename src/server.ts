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
// NOTE: These variables are reserved for real GitHub Copilot SDK integration
// Currently using mock responses for demonstration
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
    
    if (lowerMessage.includes("epic") && (lowerMessage.includes("create") || lowerMessage.includes("new"))) {
      response = "I'd be happy to help you create an epic! To create an epic in Azure Boards, I need:\n\n" +
                 "1. **Title** - A clear, concise name for the epic\n" +
                 "2. **Description** - What problem does this epic solve?\n" +
                 "3. **Acceptance Criteria** - How will you know it's complete?\n" +
                 "4. **Priority** - Business value: High, Medium, or Low\n\n" +
                 "Please provide these details and I'll help create the epic.";
    } else if (lowerMessage.includes("user story") || lowerMessage.includes("user stories")) {
      response = "I can help you manage user stories! Here's what I can do:\n\n" +
                 "📝 **Create User Stories**\n" +
                 "- Define story with acceptance criteria\n" +
                 "- Link to parent epic\n" +
                 "- Set story points and priority\n\n" +
                 "📋 **List User Stories**\n" +
                 "- View by sprint\n" +
                 "- Filter by status or assignee\n" +
                 "- Sort by priority\n\n" +
                 "What would you like to do?";
    } else if (lowerMessage.includes("sprint")) {
      response = "Sprint management is one of my core features! I can help with:\n\n" +
                 "🏃 **Sprint Planning**\n" +
                 "- Create new sprints\n" +
                 "- Add work items to sprint backlog\n" +
                 "- Calculate team capacity\n\n" +
                 "📊 **Sprint Tracking**\n" +
                 "- View sprint burndown\n" +
                 "- Check progress on sprint goals\n" +
                 "- Identify blockers\n\n" +
                 "Tell me what you need for your sprint!";
    } else if (lowerMessage.includes("bug") || lowerMessage.includes("bugs")) {
      response = "I can help you track and manage bugs:\n\n" +
                 "🐛 **Bug Management**\n" +
                 "- Create new bugs with severity levels\n" +
                 "- List bugs by priority or status\n" +
                 "- Assign bugs to team members\n" +
                 "- Track bug resolution progress\n\n" +
                 "What bug-related task can I help with?";
    } else if (lowerMessage.includes("report") || lowerMessage.includes("status")) {
      response = "I can generate various reports for your project:\n\n" +
                 "📊 **Available Reports**\n" +
                 "- Sprint burndown charts\n" +
                 "- Velocity trends\n" +
                 "- Work item distribution\n" +
                 "- Team capacity analysis\n" +
                 "- Bug trends and metrics\n\n" +
                 "Which report would you like to see?";
    } else if (lowerMessage.includes("list") && lowerMessage.includes("task")) {
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
      response = "Hello! 👋 I'm Epic Copilot, your AI assistant for Azure Boards. I can help you:\n\n" +
                 "🎯 **Manage Work Items**\n" +
                 "• Create and track epics, user stories, tasks, and bugs\n" +
                 "• Plan and manage sprints\n" +
                 "• Query and filter your backlog\n\n" +
                 "📊 **Project Insights**\n" +
                 "• Generate status reports\n" +
                 "• View team velocity and burndown charts\n" +
                 "• Track project progress\n\n" +
                 "What would you like to work on today?";
    } else if (lowerMessage.includes("help") || lowerMessage.includes("what can you do")) {
      response = "I'm Epic Copilot - your Azure Boards AI assistant! Here's what I can do:\n\n" +
                 "📋 **Work Item Management**\n" +
                 "- Create epics, user stories, tasks, and bugs\n" +
                 "- Update work item status and assignments\n" +
                 "- Link related work items\n\n" +
                 "🏃 **Sprint Management**\n" +
                 "- Plan sprint backlogs\n" +
                 "- Track sprint progress\n" +
                 "- Generate burndown reports\n\n" +
                 "🔍 **Queries & Reports**\n" +
                 "- Search work items with custom filters\n" +
                 "- Generate project metrics\n" +
                 "- Track team velocity\n\n" +
                 "💡 **Try saying:**\n" +
                 "• 'Create a new epic for mobile app features'\n" +
                 "• 'Show sprint backlog items'\n" +
                 "• 'List high-priority bugs'";
    } else {
      response = "I understand you're saying: \"" + message + "\"\n\n" +
                 "I'm Epic Copilot, here to help with Azure Boards! You can ask me to:\n" +
                 "• Create or manage epics, user stories, tasks, and bugs\n" +
                 "• Plan and track sprints\n" +
                 "• Generate reports and insights\n" +
                 "• Query your backlog\n\n" +
                 "How can I assist with your Azure Boards today?";
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
    console.log(`   Your Azure Boards AI assistant is ready!`);
    console.log(`   Open your browser and start managing work items.`);
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
  // Only stop client if it was initialized
  if (isClientReady) {
    await client.stop();
  }
  process.exit(0);
});
