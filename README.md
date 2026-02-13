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
4. Set up authentication (see below)
5. Uncomment the `initializeClient()` call in `src/server.ts`
6. Connect to your Azure DevOps organization and project

### Authentication Setup

The Azure DevOps MCP server requires authentication via a Personal Access Token (PAT):

#### Step 1: Create a Personal Access Token

1. Go to your Azure DevOps organization
2. Navigate to User Settings → Personal Access Tokens
3. Create a new token with the necessary scopes (Work Items: Read, write & manage)
4. Copy the generated token

#### Step 2: Set the Environment Variable

The token should be set in the `ADO_MCP_AUTH_TOKEN` environment variable. The command differs based on your operating system:

**Linux/macOS (bash/zsh):**
```bash
export ADO_MCP_AUTH_TOKEN="your-personal-access-token-here"
```

**Windows Command Prompt (CMD):**
```cmd
set ADO_MCP_AUTH_TOKEN="your-personal-access-token-here"
```

**Windows PowerShell:**
```powershell
$env:ADO_MCP_AUTH_TOKEN="your-personal-access-token-here"
```

**Note:** These commands set the variable for the current session only. To make it permanent:

- **Linux/macOS:** Add the export command to `~/.bashrc`, `~/.zshrc`, or `~/.profile`
- **Windows (CMD):** Use `setx ADO_MCP_AUTH_TOKEN "your-token"` (requires reopening terminal)
- **Windows (PowerShell):** Add to your PowerShell profile or use:
  ```powershell
  [System.Environment]::SetEnvironmentVariable('ADO_MCP_AUTH_TOKEN', 'your-token', 'User')
  ```

**Alternative: Using a .env file**

For better security and convenience, you can create a `.env` file in the project root:
```
ADO_MCP_AUTH_TOKEN=your-personal-access-token-here
```

Then install and use `dotenv` to load it automatically:
```bash
npm install dotenv  # Regular dependency for production use
```

And add this to the top of your `src/server.ts` or `src/index.ts`:
```typescript
import 'dotenv/config';
```

## Technologies Used

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI**: GitHub Copilot SDK
- **Build Tools**: tsx, TypeScript compiler

## License

ISC
