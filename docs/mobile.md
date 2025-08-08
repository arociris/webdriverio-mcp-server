---
layout: default
title: Mobile (Appium)
nav_order: 5
---

# Mobile (Appium)

## Requirements
- Appium server (CLI or Appium Desktop)
- Android SDK / Xcode
- Emulator/Simulator or real device

## Start Mobile Browser Session (Android)
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

## Start Native App (Android)
```http
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

## Actions
- Tap: `mobile:tap` (element or x,y)
- Swipe: `mobile:swipe` (up/down/left/right)
- Scroll: `mobile:scroll`
- Back: `mobile:back`
- Press key: `mobile:pressKey`
- Hide keyboard: `mobile:hideKeyboard`

## Appium Endpoint
Set with env vars:
```
APPIUM_PROTOCOL=http
APPIUM_HOST=127.0.0.1
APPIUM_PORT=4723
APPIUM_PATH=/wd/hub
```
