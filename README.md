# WebdriverIO Model Context Protocol (MCP) Server

A production-grade server that enables AI agents to interact with web browsers through a structured API. This server acts as the "eyes and hands" for AI agents on the web, providing a simplified, model-readable representation of web pages and executing actions based on AI decisions.

---

## 🚀 Features

- **Session Management**: Stateful browser sessions with automatic cleanup
- **Context Extraction**: Structured representation of web page interactive elements with robust selectors
- **Action Execution**: Supports all major WebdriverIO actions (see below)
- **Screenshot Support**: Take screenshots of the page or elements
- **Headless/Non-Headless**: Easily switch browser mode via API
- **Production Ready**: Comprehensive error handling, logging, and security
- **RESTful API**: Clean, documented endpoints
- **Comprehensive Testing**: Unit and integration tests with high coverage

---

## 🤖 How to Use with AI Agents

### What is MCP for AI?
The MCP server is designed to be the "toolformer" or "web tool interface" for AI agents (LLMs, RAG, toolformer, etc.). The typical loop is:
1. **AI requests context** (via `/session/start` or `/session/{id}/act`)
2. **AI receives a structured, simplified JSON context** (all interactive elements, robust selectors, etc.)
3. **AI decides on an action** (e.g., click, setValue, screenshot, etc.)
4. **AI sends action to MCP** (via `/session/{id}/act`)
5. **MCP executes and returns updated context/result**

**The server is AI-agnostic:** You can use it with OpenAI, HuggingFace, LangChain, custom LLMs, or any agent framework. The agent simply needs to:
- Parse the context JSON
- Decide on an action (using the elementId and action schema)
- POST the action to the server
- Repeat until done

**Example AI Loop:**
```python
# Pseudocode for an LLM agent
context = requests.post('/session/start', json={...}).json()['context']
while not done:
    action = llm_decide_action(context)  # LLM picks action
    result = requests.post(f'/session/{session_id}/act', json=action).json()
    context = result['context']
    # Optionally use result['result'] for getText, screenshot, etc.
```

---

## ⚙️ Supported Actions (with Examples)

The `/session/{sessionId}/act` endpoint supports **all major WebdriverIO actions**. Here are the most popular:

| Action                | Description                                 | Example Request Body |
|-----------------------|---------------------------------------------|---------------------|
| `click`               | Click an element                            | `{ "action": "click", "elementId": "button_submit" }` |
| `setValue`            | Set value in input/textarea/select          | `{ "action": "setValue", "elementId": "input_email", "value": "test@example.com" }` |
| `getText`             | Get text content of an element              | `{ "action": "getText", "elementId": "label_result" }` |
| `clearValue`          | Clear value of an input/textarea            | `{ "action": "clearValue", "elementId": "input_email" }` |
| `selectByVisibleText` | Select option by visible text               | `{ "action": "selectByVisibleText", "elementId": "select_country", "text": "India" }` |
| `selectByIndex`       | Select option by index                      | `{ "action": "selectByIndex", "elementId": "select_country", "index": 2 }` |
| `selectByAttribute`   | Select option by attribute                  | `{ "action": "selectByAttribute", "elementId": "select_country", "attribute": "value", "value": "IN" }` |
| `keys`                | Send keyboard keys to the browser           | `{ "action": "keys", "value": "Enter" }` |
| `scrollIntoView`      | Scroll element into view                    | `{ "action": "scrollIntoView", "elementId": "footer" }` |
| `screenshot`          | Take screenshot (page or element)           | `{ "action": "screenshot" }` or `{ "action": "screenshot", "elementId": "logo" }` |
| `navigate`            | Navigate to a new URL                       | `{ "action": "navigate", "url": "https://example.com" }` |
| `getAttribute`        | Get attribute value of an element           | `{ "action": "getAttribute", "elementId": "input_email", "attribute": "placeholder" }` |
| `isDisplayed`         | Check if element is displayed               | `{ "action": "isDisplayed", "elementId": "input_email" }` |
| `isEnabled`           | Check if element is enabled                 | `{ "action": "isEnabled", "elementId": "input_email" }` |
| `isSelected`          | Check if element is selected                | `{ "action": "isSelected", "elementId": "checkbox_terms" }` |
| `waitForDisplayed`    | Wait for element to be displayed            | `{ "action": "waitForDisplayed", "elementId": "modal", "timeout": 10000 }` |
| `waitForEnabled`      | Wait for element to be enabled              | `{ "action": "waitForEnabled", "elementId": "input_email", "timeout": 5000 }` |
| `waitForExist`        | Wait for element to exist                   | `{ "action": "waitForExist", "elementId": "input_email", "timeout": 5000 }` |
| `customScript`        | Run custom JS in browser context            | `{ "action": "customScript", "script": "return document.title;" }` |

**All actions return a `message` and, if applicable, a `result` (e.g., screenshot, text, attribute, etc.).**

---

## 🏷️ Robust Selectors & Element IDs

- **Element IDs**: Now generated using id, name, data-testid, data-qa, or fallback to tag+index. No more NaN or unreliable selectors.
- **Selector Example**: `button_submit`, `input_email`, `select_country`, `button_idx_2` (for 2nd button if no id/name)
- **Returned in context**: Each element in `interactiveElements` includes `id` and `selector`.
- **Use the `elementId` in your action requests.**

---

## 🖼️ Screenshot Support

- **Take full page screenshot:**
  ```json
  { "action": "screenshot" }
  ```
- **Take element screenshot:**
  ```json
  { "action": "screenshot", "elementId": "logo" }
  ```
- **Response:**
  ```json
  { "message": "Screenshot taken.", "screenshot": "<base64>" }
  ```

---

## 🖥️ Headless & Non-Headless Mode

- **Default:** Headless mode (`browserOptions.headless: true`)
- **To launch in non-headless mode:**
  ```json
  {
    "url": "https://example.com",
    "browserOptions": { "headless": false }
  }
  ```
- **You can set this in the `/session/start` request.**

---

## 🧑‍💻 Usage Examples

### Start a Session (Headless or Non-Headless)
```json
POST /session/start
{
  "url": "https://httpbin.org/forms/post",
  "browserOptions": { "headless": false }
}
```

### Click a Button
```json
POST /session/{sessionId}/act
{
  "action": "click",
  "elementId": "button_submit"
}
```

### Set Value in Input
```json
POST /session/{sessionId}/act
{
  "action": "setValue",
  "elementId": "input_email",
  "value": "test@example.com"
}
```

### Take a Screenshot
```json
POST /session/{sessionId}/act
{
  "action": "screenshot"
}
```

### Get Text of an Element
```json
POST /session/{sessionId}/act
{
  "action": "getText",
  "elementId": "label_result"
}
```

### Use with AI Agent (Python Example)
```python
import requests

# Start session
resp = requests.post('http://localhost:3000/session/start', json={
    'url': 'https://httpbin.org/forms/post',
    'browserOptions': {'headless': True}
})
session_id = resp.json()['sessionId']

# Get context
context = resp.json()['context']

# AI loop (pseudo)
while True:
    action = ai_decide_action(context)  # Your LLM/agent logic
    result = requests.post(f'http://localhost:3000/session/{session_id}/act', json=action).json()
    print(result['message'])
    context = result['context']
    if done: break

# Terminate session
requests.delete(f'http://localhost:3000/session/{session_id}')
```

---

## 🛡️ Debugging & Error Handling
- All API responses include a `message` for clarity.
- If an action fails, you get a descriptive error message and details.
- Use the `selector` field in the context for debugging element targeting.

---

## 📚 API Reference

### POST `/session/start`
- Start a new browser session
- Request: `{ "url": "...", "browserOptions": { ... } }`
- Response: `{ "message": "...", "sessionId": "...", "context": { ... } }`

### POST `/session/{sessionId}/act`
- Perform an action (see above for all supported actions)
- Request: `{ "action": "...", ... }`
- Response: `{ "message": "...", "sessionId": "...", "context": { ... }, "result": { ... } }`

### DELETE `/session/{sessionId}`
- Terminate a session
- Response: `{ "message": "Session terminated successfully.", "status": "terminated", "sessionId": "..." }`

### GET `/session/stats`
- Get session statistics
- Response: `{ "message": "...", "status": "success", "stats": { ... } }`

### GET `/health`
- Health check
- Response: `{ "status": "healthy", ... }`

---

## 🏁 Final Notes
- **Robust selectors**: Always use the `elementId` from the context for actions.
- **AI integration**: The server is designed for LLM/agent loops, but can be used by any automation client.
- **All major WebdriverIO actions are supported**: If you need more, extend the action schema and executor.
- **Debugging**: Use the `message` and `selector` fields in responses.
- **Headless/non-headless**: Set via `browserOptions`.
- **Screenshots**: Use the `screenshot` action for visual debugging or AI vision.

---

For more, see the full API and code examples above. For issues, open a GitHub issue or PR. 