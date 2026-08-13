import requests

res = requests.post('http://localhost:8000/api/auth/login', json={'email': 'admin@leaddesk.com', 'password': 'admin123'})
if res.status_code != 200:
    print('Login failed', res.text)
else:
    token = res.json().get('access_token')
    print('Logged in')
    res2 = requests.get('http://localhost:8000/api/leads', headers={'Authorization': f'Bearer {token}'})
    print('Leads status:', res2.status_code)
    print('Leads response:', res2.text[:500])
    res3 = requests.get('http://localhost:8000/api/admin/users', headers={'Authorization': f'Bearer {token}'})
    print('Users status:', res3.status_code)
    print('Users response:', res3.text[:500])
