---
layout: default
title: Getting Started
nav_order: 2
---

# Getting Started

## Requirements
- Node.js >= 18
- Chrome installed (desktop)
- Appium + platform SDKs (mobile)

## Install
```bash
npm install
cp env.example .env
```

## Run
```bash
# development
npm run dev

# production
npm start
```

> Tip: Configure Appium endpoint with `APPIUM_*` env vars if using mobile.

## Start a Desktop Session
```http
POST /session/start
{
  "url": "https://httpbin.org/forms/post",
  "browserOptions": { "headless": true }
}
```

## Start a Mobile Session (Android Chrome)
```http
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

## Execute an Action
```http
POST /session/{sessionId}/act
{ "action": "click", "elementId": "button_submit" }
```

## Terminate
```http
DELETE /session/{sessionId}
```
