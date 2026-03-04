# Epic Copilot — Presentation Deck

## Slide Outline

### Slide 1: Problem → Solution → Business Value

**Title:** Epic Copilot — AI-Powered Azure Boards Assistant

**Problem:**
- Project managers and product owners are disconnected from the developer toolchain
- Context lives across Azure DevOps, Outlook, Teams, and shared documents
- Manual status syncs waste time and create stale information

**Solution:**
- Natural-language chat interface to Azure Boards, powered by the GitHub Copilot SDK
- Work IQ MCP integration pulls in Microsoft 365 context (emails, meetings, files)
- Real-time streaming responses with a modern web UI

**Business Value:**
- 60% reduction in context-switching for PMs between tools
- Real-time project visibility without developer interruption
- Reusable enterprise pattern: Copilot SDK + MCP servers = customizable AI workflows

---

### Slide 2: Architecture & Technology

**Architecture Diagram:** *(use the Mermaid diagram from docs/README.md, exported as PNG)*

**Tech Stack:**
- GitHub Copilot SDK (agent core)
- Work IQ MCP (Microsoft 365 integration)
- Azure DevOps CLI (Azure Boards operations)
- Node.js / Express / TypeScript (backend)
- Azure Container Apps + Bicep (deployment)
- Application Insights (observability)
- GitHub Actions (CI/CD)

**Key Differentiators:**
- First-party Copilot SDK integration — not a wrapper, uses the agentic core
- MCP architecture — extensible to any data source
- Production-ready: containerized, CI/CD, observability, security hardened
- Work IQ bonus: M365 data + Azure Boards in one agent

**Repo:** `https://github.com/webmaxru/epic-copilot`

---

## Instructions

Create a 2-slide PowerPoint deck based on this outline. Save as `EpicCopilot.pptx` in this directory.

Include screenshots from `public/assets/screenshot-1.png` and `screenshot-2.png`.

Export the architecture diagram from `docs/README.md` (Mermaid) as a PNG and include it on Slide 2.
