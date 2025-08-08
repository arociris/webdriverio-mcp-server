
# WebdriverIO Model Context Protocol (MCP) Server

[![npm version](https://badge.fury.io/js/wdio-mcp-server.svg)](https://badge.fury.io/js/wdio-mcp-server) 

[View Online Documentation](https://arociris.github.io/webdriverio-mcp-server/)

A Model Context Protocol (MCP) server for [WebdriverIO](https://webdriver.io/). This server acts as a bridge, allowing Large Language Models (LLMs) and AI agents to control a web browser. It provides a structured, model-readable representation of web pages and executes actions based on AI-driven decisions.

This project is designed to be a robust and easy-to-use tool for the AI agent development community.

### Key Features

-   **LLM-First Design**: Built to be the "eyes and hands" for AI agents, providing structured context and a clear action framework.
-   **Stateful Session Management**: Manages browser sessions with configurable timeouts and automatic cleanup.
-   **Robust Action Execution**: Leverages the power and stability of WebdriverIO to support a wide range of browser actions.
-   **Flexible Configuration**: Configure the server via environment variables for easy deployment.
-   **Headless & Headed Support**: Easily switch between headless and headed browser modes via configuration.

## Getting Started

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

<details>
<summary><strong>Cursor</strong></summary>

#### Click the button to install:

[![Install MCP Server](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/install-mcp?name=webdriverio&config=eyJjb21tYW5kIjoibnB4IHdkaW8tbWNwLXNlcnZlckBsYXRlc3QifQ==)

#### Or install manually:

Go to `Cursor Settings` -> `MCP` -> `Add new MCP Server`. Name it `webdriverio` (or to your liking), use `command` type with the command `npx wdio-mcp-server@latest`.

</details>

<details>
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

<details>
<summary><strong>Other Clients (Gemini CLI, etc.)</strong></summary>

Most MCP-compatible clients will ask for a command to run the server. Use `npx wdio-mcp-server@latest` when prompted.

</details>

## How the AI Interaction Loop Works

The MCP server is the web interaction tool for an AI agent. The agent and server communicate in a continuous loop until a task is complete.

1.  **Agent Receives a Goal**: The process starts with a high-level objective, e.g., "Book a flight from SFO to LAX for tomorrow."
2.  **Agent Starts a Session**: The agent calls the `/session/start` endpoint with a starting URL.
3.  **Server Provides Context**: The server launches a browser, navigates to the URL, and returns a structured JSON object representing the page's interactive elements (buttons, inputs, links), each with a stable `elementId` and a text description.
4.  **Agent Decides Next Action**: The agent's underlying LLM analyzes the goal, the current page context, and its list of available actions. It then decides on the most logical next step (e.g., "click the 'Flights' tab").
5.  **Agent Executes Action**: The agent calls the `/session/{id}/act` endpoint with the chosen action and the `elementId` of the target element.
6.  **Loop**: The server performs the action and returns the updated page context. The loop repeats from step 4 until the agent determines the goal is complete.

### AI Agent Pseudo-code Example (JavaScript)

This example illustrates the agent's decision-making process.

```javascript
// --- AI Agent's Thought Process (Pseudo-code) ---

async function runAgent(goal) {
    console.log(`AGENT: Starting new task with goal: \"${goal}\"`);
    const { sessionId, context: initialContext } = await startSession("https://www.google.com");
    let pageContext = initialContext;

    for (let i = 0; i < 10; i++) { // Limit steps to prevent infinite loops
        // 1. Agent uses its model to decide the next action based on the goal and current page context.
        const { action, reasoning } = await decideNextAction(goal, pageContext);
        console.log(`AGENT: Based on my goal, my next action is to '${action.action}'. Reasoning: ${reasoning}`);

        if (action.action === 'finish') {
            console.log("AGENT: I have determined that I have completed my goal.");
            break;
        }

        // 2. Execute the chosen action and get the new page state.
        const result = await performAction(sessionId, action);
        pageContext = result.context; 
        console.log("AGENT: Action executed. Observing new page state to decide next move.");
    }

    await endSession(sessionId);
    console.log("AGENT: Session terminated.");
}

async function decideNextAction(goal, pageContext) {
    // In a real scenario, this function makes a call to an LLM.
    // The prompt includes the goal, the page's interactive elements, and available actions.
    const prompt = `
        User Goal: \"${goal}\"
        Current Page Interactive Elements: ${JSON.stringify(pageContext.interactiveElements.map(e => ({ id: e.elementId, description: e.description, tag: e.tag })))}
        Available Actions: [\"setValue\", \"click\", \"getText\", \"navigate\", \"finish\"]

        Based on the user's goal and the current page, what is the single most logical next action to take?
        Return a JSON object with \"reasoning\" and \"action\" keys.
    `;

    // --- MOCKED LLM RESPONSE for demonstration ---
    const searchInput = pageContext.interactiveElements.find(e => e.tag === 'input' && e.description && e.description.toLowerCase().includes('search'));
    if (searchInput && goal.includes("Search for")) {
        const searchTerm = goal.match(/Search for '(.+)'/)[1];
        return {
            reasoning: `The user wants to search. I have found a search input with the description '${searchInput.description}'. I will type the search term into it.`,
            action: {
                action: "setValue",
                elementId: searchInput.elementId,
                value: searchTerm
            }
        };
    }

    // Default/Finish action
    return {
        reasoning: "I have completed the primary actions or cannot determine the next step. I will finish the task.",
        action: { action: "finish" }
    };
}

// Assume startSession, performAction, endSession are defined elsewhere.
runAgent("Search for 'WebdriverIO MCP Server'");
```

## Standalone Server

You can also run the server directly from the command line.

```bash
# Install the package
npm install -g wdio-mcp-server

# Run the server
wdio-mcp-server
```

## Configuration

The server can be configured in two ways: via a configuration file or using environment variables. Environment variables will always override settings in the configuration file.

### Configuration File

You can create a `wdio-mcp-config.json` file in your project root or specify a path to a config file using the `CONFIG_FILE` environment variable. This provides a centralized place for all your settings, which is especially useful for complex WebdriverIO capabilities.

**Example `wdio-mcp-config.json`:**
```json
{
  "server": {
    "port": 4000,
    "host": "0.0.0.0",
    "logLevel": "debug"
  },
  "session": {
    "timeoutSeconds": 600,
    "maxSessions": 10,
    "headless": false
  },
  "webdriverio": {
    "capabilities": {
      "browserName": "chrome",
      "goog:chromeOptions": {
        "args": ["--disable-gpu", "--no-sandbox"]
      }
    }
  }
}
```

### Environment Variables

| Variable                  | Description                                        | Default     | Corresponding Config Key |
| ------------------------- | -------------------------------------------------- | ----------- | ------------------------ |
| `PORT`                    | The port the server will listen on.                | `3000`      | `server.port`            |
| `HOST`                    | The host the server will bind to.                  | `localhost` | `server.host`            |
| `LOG_LEVEL`               | The logging level (e.g., `info`, `debug`, `warn`). | `info`      | `server.logLevel`        |
| `SESSION_TIMEOUT_SECONDS` | Timeout in seconds for inactive sessions.          | `300`       | `session.timeoutSeconds` |
| `MAX_SESSIONS`            | Maximum number of concurrent browser sessions.     | `5`         | `session.maxSessions`    |
| `HEADLESS`                | Run browser in headless mode (`true` or `false`).  | `true`      | `session.headless`       |
| `CONFIG_FILE`             | Path to a custom configuration file.               | `null`      | N/A                      |

**Note:** Currently, only Google Chrome is supported.

## Supported Actions

The `/session/{sessionId}/act` endpoint supports a wide range of WebdriverIO actions.

<details>
<summary><strong>Core Automation Actions</strong></summary>

-   **`click`**: Clicks an element.
    -   **Params**: `elementId`
-   **`setValue`**: Sets the value of an input, textarea, or select element.
    -   **Params**: `elementId`, `value`
-   **`getText`**: Gets the text content of an element.
    -   **Params**: `elementId`
-   **`clearValue`**: Clears the value of an input or textarea.
    -   **Params**: `elementId`
-   **`keys`**: Sends a sequence of keyboard keys to the browser.
    -   **Params**: `value` (e.g., "Enter")
-   **`scrollIntoView`**: Scrolls an element into the viewport.
    -   **Params**: `elementId`
-   **`getAttribute`**: Gets the value of an element's attribute.
    -   **Params**: `elementId`, `attribute`

</details>

<details>
<summary><strong>Navigation and Page Actions</strong></summary>

-   **`navigate`**: Navigates to a new URL.
    -   **Params**: `url`
-   **`screenshot`**: Takes a screenshot of the page or a specific element.
    -   **Params**: `elementId` (optional)
-   **`customScript`**: Executes a custom JavaScript snippet in the browser.
    -   **Params**: `script`

</details>

<details>
<summary><strong>Wait Actions</strong></summary>

-   **`waitForDisplayed`**: Waits for an element to be displayed.
    -   **Params**: `elementId`, `timeout` (optional)
-   **`waitForEnabled`**: Waits for an element to be enabled.
    -   **Params**: `elementId`, `timeout` (optional)
-   **`waitForExist`**: Waits for an element to exist in the DOM.
    -   **Params**: `elementId`, `timeout` (optional)

</details>

<details>
<summary><strong>State Check Actions</strong></summary>

-   **`isDisplayed`**: Checks if an element is displayed.
    -   **Params**: `elementId`
-   **`isEnabled`**: Checks if an element is enabled.
    -   **Params**: `elementId`
-   **`isSelected`**: Checks if an element (like a checkbox or radio button) is selected.
    -   **Params**: `elementId`

</details>

## 📱 Mobile Automation Support (Appium)

The server can create **mobile sessions** via Appium for Android and iOS (native apps or mobile browsers).

### Start a Mobile Session (Android Chrome)
```json
POST /session/start
{
  "mobile": {
    "enabled": true,
    "platformName": "Android",
    "deviceName": "Android Emulator",
    "browserName": "Chrome",
    "automationName": "UiAutomator2"
  },
  "url": "https://example.com"
}
```

### Start a Mobile Session (iOS Safari)
```json
POST /session/start
{
  "mobile": {
    "enabled": true,
    "platformName": "iOS",
    "deviceName": "iPhone 15",
    "browserName": "Safari",
    "automationName": "XCUITest"
  },
  "url": "https://example.com"
}
```

### Start a Native App Session (Android)
```json
POST /session/start
{
  "mobile": {
    "enabled": true,
    "platformName": "Android",
    "deviceName": "Android Emulator",
    "appPackage": "com.example.app",
    "appActivity": ".MainActivity",
    "automationName": "UiAutomator2"
  }
}
```

### Mobile Actions
- `mobile:tap` — element or coordinates
  ```json
  { "action": "mobile:tap", "elementId": "login_button" }
  { "action": "mobile:tap", "x": 120, "y": 520 }
  ```
- `mobile:swipe` — directions: up/down/left/right
  ```json
  { "action": "mobile:swipe", "direction": "up", "duration": 300 }
  ```
- `mobile:scroll` — alias of swipe with default params
  ```json
  { "action": "mobile:scroll", "direction": "down" }
  ```
- `mobile:back` — back navigation
  ```json
  { "action": "mobile:back" }
  ```
- `mobile:pressKey` — send platform key
  ```json
  { "action": "mobile:pressKey", "key": "Enter" }
  ```
- `mobile:hideKeyboard` — hide soft keyboard
  ```json
  { "action": "mobile:hideKeyboard" }
  ```

### Appium Connection Config
Set via environment variables:
```
APPIUM_PROTOCOL=http
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
APPIUM_PATH=/wd/hub
```

The server will route mobile sessions through this Appium endpoint.

## ❗ Error Handling & Resilience

- All API errors use a standard format with fields: `status`, `code`, `message`, `suggestion`, `details`, `timestamp`.
- Element-related errors include helpful suggestions (e.g., re-extract context, wait, scroll, etc.).
- Stale elements, detached nodes, and transient not-found errors are retried automatically with small backoff.
- You can rely on clear `message` values for human-readable debugging, and `code` for programmatic handling.

Example error response:
```json
{
  "status": "error",
  "code": "ELEMENT_NOT_FOUND",
  "message": "Element with id 'input_email' was not found in the current page context.",
  "suggestion": "Re-extract context, verify selector stability, or wait for the element to exist.",
  "details": { "elementId": "input_email" },
  "timestamp": "2025-01-01T00:00:00.000Z"
}
```

## Contributing

Contributions are welcome! If you'd like to help improve the server, please feel free to open an issue or submit a pull request.

1.  Fork the repository.
2.  Create your feature branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

## Roadmap

We have many exciting features planned for the future:

-   [ ] Support for other browsers (Firefox, Safari).
-   [ ] Mobile application support via Appium.
-   [ ] Enhanced context providers (e.g., accessibility tree parsing).
-   [ ] Advanced session management features.
