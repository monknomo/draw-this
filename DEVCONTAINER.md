# Dev Container

The devcontainer provides an isolated environment with Node 22 and Claude Code CLI pre-installed.

## What's included

- Node 22 (matches project requirements)
- `npm install` runs automatically on container creation
- Claude Code CLI (`claude`) available globally
- `ANTHROPIC_API_KEY` forwarded from your host environment

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) running
- VS Code with the [Dev Containers extension](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers), **or** the `devcontainer` CLI

## Running the devcontainer

### Option A: VS Code

1. Open the project in VS Code.
2. When prompted "Reopen in Container", click it. Or run **Dev Containers: Reopen in Container** from the command palette.
3. Wait for the container to build and `npm install` to complete.

### Option B: devcontainer CLI

```bash
npm install -g @devcontainers/cli
devcontainer up --workspace-folder .
devcontainer exec --workspace-folder . bash
```

## Running the project inside the container

```bash
npm run build      # compile TypeScript → script.js
npm run test:run   # run tests once
npm run check      # tests + type-check together
npm run watch      # rebuild on file changes
```

## Using Claude with --dangerously-skip-permissions

The `--dangerously-skip-permissions` flag lets Claude run shell commands, edit files, and use tools without asking for confirmation on each action. Only use this in the devcontainer — the container provides the safety boundary.

### 1. Set your API key on the host before opening the container

```bash
export ANTHROPIC_API_KEY=sk-ant-...
```

The `devcontainer.json` forwards this into the container automatically.

### 2. Inside the container, run dangerclaude

```bash
claude --dangerously-skip-permissions
```

Or for a one-shot command:

```bash
claude --dangerously-skip-permissions -p "fix the bucket tool colorPixel bug"
```

### Why the container matters

Without the container, `--dangerously-skip-permissions` lets Claude run arbitrary commands on your machine. Inside the container, the blast radius is limited to the container filesystem (the project source is bind-mounted, so edits to source files are real, but system-level damage is contained).

**Do not run `--dangerously-skip-permissions` outside the container on a machine you care about.**
