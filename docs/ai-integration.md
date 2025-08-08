---
layout: default
title: AI Integration
nav_order: 4
---

# AI Integration

This server is AI-agnostic. Use it with LLMs and agent frameworks.

## Loop Pattern
1. Start session → get context
2. LLM decides action based on `context.interactiveElements`
3. POST action → receive `message`, `result`, new `context`
4. Repeat until done; terminate session

## Tips
- Use `label` or `text` to reason about elements
- Always act via `elementId`
- Handle `ELEMENT_NOT_FOUND`/`STALE_ELEMENT_REFERENCE` by re-fetching context, then retry
- Prefer `waitForDisplayed`/`waitForExist` before actions

## Python Pseudocode
```python
context = start_session(...)
while not done:
    action = llm_decide(context)
    resp = act(session_id, action)
    context = resp['context']
```
