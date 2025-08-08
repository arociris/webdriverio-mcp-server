const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  const start = await fetch('http://localhost:3000/session/start', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://httpbin.org/forms/post', browserOptions: { headless: true } })
  });
  let data = await start.json();
  const sid = data.sessionId;
  let context = data.context;

  const act = async (action) => (await fetch(`http://localhost:3000/session/${sid}/act`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(action) })).json();

  // Naive agent: type into the first input it sees
  const input = context.interactiveElements.find(e => e.type === 'input' || e.type === 'textarea');
  if (input) {
    const res = await act({ action: 'setValue', elementId: input.id, value: 'hello world' });
    console.log(res.message);
    context = res.context;
  }

  await fetch(`http://localhost:3000/session/${sid}`, { method: 'DELETE' });
})();
