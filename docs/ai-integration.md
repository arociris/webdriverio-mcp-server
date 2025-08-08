# AI Integration

The server is AI-agnostic and works with LLMs (OpenAI, Anthropic), LangChain, toolformer, or custom agents.

## Loop Pattern
1. Start session → get context
2. LLM decides action based on `context.interactiveElements`
3. POST action → receive message, result, updated context
4. Repeat until goal achieved; then terminate

## Tips
- Use `label`/`text` to locate semantic elements
- Rely on `elementId` for actions
- After errors like `ELEMENT_NOT_FOUND` or `STALE_ELEMENT_REFERENCE`, re-request context and retry
- Use `waitForDisplayed`/`waitForExist` before actions

## Example Pseudocode
```python
context = start_session(...)
while not done:
    action = llm_decide(context)
    resp = act(session_id, action)
    context = resp['context']
```
