# Mobile (Appium) Guide

## Requirements
- Appium server running (e.g., `appium` CLI)
- Android SDK / Xcode setup depending on platform
- Real device or emulator/simulator

## Start Mobile Browser Session
```json
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

## Start Native App Session (Android)
```json
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

## Actions
- `mobile:tap` (element or coordinates)
- `mobile:swipe` (up/down/left/right)
- `mobile:scroll` (alias of swipe)
- `mobile:back`
- `mobile:pressKey`
- `mobile:hideKeyboard`

## Appium Endpoint
Configured with env vars:
```
APPIUM_PROTOCOL=http
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
APPIUM_PATH=/wd/hub
```
