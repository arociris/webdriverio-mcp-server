const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

(async () => {
  // Desktop quick start
  let resp = await fetch('http://localhost:3000/session/start', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url: 'https://httpbin.org/forms/post', browserOptions: { headless: true } })
  });
  let data = await resp.json();
  const desktopSession = data.sessionId;
  console.log('Desktop start:', data.message, desktopSession);

  // Example action
  resp = await fetch(`http://localhost:3000/session/${desktopSession}/act`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action: 'screenshot' })
  });
  data = await resp.json();
  console.log('Action:', data.message, 'has screenshot:', !!data.result?.screenshot);
  if (hasShot) {
    const { mkdir, writeFile } = await import('fs/promises');
    await mkdir('example/screenshots', { recursive: true });
    const outPath = `example/screenshots/${Date.now()}_workflow.png`;
    await writeFile(outPath, Buffer.from(res.result.screenshot, 'base64'));
    console.log('Saved screenshot to:', outPath);
  }
  await fetch(`http://localhost:3000/session/${desktopSession}`, { method: 'DELETE' });

  // Uncomment if Appium is available
  // const mobileStart = await fetch('http://localhost:3000/session/start', {
  //   method: 'POST', headers: { 'Content-Type': 'application/json' },
  //   body: JSON.stringify({
  //     mobile: { enabled: true, platformName: 'Android', deviceName: 'Android Emulator', browserName: 'Chrome', automationName: 'UiAutomator2' },
  //     url: 'https://example.com'
  //   })
  // });
  // const mobileData = await mobileStart.json();
  // console.log('Mobile start:', mobileData.message, mobileData.sessionId);
})();
