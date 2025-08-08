import requests

base = 'http://localhost:3000'

# Start Android Chrome session
start = requests.post(f'{base}/session/start', json={
    'mobile': {
        'enabled': True,
        'platformName': 'Android',
        'deviceName': 'Android Emulator',
        'browserName': 'Chrome',
        'automationName': 'UiAutomator2'
    },
    'url': 'https://example.com'
}).json()

sid = start['sessionId']
print('Mobile start:', start['message'])

# Tap coordinates and swipe down
requests.post(f'{base}/session/{sid}/act', json={'action': 'mobile:tap', 'x': 100, 'y': 500})
requests.post(f'{base}/session/{sid}/act', json={'action': 'mobile:swipe', 'direction': 'down', 'duration': 300})

# Terminate
requests.delete(f'{base}/session/{sid}')
