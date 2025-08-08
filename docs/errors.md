# Error Handling

## Standard Error Schema
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
- `ELEMENT_NOT_FOUND`
- `ELEMENT_NOT_INTERACTABLE`
- `STALE_ELEMENT_REFERENCE`
- `TIMEOUT`
- `INVALID_ACTION`
- `INTERNAL_ERROR`

## Retries
- Automatic retries with backoff for stale/detached/transient not-found
- After persistent failures, re-extract context, use waits, or adjust selectors

## Troubleshooting
- Use `waitForDisplayed` or `waitForExist` before actions
- Verify element `selector` from context
- For mobile, confirm Appium server and device readiness
