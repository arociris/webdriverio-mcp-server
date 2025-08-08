# Getting Started

## Prerequisites
- Node.js >= 18
- Chrome installed (for desktop web)
- Appium server and platform SDKs (for mobile)

## Install & Run
```bash
npm install
cp env.example .env
npm run dev
# or
npm start
```

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
{
  "action": "click",
  "elementId": "button_submit"
}
```

## Terminate a Session
```http
DELETE /session/{sessionId}
```
