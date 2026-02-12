# Epic Copilot Agent

AI-powered custom agent built with the GitHub Copilot SDK.

## Features

- 🤖 Interactive chatbot interface
- 🔧 Task management (create, list, track tasks)
- 🔍 Knowledge base lookup
- 💬 Natural language interactions
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

## Using the Chatbot

The chatbot can help you with:

1. **Creating Tasks**: Ask to create a task with name, instructions, and priority
2. **Listing Tasks**: View all your pending and completed tasks
3. **Looking Up Information**: Search the knowledge base for specific topics

### Example Commands

- "Hello, can you help me create a task?"
- "List all my tasks"
- "Look up information about GitHub Copilot"
- "What can you do?"

## Integration with GitHub Copilot SDK

The current implementation uses mock responses for demonstration purposes. To integrate with the real GitHub Copilot SDK:

1. Install GitHub Copilot CLI
2. Authenticate with `gh auth login`
3. Uncomment the `initializeClient()` call in `src/server.ts`
4. Update the API endpoint to use the real Copilot session

## Technologies Used

- **Backend**: Node.js, TypeScript, Express
- **Frontend**: Vanilla JavaScript, HTML5, CSS3
- **AI**: GitHub Copilot SDK
- **Build Tools**: tsx, TypeScript compiler

## License

ISC
