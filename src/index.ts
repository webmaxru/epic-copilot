import { CopilotClient, defineTool } from "@github/copilot-sdk";
import * as readline from "node:readline";

// --- Custom Tools for the Agent ---

/**
 * A tool that performs a task based on structured input.
 * Customize this for your specific domain.
 */
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
    console.log(`\n⚡ Executing task: "${args.taskName}" [${priority}]`);
    console.log(`   Instructions: ${args.instructions}`);

    // Simulate task execution — replace with your real logic
    return {
      status: "completed",
      taskName: args.taskName,
      priority,
      result: `Task "${args.taskName}" has been processed successfully.`,
    };
  },
});

/**
 * A tool that looks up information from a knowledge base.
 * Replace the mock data with your actual data source.
 */
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
    console.log(`\n🔍 Looking up: "${args.query}"`);

    // Replace with actual knowledge base / API call
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

/**
 * A tool to list or manage the agent's task queue.
 */
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
    console.log(`\n📋 Listing tasks (filter: ${filter})`);

    // Replace with real task store
    return {
      filter,
      tasks: [
        { id: 1, name: "Example task", status: "pending", priority: "medium" },
      ],
      message: "Connect a real task store to persist and manage tasks.",
    };
  },
});

// --- Agent Entry Point ---

async function main() {
  const client = new CopilotClient();
  const session = await client.createSession({
    model: "gpt-4.1",
    streaming: true,
    tools: [performTask, lookupInfo, listTasks],
    systemMessage: {
      content:
        "You are Epic Copilot, an AI assistant specialized in helping project managers, " +
        "product owners, and delivery managers manage work items on Azure Boards. " +
        "You help with creating epics, user stories, tasks, bugs, managing sprints, " +
        "querying work items, and generating reports. Be concise and action-oriented. " +
        "When the user asks you to do something, use the appropriate tool to accomplish it.",
    },
  });

  // Stream assistant responses to the console
  session.on("assistant.message_delta", (event) => {
    process.stdout.write(event.data.deltaContent);
  });
  session.on("session.idle", () => {
    console.log();
  });

  // Interactive REPL loop
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log("🎯 Epic Copilot ready! Your AI assistant for Azure Boards work item management.\n");
  console.log("💡 Try one of these to get started:");
  console.log("   • 'Create a new epic for Q1 mobile app features'");
  console.log("   • 'List all user stories in the current sprint'");
  console.log("   • 'Show high-priority bugs in my backlog'");
  console.log("   • 'Plan sprint work items for the next iteration'");
  console.log("   • 'Generate a project status report'\n");
  console.log("Type your message (Ctrl+C to exit)\n");

  const prompt = () => {
    rl.question("You: ", async (input) => {
      const trimmed = input.trim();
      if (!trimmed) {
        prompt();
        return;
      }

      await session.sendAndWait({ prompt: trimmed });
      prompt();
    });
  };

  prompt();

  // Graceful shutdown
  process.on("SIGINT", async () => {
    console.log("\n👋 Shutting down agent...");
    rl.close();
    await client.stop();
    process.exit(0);
  });
}

main().catch(console.error);
