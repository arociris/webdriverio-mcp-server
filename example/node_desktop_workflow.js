const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  const start = await fetch('http://localhost:3000/session/start', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://httpbin.org/forms/post', browserOptions: { headless: true } })
  });
  const startData = await start.json();
  const sid = startData.sessionId;
  console.log('Started:', startData.message);

  const act = async (payload) => (await fetch(`http://localhost:3000/session/${sid}/act`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })).json();

  await act({ action: 'waitForExist', elementId: 'input_email', timeout: 8000 });
  let res = await act({ action: 'setValue', elementId: 'input_email', value: 'test@example.com' });
  console.log(res.message);

  res = await act({ action: 'screenshot' });
  const hasShot = !!res.result?.screenshot;
  console.log(res.message, 'has screenshot:', hasShot);
  if (hasShot) {
    const { mkdir, writeFile } = await import('fs/promises');
    await mkdir('example/screenshots', { recursive: true });
    const outPath = `example/screenshots/${Date.now()}_workflow.png`;
    await writeFile(outPath, Buffer.from(res.result.screenshot, 'base64'));
    console.log('Saved screenshot to:', outPath);
  }

  await fetch(`http://localhost:3000/session/${sid}`, { method: 'DELETE' });
})();
