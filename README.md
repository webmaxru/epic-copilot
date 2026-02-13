# Epic Copilot

AI-powered assistant for project managers, product owners, and delivery managers to manage work items on Azure Boards. Perform complex tasks using AI by connecting GitHub Copilot SDK with Azure Boards via Azure DevOps MCP.

## Features

- 🎯 Azure Boards work item management
- 📊 Epic and user story planning
- 🔧 Sprint management and task tracking
- 🔍 Work item queries and reporting
- 💬 Natural language interactions with Azure DevOps
- 🎨 Beautiful, modern web UI

## Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

#### Web UI (Recommended)

Start the web server:

```bash
npm run start:web
```

Then open your browser and navigate to:
```
http://localhost:3000
```

For development with auto-reload:
```bash
npm run dev:web
```

#### CLI Mode

Run the agent in terminal mode:

```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

### Building

Compile TypeScript to JavaScript:

```bash
npm run build
```

## Project Structure

```
epic-copilot/
├── src/
│   ├── index.ts      # CLI version of the agent
│   └── server.ts     # Web server with Express
├── public/
│   └── index.html    # Web UI for the chatbot
├── package.json
└── tsconfig.json
```

## Using Epic Copilot

Epic Copilot helps you manage Azure Boards work items with:

1. **Creating Work Items**: Epics, user stories, tasks, and bugs
2. **Managing Sprints**: Plan and track sprint work
3. **Querying Work Items**: Search and filter your backlog
4. **Reporting**: Get insights on project progress

### Example Commands

- "Create a new epic for the mobile app redesign"
- "List all user stories in the current sprint"
- "Show me high-priority bugs assigned to my team"
- "Generate a sprint burndown report"

## Integration with Azure DevOps

Epic Copilot connects to Azure Boards via Azure DevOps MCP server. To set up:

1. Install GitHub Copilot CLI
2. Authenticate with `gh auth login`
3. Configure Azure DevOps MCP server connection
4. Uncomment the `initializeClient()` call in `src/server.ts`
5. Connect to your Azure DevOps organization and project

## Technologies Used

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI**: GitHub Copilot SDK
- **Build Tools**: tsx, TypeScript compiler

## License

ISC
