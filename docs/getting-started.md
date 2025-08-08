---
layout: default
title: Getting Started
nav_order: 1
---

# Getting Started

The server is designed to be run by an MCP client and you can use this standard config for most of the tools:

```json
{
  "mcpServers": {
    "webdriverio": {
      "command": "npx",
      "args": [
        "wdio-mcp-server@latest"
      ]
    }
  }
}
```

For tool specific instructions, select your client below for installation instructions.

<details markdown="1">
<summary><strong>Cursor</strong></summary>

#### Click the button to install:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=webdriverio&config=eyJjb21tYW5kIjoibnB4IHdkaW8tbWNwLXNlcnZlckBsYXRlc3QifQ==)

#### Or install manually:

Go to `Cursor Settings` -> `MCP` -> `Add new MCP Server`. Name it `webdriverio` (or to your liking), use `command` type with the command `npx wdio-mcp-server@latest`.

</details>

<details markdown="1">
<summary><strong>VS Code (with compatible agent)</strong></summary>

#### Click the button to install:

[<img src="https://img.shields.io/badge/VS_Code-VS_Code?style=flat-square&label=Install%20Server&color=0098FF" alt="Install in VS Code">](https://insiders.vscode.dev/redirect?url=vscode%3Amcp%2Finstall%3F%7B%22name%22%3A%22webdriverio%22%2C%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22wdio-mcp-server%40latest%22%5D%7D)

#### Or install manually:

1.  Open your `settings.json` file.
2.  Add or merge the following configuration:

```json
{
  "mcp.servers": {
    "webdriverio": {
      "command": "npx",
      "args": [
        "wdio-mcp-server@latest"
      ]
    }
  }
}
```

</details>

<details markdown="1">
<summary><strong>Other Clients (Gemini CLI, etc.)</strong></summary>

Most MCP-compatible clients will ask for a command to run the server. Use `npx wdio-mcp-server@latest` when prompted.

</details>

---

## Installation

- Global (CLI)
```bash
npm install -g wdio-mcp-server
wdio-mcp-server
```

- Local project
```bash
npm install wdio-mcp-server --save
# then run via npx
npx wdio-mcp-server
```

- From source
```bash
npm install
npm start
```

> Requirements: Node.js >= 18. For mobile support, ensure Appium and platform SDKs are installed and configure `APPIUM_*` env vars.

## Run
```bash
# development
npm run dev

# production
npm start
```

## First Request

- Start a desktop session
```http
POST /session/start
{
  "url": "https://httpbin.org/forms/post",
  "browserOptions": { "headless": true }
}
```

- Execute an action
```http
POST /session/{sessionId}/act
{ "action": "click", "elementId": "button_submit" }
```

- Terminate the session
```http
DELETE /session/{sessionId}
```

For more, see the API reference and Mobile sections in the sidebar.
