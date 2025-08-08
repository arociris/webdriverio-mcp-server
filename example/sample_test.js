// Start a session
let response = await fetch('http://localhost:3000/session/start', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    url: 'https://google.com',
    browserOptions: { headless: false }
  })
});

let { sessionId, context } = await response.json();
console.log(sessionId, context);
// Execute actions
response =await fetch(`http://localhost:3000/session/${sessionId}/act`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    action: 'keys',
    elementId: 'textarea_APjFqb',
    value: 'test input'
  })
});

let output= await response.json();
console.log(JSON.stringify(output, null, 2));
// Terminate session
await fetch(`http://localhost:3000/session/${sessionId}`, {
  method: 'DELETE'
});