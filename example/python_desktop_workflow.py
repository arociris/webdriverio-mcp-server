import requests, os, base64, time

base = 'http://localhost:3000'

# Start session
resp = requests.post(f'{base}/session/start', json={
    'url': 'https://httpbin.org/forms/post',
    'browserOptions': {'headless': True}
})
resp.raise_for_status()
start = resp.json()
sid = start['sessionId']
print('Started:', start['message'])

# Wait for element and set value
def act(payload):
    r = requests.post(f'{base}/session/{sid}/act', json=payload)
    r.raise_for_status()
    return r.json()

res = act({'action': 'waitForExist', 'elementId': 'input_email', 'timeout': 8000})
print(res['message'])

res = act({'action': 'setValue', 'elementId': 'input_email', 'value': 'test@example.com'})
print(res['message'])

# Screenshot and save
res = act({'action': 'screenshot'})
print(res['message'])
shot = res.get('result', {}).get('screenshot')
if shot:
    os.makedirs('example/screenshots', exist_ok=True)
    out_path = f"example/screenshots/{int(time.time()*1000)}_python.png"
    with open(out_path, 'wb') as f:
        f.write(base64.b64decode(shot))
    print('Saved screenshot to:', out_path)

# Terminate
requests.delete(f'{base}/session/{sid}')
