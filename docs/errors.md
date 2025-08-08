---
layout: default
title: Errors
nav_order: 6
---

# Error Handling

## Schema
```json
{
  "status": "error",
  "code": "ELEMENT_NOT_FOUND",
  "message": "...",
  "suggestion": "...",
  "details": { },
  "timestamp": "..."
}
```

## Common Codes
- ELEMENT_NOT_FOUND
- ELEMENT_NOT_INTERACTABLE
- STALE_ELEMENT_REFERENCE
- TIMEOUT
- INVALID_ACTION
- INTERNAL_ERROR

## Retries
- Automatic retries with backoff for stale/detached/transient not-found
- After persistent failure: re-extract context, wait, or adjust selectors

## Troubleshooting
- Use wait actions (`waitForDisplayed`, `waitForExist`)
- Check `selector` fields in context
- Verify Appium device and endpoint
