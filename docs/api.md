# API Reference

Base URL: `http://localhost:3000`

## POST /session/start
Start a new session.

Body (desktop):
```json
{ "url": "https://example.com", "browserOptions": { "headless": true } }
```
Body (mobile):
```json
{
  "mobile": {
    "enabled": true,
    "platformName": "Android" | "iOS",
    "deviceName": "string",
    "browserName": "Chrome" | "Safari",
    "automationName": "UiAutomator2" | "XCUITest"
  },
  "url": "https://example.com"
}
```
Response:
```json
{ "message": "Session started successfully.", "sessionId": "...", "isMobile": false, "context": { ... } }
```

## POST /session/{sessionId}/act
Execute an action and return the updated context.

Common actions:
- `click`, `setValue`, `getText`, `clearValue`, `selectByVisibleText`, `selectByIndex`, `selectByAttribute`, `keys`, `scrollIntoView`, `screenshot`, `navigate`, `getAttribute`, `isDisplayed`, `isEnabled`, `isSelected`, `waitForDisplayed`, `waitForEnabled`, `waitForExist`, `customScript`

Mobile actions:
- `mobile:tap`, `mobile:swipe`, `mobile:scroll`, `mobile:back`, `mobile:pressKey`, `mobile:hideKeyboard`

Response:
```json
{ "message": "Action 'click' executed successfully.", "sessionId": "...", "context": { ... }, "result": { ... } }
```

## DELETE /session/{sessionId}
Terminate a session.

Response:
```json
{ "message": "Session terminated successfully.", "status": "terminated", "sessionId": "..." }
```

## GET /session/stats
Get statistics.

Response:
```json
{ "message": "Session statistics fetched successfully.", "status": "success", "stats": { "totalSessions": 1, "activeSessions": 1, "mobileSessions": 0, "desktopSessions": 1 } }
```

## GET /health
Health check.

Response:
```json
{ "status": "healthy", "timestamp": "...", "environment": "development" }
```
