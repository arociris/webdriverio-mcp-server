---
layout: default
title: API Reference
nav_order: 3
---

# API Reference

Base URL: `http://localhost:3000`

## Sessions
### POST /session/start
Start a new session (desktop or mobile).

Body (Desktop):
```json
{ "url": "https://example.com", "browserOptions": { "headless": true } }
```
Body (Mobile):
```json
{ "mobile": { "enabled": true, "platformName": "Android", "deviceName": "Android Emulator", "browserName": "Chrome" } }
```
Response:
```json
{ "message": "Session started successfully.", "sessionId": "...", "isMobile": false, "context": { ... } }
```

### DELETE /session/{sessionId}
Terminate a session.

Response:
```json
{ "message": "Session terminated successfully.", "status": "terminated", "sessionId": "..." }
```

### GET /session/stats
```json
{ "message": "Session statistics fetched successfully.", "status": "success", "stats": { "totalSessions": 1, "activeSessions": 1, "mobileSessions": 0, "desktopSessions": 1 } }
```

## Actions
### POST /session/{sessionId}/act
Execute an action and get updated context.

Popular desktop actions:

| Action | Parameters | Description |
|---|---|---|
| click | elementId | Click an element |
| setValue | elementId, value | Type into an input/textarea |
| getText | elementId | Get element text |
| clearValue | elementId | Clear input value |
| getAttribute | elementId, attribute | Get attribute value |
| keys | value | Send keystrokes |
| scrollIntoView | elementId | Scroll to element |
| screenshot | (elementId?) | Full page or element screenshot |
| navigate | url | Navigate to a URL |
| isDisplayed | elementId | Visibility check |
| isEnabled | elementId | Enabled check |
| isSelected | elementId | Selected check |
| waitForDisplayed | elementId, timeout | Wait visible |
| waitForEnabled | elementId, timeout | Wait enabled |
| waitForExist | elementId, timeout | Wait exist |
| customScript | script, args | Run JS in page |

Mobile actions:

| Action | Parameters | Description |
|---|---|---|
| mobile:tap | elementId or x,y | Tap element or coordinates |
| mobile:swipe | direction, duration, (x,y) | Swipe in direction |
| mobile:scroll | direction, duration | Scroll (swipe alias) |
| mobile:back | - | Back navigation |
| mobile:pressKey | key | Send platform key |
| mobile:hideKeyboard | - | Hide soft keyboard |

Response:
```json
{ "message": "Action 'click' executed successfully.", "sessionId": "...", "context": { ... }, "result": { ... } }
```
